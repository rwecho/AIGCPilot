import { transport } from "@/lib/mcp";

export async function GET(request: Request) {
  return await transport.handleRequest(request);
}

export async function POST(request: Request) {
  return await transport.handleRequest(request);
}
