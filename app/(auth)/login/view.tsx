"use client";

import { useTransition } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@weblockin.local", password: "password123" }
  });

  const onSubmit = (values: LoginValues) => {
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false
      });

      if (result?.error) {
        toast.error("Invalid login credentials.");
        return;
      }

      window.location.href = "/dashboard";
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" {...form.register("password")} />
          </div>
          <Button className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Login"}
          </Button>
          <p className="text-xs text-muted-foreground">Seed login: `admin@weblockin.local` / `password123`</p>
        </form>
      </CardContent>
    </Card>
  );
}
