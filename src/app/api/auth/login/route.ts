import { prisma } from "@/lib/prisma"
import { signToken } from "@/lib/auth"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { username, password } = await req.json()

  // 1. 查找用户
  let user = await prisma.admin.findUnique({ where: { username } })

  // 2. 初始化默认管理员 (如果数据库为空)
  if (!user && username === 'admin' && password === 'admin123') {
    const hashedPassword = await bcrypt.hash(password, 10)
    user = await prisma.admin.create({
      data: { username, passwordHash: hashedPassword }
    })
  }

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 401 })
  }

  // 3. 验证密码
  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 })
  }

  // 4. 签发 Token
  const token = await signToken({ id: user.id, username: user.username })
  
  const response = NextResponse.json({ success: true, username: user.username })
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/'
  })

  return response
}
