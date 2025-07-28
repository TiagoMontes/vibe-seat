"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User, Lock } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  loginZodSchema,
  type LoginZodFormData,
} from "@/app/schemas/loginSchema";
import { useToast } from "@/app/hooks/useToast";

const Login = () => {
  const { login, loading, setLoading } = useAuth();
  const { success, error } = useToast();

  const form = useForm<LoginZodFormData>({
    resolver: zodResolver(loginZodSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginZodFormData) => {
    const result = await login(data);

    if (result.success) {
      success("Login realizado com sucesso!");
      form.reset(); // Limpar formulário após sucesso
    } else {
      setLoading(false);
      error(result.error || "Erro ao fazer login");
    }
  };

  const isLoading = loading || form.formState.isSubmitting;

  return (
    <Card className="w-full p-4 max-w-md lg:border lg:border-gray-300">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-blue-600 mb-2">
          VibeSeat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Digite seu usuário"
                          className="pl-10 bg-white"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="Digite sua senha"
                          className="pl-10 bg-white"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Login;
