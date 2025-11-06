'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Page() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lucide stub (evita erro se script ainda não carregou)
    if (!window.lucide) { window.lucide = { createIcons: () => {} }; }

    // Aguardar DOM montado para ligar eventos com segurança
    requestAnimationFrame(() => {
      // Lucide + marcação do link ativo (mantém seu código atual)
      try { window.lucide?.createIcons?.(); } catch {}

      const current = location.pathname.split('/').pop() || 'index.html';
      (document.querySelectorAll('.sidebar a') || []).forEach(a => {
        const href = a.getAttribute('href');
        if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
      });

      // ===== ATUALIZA CONTADORES DA DASHBOARD =====
      updateDashboardStats();

      // ===== AÇÕES RÁPIDAS (HOME) =====
      const qa = document.querySelector('.quick-actions .buttons');
      if (qa) {
        const [eventBtn, wishBtn, noteBtn, photoBtn] = qa.querySelectorAll('button') || [];
        eventBtn?.addEventListener('click', () => goQuick('event', '/eventos'));
        wishBtn?.addEventListener('click', () => goQuick('wish',  '/desejos'));
        noteBtn?.addEventListener('click', () => goQuick('note',  '/anotacoes'));
        photoBtn?.addEventListener('click', () => goQuick('photo', '/fotos'));
      }

      // ===== AUTO-ABRIR MODAL NA PÁGINA DE DESTINO =====
      const flag = localStorage.getItem('myilove_quick_open');
      if (flag) {
        const page = location.pathname.replace(/^\//, '') || 'index.html';
        const openerMap = {
          event: ['eventos',   () => window.openEventModal?.()],
          wish:  ['desejos',   () => window.openWishModal?.()],
          note:  ['anotacoes', () => window.openNoteModal?.()],
          photo: ['fotos',     () => window.openPhotoModal?.()],
        };
        const cfg = openerMap[flag];
        if (cfg && page.startsWith(cfg[0])) {
          setTimeout(() => { try { cfg[1]?.(); } catch {} }, 0);
          localStorage.removeItem('myilove_quick_open');
        }
      }
    });

    // Função utilitária: grava a intenção e navega
    function goQuick(key, href) {
      try { localStorage.setItem('myilove_quick_open', key); } catch {}
      location.href = href;
    }

    // ===== ATUALIZA CONTADORES DA PÁGINA PRINCIPAL =====
    function updateDashboardStats() {
      const events    = JSON.parse(localStorage.getItem('events'))    || [];
      const wishes    = JSON.parse(localStorage.getItem('wishes'))    || [];
      const notes     = JSON.parse(localStorage.getItem('notes'))     || [];
      const photos    = JSON.parse(localStorage.getItem('photos'))    || [];
      const trips     = JSON.parse(localStorage.getItem('trips'))     || [];
      const completed = JSON.parse(localStorage.getItem('completed')) || [];

      const countEventos    = document.getElementById('countEventos');
      const countDesejos    = document.getElementById('countDesejos');
      const countAnotacoes  = document.getElementById('countAnotacoes');
      const countFotos      = document.getElementById('countFotos');
      const countViagens    = document.getElementById('countViagens');
      const countRealizadas = document.getElementById('countRealizadas');

      if (countEventos)    countEventos.textContent    = events.length;
      if (countDesejos)    countDesejos.textContent    = wishes.length;
      if (countAnotacoes)  countAnotacoes.textContent  = notes.length;
      if (countFotos)      countFotos.textContent      = photos.length;
      if (countViagens)    countViagens.textContent    = trips.length;
      if (countRealizadas) countRealizadas.textContent = completed.length;
    }
  }, []); // <<< FECHAMENTO CORRETO DO useEffect

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
  <div class="container">
    <!-- MENU LATERAL -->
    <nav class="sidebar">
      <h2>MyILove 💕</h2>
      <ul>
        <li><a href="/"><i data-lucide="home"></i> Início</a></li>
        <li><a href="/eventos"><i data-lucide="calendar"></i> Eventos</a></li>
        <li><a href="/desejos"><i data-lucide="heart"></i> Desejos</a></li>
        <li><a href="/anotacoes"><i data-lucide="file-text"></i> Anotações</a></li>
        <li><a href="/fotos"><i data-lucide="camera"></i> Fotos</a></li>
        <li><a href="/viagens"><i data-lucide="map"></i> Viagens</a></li>
        <li><a href="/realizadas"><i data-lucide="check-circle"></i> Realizadas</a></li>
        <li><a href="/config"><i data-lucide="settings"></i> Configurações</a></li>
      </ul>
    </nav>

    <!-- CONTEÚDO PRINCIPAL -->
    <main class="content dashboard">
      <div class="welcome-card">
        <h2>Bem-vindos ao MyILove 💖</h2>
        <p>Seu espaço especial para planejar e registrar momentos únicos juntos.</p>
      </div>

      <div class="stats">
        <div class="stat-card"><span id="countEventos">0</span><p>Eventos</p></div>
        <div class="stat-card"><span id="countDesejos">0</span><p>Desejos</p></div>
        <div class="stat-card"><span id="countAnotacoes">0</span><p>Anotações</p></div>
        <div class="stat-card"><span id="countFotos">0</span><p>Fotos</p></div>
        <div class="stat-card"><span id="countViagens">0</span><p>Viagens</p></div>
        <div class="stat-card"><span id="countRealizadas">0</span><p>Realizadas</p></div>
      </div>

      <div class="quick-actions">
        <h3>Ações Rápidas</h3>
        <div class="buttons">
          <button class="blue"><i data-lucide="plus"></i> Novo Evento</button>
          <button class="pink"><i data-lucide="heart"></i> Adicionar Desejo</button>
          <button class="purple"><i data-lucide="file-text"></i> Nova Anotação</button>
          <button class="green"><i data-lucide="camera"></i> Adicionar Foto</button>
        </div>
      </div>

      <div class="next-events">
        <h3>Próximos Eventos</h3>
        <p>Nenhum evento próximo. Que tal planejar algo especial? 💐</p>
      </div>
    </main>
  </div>
          `,
        }}
      />
    </>
  );
}
