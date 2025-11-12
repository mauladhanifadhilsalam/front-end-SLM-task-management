import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/auth";
import Swal from "sweetalert2";
import ReCAPTCHA from "react-google-recaptcha";


import { loginSchema, type LoginValues, type LoginField } from "@/schemas/login-user.schema";

type FieldErrors = Partial<Record<LoginField, string>>;

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const navigate = useNavigate();

  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("");
  const [verified, setVerified] = useState(false);


  function validateAll(v: LoginValues): FieldErrors {
    const parsed = loginSchema.safeParse(v);
    if (parsed.success) return {};
    const next: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0] as LoginField | undefined;
      if (path && !next[path]) next[path] = issue.message;
    }
    return next;
  }

  function validateField(name: LoginField, value: string) {
    const singleSchema = (loginSchema as any).pick({ [name]: true });
    const res = singleSchema.safeParse({ [name]: value });
    setErrors((prev) => ({
      ...prev,
      [name]: res.success ? undefined : res.error.issues[0]?.message,
    }));
  }


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
    name: LoginField
  ) {
    const val = e.target.value;
    setValues((p) => ({ ...p, [name]: val }));
    if (errors[name]) validateField(name, val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = validateAll(values);
    setErrors(nextErrors);

    // ❗ Jika kosong → hanya inline error, TIDAK pakai Swal
    const isEmpty = values.email.trim() === "" || values.password === "";
    if (isEmpty && (nextErrors.email || nextErrors.password)) {
      return;
    }

    // ❗ Kalau tidak kosong tapi masih invalid (format email / min length)
    const firstErrorKey = (["email", "password"] as LoginField[]).find(
      (k) => nextErrors[k]
    );
    if (firstErrorKey) {
      Swal.fire({
        icon: "warning",
        title: firstErrorKey === "email" ? "Email tidak valid" : "Password tidak valid",
        text: nextErrors[firstErrorKey]!,
      });
      return;
    }

    setLoading(true);
    try {
      const data = await login(values.email, values.password);
      const role = data.user.role;

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("role", role);
      localStorage.setItem("email", data.user.email ?? "");

      const to =
        role === "admin"
          ? "/admin/dashboard"
          : role === "project_manager"
          ? "/project-manager/dashboard"
          : role === "developer"
          ? "/developer/dashboard"
          : "/user/dashboard";

      setRedirectTo(to);

      Swal.fire({
        icon: "success",
        title: "Berhasil masuk",
        text: "Anda akan diarahkan ke dashboard.",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err: any) {
      const message = "Login gagal. Periksa email/password.";
      Swal.fire({
        icon: "error",
        title: "Login gagal",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleVerifiedChange = (value: string | null) => {
    console.log("Captcha value:", value);
    setVerified(true);
  };

  useEffect(() => {
    if (redirectTo) {
      const t = setTimeout(() => navigate(redirectTo), 350);
      return () => clearTimeout(t);
    }
  }, [redirectTo, navigate]);

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
      noValidate
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center mb-5">
          <h1 className="text-3xl font-bold text-primary">Project Management</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Masukkan email dan password untuk login
          </p>
        </div>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={(e) => handleChange(e, "email")}
            onBlur={() => validateField("email", values.email)}
            aria-invalid={!!errors.email}
            required
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </Field>

        {/* Password */}
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={values.password}
            onChange={(e) => handleChange(e, "password")}
            onBlur={() => validateField("password", values.password)}
            aria-invalid={!!errors.password}
            required
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </Field>


        <div className="w-full flex justify-center">
          <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={handleVerifiedChange}/>
        </div>
        <Button type="submit" disabled={loading || !verified}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </FieldGroup>
    </form>
  );
}
