import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { prisma } from "./prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Helper for S3/R2 client
function getS3Client() {
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT_URL) {
    throw new Error("Cloudflare R2 credentials are missing in .env");
  }

  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT_URL,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    }
  });
}

// Initialize the MCP server
export const server = new McpServer({
  name: "AIGCPilot-Internal-MCP",
  version: "1.0.0",
});

// Create standard Web Transport
export const transport = new WebStandardStreamableHTTPServerTransport({
  sessionIdGenerator: () => crypto.randomUUID(),
});

// --- TOOL REGISTRATIONS (Using non-deprecated registerTool) ---

// Tool: Search AI Products
server.registerTool(
  "search_tools",
  {
    description: "Search for AI tools and products in the AIGCPilot directory by keyword",
    inputSchema: {
      query: z.string().describe("The search query (e.g. 'video editor', 'image generation', 'cursor')"),
      limit: z.number().optional().describe("Maximum number of results to return (default: 5)"),
    }
  },
  async ({ query, limit = 5 }) => {
    try {
      const tools = await prisma.tool.findMany({
        where: {
          isDeleted: false,
          OR: [
            { title_zh: { contains: query, mode: "insensitive" } },
            { title_en: { contains: query, mode: "insensitive" } },
            { summary_zh: { contains: query, mode: "insensitive" } },
            { summary_en: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        include: {
          category: { select: { name_zh: true, name_en: true } },
        },
      });

      if (tools.length === 0) {
        return {
          content: [{ type: "text", text: `No tools found matching "${query}".` }],
        };
      }

      const results = tools.map((tool) => ({
        id: tool.id,
        title: tool.title_zh || tool.title_en,
        category: tool.category.name_zh,
        summary: tool.summary_zh || tool.summary_en,
        url: tool.url,
        rate: tool.rate,
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Database error: ${String(error)}` }],
      };
    }
  }
);

// Tool: Get specific Tool Details
server.registerTool(
  "get_tool_details",
  {
    description: "Get detailed information about a specific AI tool including its full content by ID",
    inputSchema: {
      toolId: z.string().describe("The ID of the tool to retrieve"),
    }
  },
  async ({ toolId }) => {
    try {
      const tool = await prisma.tool.findUnique({
        where: { id: toolId, isDeleted: false },
        include: {
          category: { select: { name_zh: true, name_en: true } },
        },
      });

      if (!tool) {
        return {
          isError: true,
          content: [{ type: "text", text: `Tool with ID ${toolId} not found.` }],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(tool, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Database error: ${String(error)}` }],
      };
    }
  }
);

// Tool: List Categories
server.registerTool(
  "list_categories",
  {
    description: "Get all AI tool categories available in the directory",
    inputSchema: z.object({})
  },
  async () => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name_en: "asc" },
      });

      return {
        content: [{ type: "text", text: JSON.stringify(categories, null, 2) }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Database error: ${String(error)}` }],
      };
    }
  }
);

// Tool: Create Article
server.registerTool(
  "create_article",
  {
    description: "Create a new article or news item in the database",
    inputSchema: {
      title: z.string().describe("Article title"),
      slug: z.string().describe("URL friendly slug"),
      content: z.string().describe("Markdown content of the article"),
      coverImage: z.string().optional().describe("URL to the cover image"),
      author: z.string().optional().describe("Author name"),
      status: z.enum(["PUBLISHED", "DRAFT"]).optional().describe("Publication status (default: DRAFT)"),
    }
  },
  async (args) => {
    try {
      const article = await prisma.article.create({
        data: {
          title: args.title,
          slug: args.slug,
          content: args.content,
          coverImage: args.coverImage,
          author: args.author,
          status: args.status || "DRAFT"
        }
      });
      return {
        content: [{ type: "text", text: `Article created successfully: ${article.id}` }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Failed to create article: ${String(error)}` }],
      };
    }
  }
);

// Tool: Upload Image
server.registerTool(
  "upload_image",
  {
    description: "Upload an image (base64) to Cloudflare R2 storage and get the public URL",
    inputSchema: {
      base64: z.string().describe("Base64 encoded image data (with or without data:image/...;base64, prefix)"),
      filename: z.string().describe("Desired filename with expansion (e.g. 'hero.png')"),
      contentType: z.string().optional().describe("MIME type of the image (e.g. 'image/png'). Guessed if not provided."),
    }
  },
  async ({ base64, filename, contentType }) => {
    try {
      const bucketName = process.env.R2_BUCKET_NAME;
      const publicUrl = process.env.R2_PUBLIC_URL;

      if (!bucketName || !publicUrl) {
        throw new Error("R2 bucket configuration missing in .env");
      }

      // Clean base64 data
      const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');

      const s3 = getS3Client();
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueKey = `mcp-uploads/${Date.now()}-${safeFilename}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: buffer,
        ContentType: contentType || "image/png",
      });

      await s3.send(command);
      const finalUrl = `${publicUrl.replace(/\/$/, '')}/${uniqueKey}`;

      return {
        content: [{ type: "text", text: finalUrl }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text", text: `Upload failed: ${String(error)}` }],
      };
    }
  }
);

// Connect the transport to the server securely (one-time)
if (!(global as any)._mcpConnected) {
  server.connect(transport).catch(console.error);
  (global as any)._mcpConnected = true;
}
