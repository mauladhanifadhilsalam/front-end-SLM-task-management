// login form toast
import * as React from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { login } from "@/services/auth";
import {
  loginSchema,
  type LoginValues,
  type LoginField,
} from "@/schemas/login-user.schema";

import { IconEye, IconEyeOff } from "@tabler/icons-react";

type FieldErrors = Partial<Record<LoginField, string>>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate();

  const [values, setValues] = React.useState<LoginValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [loading, setLoading] = React.useState(false);
  const [redirectTo, setRedirectTo] = React.useState("");
  const [verified, setVerified] = React.useState(false);

  // 👁️ state show/hide password
  const [showPassword, setShowPassword] = React.useState(false);

  // === VALIDATE ALL ===
  function validateAll(v: LoginValues): FieldErrors {
    const parsed = loginSchema.safeParse(v);
    if (parsed.success) return {};

    const next: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0] as LoginField;
      if (path && !next[path]) next[path] = issue.message;
    }
    return next;
  }

  // === VALIDATE ONE FIELD ===
  function validateField(name: LoginField, value: string) {
    const singleSchema = (loginSchema as any).pick({ [name]: true });
    const res = singleSchema.safeParse({ [name]: value });

    setErrors((prev) => ({
      ...prev,
      [name]: res.success ? undefined : res.error.issues[0]?.message,
    }));
  }

  // === HANDLE INPUT ===
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
    name: LoginField
  ) {
    const val = e.target.value;
    setValues((prev) => ({ ...prev, [name]: val }));

    if (errors[name]) validateField(name, val);
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = validateAll(values);
    setErrors(nextErrors);

    const isEmpty =
      values.email.trim() === "" || values.password.trim() === "";

    if (isEmpty && (nextErrors.email || nextErrors.password)) return;

    const firstErrorKey = (["email", "password"] as LoginField[]).find(
      (k) => nextErrors[k]
    );

    if (firstErrorKey) {
      toast.warning(
        firstErrorKey === "email" ? "Email tidak valid" : "Password tidak valid",
        {
          description: nextErrors[firstErrorKey]!,
        }
      );
      return;
    }

    if (!verified) {
      toast.warning("Captcha belum diverifikasi", {
        description: "Silakan centang captcha terlebih dahulu.",
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

      toast.success("Berhasil masuk", {
        description: "Anda akan diarahkan ke dashboard.",
      });
    } catch (err) {
      toast.error("Login gagal", {
        description: "Periksa email atau password Anda.",
      });
    } finally {
      setLoading(false);
    }
  }

  // === CAPTCHA ===
  const handleVerifiedChange = (value: string | null) => {
    setVerified(!!value);
  };

  // === REDIRECT ===
  React.useEffect(() => {
    if (redirectTo) {
      const t = setTimeout(() => navigate(redirectTo), 400);
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
        {/* Header Form */}
        <div className="flex flex-col items-center gap-1 text-center mb-5">
          <h1 className="text-3xl font-bold text-primary">
            Project Management
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            Masukkan email dan password untuk login
          </p>
        </div>

        {/* EMAIL */}
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


        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={values.password}
              onChange={(e) => handleChange(e, "password")}
              onBlur={() => validateField("password", values.password)}
              aria-invalid={!!errors.password}
              required
            />


            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <IconEyeOff className="w-5 h-5" />
              ) : (
                <IconEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </Field>

        {/* CAPTCHA */}
        <div className="w-full flex justify-center">
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={handleVerifiedChange}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <Button type="submit" disabled={loading || !verified}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </FieldGroup>
    </form>
  );
}
