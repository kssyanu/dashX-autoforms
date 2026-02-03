"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="card w-full lg:w-[70%] max-w-[1200px] flex flex-col lg:flex-row justify-between h-auto lg:h-[600px] rounded-xl border bg-card shadow-2xl overflow-hidden">
        {/* Left Section - Form */}
        <div
          className="w-full lg:w-1/2 px-6 lg:px-16 py-10 relative overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Gradient Effect */}
          <div
            className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-purple-300/20 via-blue-300/20 to-pink-300/20 rounded-full blur-3xl transition-opacity duration-200 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
              transition: "transform 0.1s ease-out",
            }}
          />

          {/* Logo */}
          <div className="mb-8 flex items-center space-x-2 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-2xl font-bold">DashX</span>
          </div>

          {/* Form Content */}
          <div className="relative z-10 h-full flex flex-col justify-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold">Bem-vindo de volta</h1>
                <p className="text-sm text-muted-foreground">
                  Entre com suas credenciais para acessar o dashboard
                </p>
              </div>

              <LoginForm />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Não tem uma conta?
                  </span>
                </div>
              </div>

              <Link href="/cadastro">
                <button className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]">
                  Criar conta
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section - Image/Illustration */}
        <div className="hidden lg:block w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20" />
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070"
            alt="Dashboard Analytics"
            width={1000}
            height={600}
            priority
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Inteligência de Marketing
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Centralize seus dados de Meta Ads e Google Ads em um único dashboard poderoso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
