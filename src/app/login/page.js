'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Page() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lucide stub (evita erro se o script ainda não carregou)
    if (!window.lucide) window.lucide = { createIcons: () => {} };

    // (Sem JS específico desta página)
    requestAnimationFrame(() => {
      try { window.lucide?.createIcons?.(); } catch {}
    });
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/style.css" />
      <Script
        src="https://unpkg.com/lucide@latest"
        strategy="afterInteractive"
        onLoad={() => { try { window.lucide?.createIcons?.(); } catch {} }}
      />

      <div
        dangerouslySetInnerHTML={{
          __html: `
    <!--CONTAINER PRINCIPAL DO LOGIN-->
    <div class="login-container">
        <!-- Ícone/Logo do App -->
        <div class="logo">💕</div>

        <!-- Nome do App -->
        <h1 class="app-name">CoupleConnect</h1>

        <!-- Subtítulo/descrição do login -->
        <p class="subtitle">Conecte-se com seu amor</p>
        
        <!-- FORMULÁRIO DE LOGIN -->
        <form id="loginForm">
            <!-- Grupo de input para email -->
            <div class="input-group">
                <input 
                    type="email"             
                    id="email"               
                    class="input-field"      
                    placeholder="E-mail"
                    required                 
                >
                
                <!-- Mensagem de erro do email -->
                <div class="error-message" id="emailError"></div>
            </div>
            
            <!-- Grupo de input para senha -->
            <div class="input-group">
                <input 
                    type="password"
                    id="password"
                    class="input-field"
                    placeholder="Senha"
                    required
                >
                <!-- Mensagem de erro da senha -->
                <div class="error-message" id="passwordError"></div>
            </div>
            
            <!-- Botão de login -->
            <button type="submit" class="login-button">Entrar</button>
            
            <!-- Mensagem de sucesso -->
            <div class="success-message" id="successMessage">
                Login realizado com sucesso!
            </div>
        </form>
        
        <!-- Link para senha esquecida -->
        <a href="#" class="forgot-password">Esqueceu sua senha?</a>
        
        <!-- Divider (linha separadora com "ou") -->
        <div class="divider">
            <span>ou</span>
        </div>
        
        <!-- Link para cadastro -->
        <p class="signup-link">
            Não tem uma conta? <a href="#" id="signupLink">Cadastre-se</a>
        </p>
    </div>

    <!--SCRIPT DE INTERAÇÃO-->
          `,
        }}
      />
    </>
  );
}
