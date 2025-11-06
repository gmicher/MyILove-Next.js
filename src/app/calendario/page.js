'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Page() {
  useEffect(() => {
    // Lucide stub (evita erro se script ainda não carregou)
    if (typeof window !== 'undefined' && !window.lucide) { window.lucide = { createIcons: () => {} }; }

    // Aguardar DOM montado para ligar eventos com segurança
    requestAnimationFrame(() => {
      // (Sem JS específico desta página)

      // Recriar ícones após quaisquer mutações
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
      <div dangerouslySetInnerHTML={{ __html: 
  <div class="container">

    <!-- Barra lateral de navegação    -->
    <nav class="sidebar">
      <h2>MyILove 💕</h2> <!-- Identidade da aplicação (branding) -->

      <!-- Menu principal -->
      <ul>
        <!-- Cada item do menu possui um ícone (Lucide) + texto -->
        <!-- A classe "active" marca qual página está sendo exibida -->
        <li><a href="dashboard.html"><i data-lucide="home"></i> Início</a></li>
        <li><a href="/eventos" class="active"><i data-lucide="calendar"></i> Eventos</a></li>
        <li><a href="/desejos"><i data-lucide="heart"></i> Desejos</a></li>
        <li><a href="/anotacoes"><i data-lucide="file-text"></i> Anotações</a></li>
        <li><a href="/fotos"><i data-lucide="camera"></i> Fotos</a></li>
        <li><a href="/viagens"><i data-lucide="map"></i> Viagens</a></li>
        <li><a href="/realizadas"><i data-lucide="check-circle"></i> Realizadas</a></li>
        <li><a href="/config"><i data-lucide="settings"></i> Configurações</a></li>
      </ul>
    </nav>

    <!-- Conteúdo principal da página  -->
    <main class="content">
      <h2>Eventos ✨</h2>
      <p>Aqui você pode registrar encontros, datas importantes e planos futuros.</p>
      <!-- Esta seção poderá futuramente ser expandida com cards, calendário ou lista de eventos -->
    </main>
  </div>

  <!-- Script principal da aplicação -->
  

  <!-- Inicialização dos ícones Lucide (gera os SVGs nos elementos <i>) -->
  
 }} />
    </>
  );
}
