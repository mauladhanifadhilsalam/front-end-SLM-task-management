import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "@/services/auth"
import Swal from "sweetalert2"

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectTo, setRedirectTo] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await login(email, password)
      const role = data.user.role


      localStorage.setItem("token", data.accessToken)
      localStorage.setItem("role", role)
      localStorage.setItem("email", data.user.email ?? "")


      const to =
        role === "admin"
          ? "/admin/dashboard"
          : role === "project_manager"
          ? "/project-manager/dashboard"
          : role === "developer"
          ? "/developer/dashboard"
          : "/user/dashboard"

      setRedirectTo(to)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Login gagal. Periksa email/password."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (redirectTo) {
      setTimeout(() => navigate(redirectTo))
    }
  }, [redirectTo, navigate])

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center mb-5">
          <h1 className="text-3xl font-bold text-blue-800/100">
            Project Management
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            Masukkan email dan password untuk login
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </FieldGroup>
    </form>
  )
}
