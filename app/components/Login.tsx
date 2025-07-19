"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { User, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await login({ username, password });
  };

  return (
    <Card className="w-full max-w-md lg:border lg:border-gray-300">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-blue-600 mb-2">
          VibeSeat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div>
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p className="mb-2 font-medium">Usuários de teste:</p>
          <div className="space-y-1 text-xs">
            <p>
              <strong>Admin:</strong> admin / admin123
            </p>
            <p>
              <strong>User:</strong> user / user123
            </p>
            <p>
              <strong>Manager:</strong> manager / manager123
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p className="mb-2 font-medium">Cenários de erro:</p>
          <div className="space-y-1 text-xs">
            <p>
              <strong>Erro 500</strong>
            </p>
            <p>
              <strong>Usuário bloqueado</strong>
            </p>
            <p>
              <strong>Credenciais inválidas</strong>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Login;
