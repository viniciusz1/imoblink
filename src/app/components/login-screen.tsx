import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Lock, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "admin" && password === "admin") {
      navigate("/imoveis");
    } else {
      setError("Usuário ou senha incorretos");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Theme toggle - posição fixa no canto superior direito */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background sólido */}
      <div className="absolute inset-0 bg-[#0A4F6E] dark:bg-[#0d1b2a]" />

      {/* Elementos decorativos */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#2ECC71]/15 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#E67E22]/10 rounded-full blur-3xl" />

      {/* Container do formulário */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Logo e título */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">ImobLink</h1>
            <p className="text-[#2ECC71]/80">Bem-vindo de volta</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de usuário */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2ECC71]/70 w-5 h-5" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/40 focus:border-[#2ECC71] focus:ring-[#2ECC71]"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            {/* Campo de senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2ECC71]/70 w-5 h-5" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/40 focus:border-[#2ECC71] focus:ring-[#2ECC71]"
                  placeholder="Digite sua senha"
                  required
                />
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="text-red-300 text-sm text-center bg-red-500/20 py-2 px-3 rounded-lg border border-red-400/30">
                {error}
              </div>
            )}

            {/* Link esqueceu a senha */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-[#2ECC71] hover:text-[#2ECC71]/80 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Forgot password clicked");
                }}
              >
                Esqueceu a senha?
              </a>
            </div>

            {/* Botão de login */}
            <Button
              type="submit"
              className="w-full bg-[#2ECC71] hover:bg-[#27ae60] text-white font-semibold py-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Entrar
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/70">
              Não tem uma conta?{" "}
              <a
                href="#"
                className="text-[#2ECC71] hover:text-[#2ECC71]/80 transition-colors font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Sign up clicked");
                }}
              >
                Cadastre-se
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
