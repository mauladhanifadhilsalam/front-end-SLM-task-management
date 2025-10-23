import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { login, RoleApi } from "@/services/auth"
import Swal from "sweetalert2"
import axios from "axios"

export function LoginForm({
  className,
  roleType = "user",
  ...props
}: React.ComponentProps<"form"> & { roleType?: "admin" | "user" }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justLoggedIn, setJustLoggedIn] = useState(false)
  const [redirectTo, setRedirectTo] = useState("") // 🔹 simpan path tujuan
  const navigate = useNavigate()

  const allowed: RoleApi[] =
    roleType === "admin"
      ? ["admin"]
      : ["project_manager", "developer"]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await login(email, password)
      const role = data.user.role

      if (!allowed.includes(role)) {
        throw new Error("Akun tidak diizinkan untuk halaman ini.")
      }

      localStorage.setItem("token", data.accessToken)
      localStorage.setItem("role", role)
      localStorage.setItem("email", data.user.email ?? "")

      const to =
        role === "admin"
          ? "/admin/dashboard"
          : role === "project_manager"
          ? "/project-manager/dashboard"
          : "/developer/dashboard"

      setRedirectTo(to)
      setJustLoggedIn(true)
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
    if (!justLoggedIn) return

    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    if (!token || !role) return

    let apiUrl = ""
    switch (role) {
      case "admin":
        apiUrl = "http://localhost:3000/admin-dashboard"
        break
      case "project_manager":
        apiUrl = "http://localhost:3000/pm-dashboard"
        break
      case "developer":
        apiUrl = "http://localhost:3000/developer-dashboard"
        break
      default:
        return
    }

    axios
      .get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        Swal.fire({
          title: "Berhasil Login!",
          text: res.data?.message || "Selamat datang di dashboard!",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        })

        if (redirectTo) navigate(redirectTo)
      })
      .catch((err) => {
        Swal.fire({
          title: "Error!",
          text:
            err.response?.data?.message ||
            err.message ||
            "Gagal memuat dashboard",
          icon: "error",
          confirmButtonText: "Coba Lagi",
        })
      })
  }, [justLoggedIn, redirectTo, navigate])

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
            Enter your email below to login to your account
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
