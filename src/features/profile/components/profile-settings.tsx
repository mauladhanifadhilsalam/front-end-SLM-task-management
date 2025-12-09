"use client"

import * as React from "react"
import {
  IconKey,
  IconEye,
  IconEyeOff,
  IconUser,
  IconPalette,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProfileSettings } from "../hooks/use-profile-settings"
import { cn } from "@/lib/utils"

const roleLabel = (role?: string) => {
  if (!role) return "-"
  if (role === "ADMIN") return "Admin"
  if (role === "PROJECT_MANAGER") return "Project Manager"
  if (role === "DEVELOPER") return "Developer"
  return role
}

const initials = (name?: string, email?: string) => {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return "US"
}

export function ProfileSettings() {
  const {
    profile,
    profileForm,
    profileErrors,
    passwordForm,
    passwordErrors,
    changingPassword,
    errorMessage,
    theme,
    handlePasswordChange,
    handlePasswordBlur,
    submitPassword,
    applyThemePreference,
  } = useProfileSettings()

  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showOldPassword, setShowOldPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState<"profile" | "appearance">("profile")
  const [selectedTheme, setSelectedTheme] = React.useState<"light" | "dark">("light")

  const avatarPreview = profileForm.avatarUrl || profile?.avatarUrl || undefined

  React.useEffect(() => {
    if (theme === "dark" || theme === "light") {
      setSelectedTheme(theme)
    }
  }, [theme])

  const handleApplyTheme = () => {
    applyThemePreference({ theme: selectedTheme })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Kelola profil akun dan keamanan password kamu.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <Card className="h-fit">
          <CardContent className="p-4">
            <div className="flex flex-col gap-1">
              {[
                { key: "profile", label: "Profile", icon: IconUser },
                { key: "appearance", label: "Appearance", icon: IconPalette },
              ].map((item) => {
                const isActive = activeSection === item.key
                const Icon = item.icon
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSection(item.key as any)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted",
                      isActive && "bg-muted text-foreground font-medium",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {activeSection === "profile" && (
            <>
              <Card>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} />
                      ) : (
                        <AvatarFallback>
                          {initials(profile?.fullName, profile?.email)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{profile?.fullName}</CardTitle>
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {roleLabel(profile?.role)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama lengkap</Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        readOnly
                        disabled
                        placeholder="Nama lengkap"
                        aria-invalid={!!profileErrors.fullName}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        readOnly
                        disabled
                        placeholder="user@example.com"
                        aria-invalid={!!profileErrors.email}
                      />
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ganti Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-3" onSubmit={submitPassword} noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password lama</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showOldPassword ? "text" : "password"}
                          value={passwordForm.password}
                          onChange={(e) => handlePasswordChange("password", e.target.value)}
                          onBlur={() => handlePasswordBlur("password")}
                          disabled={changingPassword}
                          aria-invalid={!!passwordErrors.password}
                          className={cn(
                            passwordErrors.password &&
                              "border-destructive focus-visible:ring-destructive/40",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                        >
                          {showOldPassword ? (
                            <IconEyeOff className="h-4 w-4" />
                          ) : (
                            <IconEye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.password && (
                        <p className="text-xs text-destructive">{passwordErrors.password}</p>
                      )}

                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Password baru</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            handlePasswordChange("newPassword", e.target.value)
                          }
                          onBlur={() => handlePasswordBlur("newPassword")}
                          disabled={changingPassword}
                          aria-invalid={!!passwordErrors.newPassword}
                          className={cn(
                            passwordErrors.newPassword &&
                              "border-destructive focus-visible:ring-destructive/40",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? (
                            <IconEyeOff className="h-4 w-4" />
                          ) : (
                            <IconEye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-destructive">
                          {passwordErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Konfirmasi password baru
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            handlePasswordChange("confirmPassword", e.target.value)
                          }
                          onBlur={() => handlePasswordBlur("confirmPassword")}
                          disabled={changingPassword}
                          aria-invalid={!!passwordErrors.confirmPassword}
                          className={cn(
                            passwordErrors.confirmPassword &&
                              "border-destructive focus-visible:ring-destructive/40",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <IconEyeOff className="h-4 w-4" />
                          ) : (
                            <IconEye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-destructive">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={changingPassword}
                        className="gap-2"
                      >
                        <IconKey className="h-4 w-4" />
                        {changingPassword ? "Mengganti..." : "Ganti Password"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Pilih tema untuk dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(["light", "dark"] as const).map((value) => {
                      const isActive = selectedTheme === value
                      return (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setSelectedTheme(value)}
                          className={cn(
                            "w-full rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isActive
                              ? "border-foreground shadow-md"
                              : "border-border hover:border-foreground/50",
                          )}
                        >
                          <div
                            className={cn(
                              "mb-3 h-28 w-full rounded-md border p-3",
                              value === "light"
                                ? "border-slate-200 bg-slate-50"
                                : "border-slate-800 bg-slate-900",
                            )}
                          >
                            <div
                              className={cn(
                                "h-3 w-2/3 rounded",
                                value === "light"
                                  ? "bg-slate-200"
                                  : "bg-slate-700",
                              )}
                            />
                            <div
                              className={cn(
                                "mt-3 h-3 w-full rounded",
                                value === "light"
                                  ? "bg-slate-200"
                                  : "bg-slate-700",
                              )}
                            />
                            <div
                              className={cn(
                                "mt-2 h-3 w-5/6 rounded",
                                value === "light"
                                  ? "bg-slate-200"
                                  : "bg-slate-700",
                              )}
                            />
                            <div
                              className={cn(
                                "mt-2 h-3 w-2/3 rounded",
                                value === "light"
                                  ? "bg-slate-200"
                                  : "bg-slate-700",
                              )}
                            />
                          </div>
                          <div className="text-sm font-medium capitalize">
                            {value}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleApplyTheme}
                  >
                    Update preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
