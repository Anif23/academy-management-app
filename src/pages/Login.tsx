import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import { loginSchema } from "../schemas/loginSchema";
import type { LoginFormValues } from "../schemas/loginSchema";
import { authApi, DEMO_CREDENTIALS } from "../services/authApi";
import { useAuthStore } from "../store/authStore";
import { useBrandingStore } from "../store/brandingStore";
import { toastSuccess } from "../store/toastStore";
import { Button } from "../components/ui/Button";
import { FieldError, Input, Label } from "../components/ui/Field";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const appName = useBrandingStore((s) => s.appName);
  const logoDataUrl = useBrandingStore((s) => s.logoDataUrl);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError("");
    try {
      const user = await authApi.login(values.email, values.password);
      login(user);
      toastSuccess("Welcome back!", `Logged in as ${user.name}`);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Login failed.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl ${
              logoDataUrl ? "bg-transparent" : "bg-brand-600"
            }
           text-white shadow-soft`}
          >
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt={appName}
                className="h-full w-full object-cover"
              />
            ) : (
              <GraduationCap className="h-6 w-6" />
            )}
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            Welcome to {appName}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Sign in to manage your academy operations.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                {serverError}
              </div>
            )}

            <div>
              <Label htmlFor="email" required>
                Email address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@acadmey.com"
                  className="pl-9"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <Label htmlFor="password" required>
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-border bg-surface-muted px-4 py-3 text-xs text-text-muted">
            <p className="font-medium text-text-secondary">Demo credentials</p>
            <p className="mt-1">Email: {DEMO_CREDENTIALS.email}</p>
            <p>Password: {DEMO_CREDENTIALS.password}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
