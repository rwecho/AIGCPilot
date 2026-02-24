"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Lock } from "lucide-react"
import { useAppStore } from "@/lib/store/useAppStore"

export default function LoginPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'zh'
  const [loading, setLoading] = useState(false)
  const { setUser } = useAppStore()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '登录失败')
      }

      setUser({ username: data.username })
      toast.success(locale === 'zh' ? "登录成功" : "Login Successful")
      router.push(`/${locale}/admin`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {locale === 'zh' ? "管理员登录" : "Admin Login"}
          </CardTitle>
          <CardDescription>
            {locale === 'zh' ? "请输入您的凭据以管理站点" : "Enter your credentials to manage the portal"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{locale === 'zh' ? "用户名" : "Username"}</Label>
              <Input id="username" name="username" type="text" placeholder="admin" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{locale === 'zh' ? "密码" : "Password"}</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : (locale === 'zh' ? "登录" : "Login")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t py-4 bg-muted/50 rounded-b-lg">
          <p className="text-xs text-muted-foreground">
            {locale === 'zh' ? "忘记密码？请联系系统管理员" : "Forgot password? Contact system admin"}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
