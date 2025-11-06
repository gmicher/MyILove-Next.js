'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Page() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lucide stub (evita erro se o script ainda não carregou)
    if (!window.lucide) window.lucide = { createIcons: () => {} };

    requestAnimationFrame(() => {
      // ===================== Estado =====================
      let wishes = JSON.parse(localStorage.getItem('wishes')) || [];
      let currentFilter = 'all';

      // ===================== Ações ======================
      function openWishModal() {
        document.getElementById('wishModal')?.style.setProperty('display', 'flex');
      }
      function closeWishModal() {
        document.getElementById('wishModal')?.style.setProperty('display', 'none');
        document.getElementById('wishForm')?.reset();
      }

      function filterWishes(category, event) {
        currentFilter = category;
        (document.querySelectorAll('.filter-btn') || []).forEach(btn => btn.classList.remove('active'));
        event?.target?.classList?.add('active');
        displayWishes();
      }

      function getCategoryIcon(category) {
        const icons = { places: '🗺️', experiences: '🎭', gifts: '🎁', goals: '🎯' };
        return icons[category] || '💫';
      }
      function getPriorityIcon(priority) {
        const icons = { low: '🔵', medium: '🟡', high: '🔴' };
        return icons[priority] || '🔵';
      }

      function completeWish(id) {
        if (!confirm('Parabéns! Vocês realizaram este desejo? 🎉')) return;
        const wish = wishes.find(w => w.id === id);
        if (!wish) return;

        wish.completed = true;
        wish.completedAt = new Date().toISOString();

        const completed = JSON.parse(localStorage.getItem('completed')) || [];
        completed.push(wish);
        localStorage.setItem('completed', JSON.stringify(completed));

        wishes = wishes.filter(w => w.id !== id);
        localStorage.setItem('wishes', JSON.stringify(wishes));
        displayWishes();
      }

      function deleteWish(id) {
        if (!confirm('Tem certeza que deseja excluir este desejo?')) return;
        wishes = wishes.filter(w => w.id !== id);
        localStorage.setItem('wishes', JSON.stringify(wishes));
        displayWishes();
      }

      function displayWishes() {
        const grid = document.getElementById('wishesGrid');
        if (!grid) return;

        let filteredWishes = wishes;
        if (currentFilter !== 'all') {
          filteredWishes = wishes.filter(w => w.category === currentFilter);
        }

        if (!filteredWishes.length) {
          grid.innerHTML = '<p class="empty-state">Nenhum desejo encontrado. Que tal sonhar um pouco? ✨</p>';
          return;
        }

        grid.innerHTML = filteredWishes
          .map(wish => `
            <div class="wish-card ${wish.priority}">
              <div class="wish-header">
                <div class="wish-category">${getCategoryIcon(wish.category)}</div>
                <div class="wish-priority">${getPriorityIcon(wish.priority)}</div>
              </div>
              <h4>${wish.title}</h4>
              ${wish.description ? `<p class="wish-description">${wish.description}</p>` : ''}
              ${wish.estimate ? `<p class="wish-estimate">💰 ${wish.estimate}</p>` : ''}
              <div class="wish-actions">
                <button class="complete-btn" onclick="window.completeWish(${wish.id})" title="Marcar como realizado">
                  <i data-lucide="check"></i>
                </button>
                <button class="delete-btn" onclick="window.deleteWish(${wish.id})" title="Excluir">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          `)
          .join('');

        try { window.lucide?.createIcons?.(); } catch {}
      }

      // ================== Eventos de formulário ==================
      document.getElementById('wishForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const wish = {
          id: Date.now(),
          title: document.getElementById('wishTitle')?.value || '',
          description: document.getElementById('wishDescription')?.value || '',
          category: document.getElementById('wishCategory')?.value || 'places',
          priority: document.getElementById('wishPriority')?.value || 'low',
          estimate: document.getElementById('wishEstimate')?.value || '',
          completed: false,
          createdAt: new Date().toISOString()
        };
        wishes.push(wish);
        localStorage.setItem('wishes', JSON.stringify(wishes));
        displayWishes();
        closeWishModal();
      });

      // ============== Expor funções globais p/ HTML ==============
      window.completeWish = completeWish;
      window.deleteWish = deleteWish;
      window.openWishModal = openWishModal;
      window.closeWishModal = closeWishModal;
      window.filterWishes = filterWishes;

      // ================== Inicialização da tela ==================
      displayWishes();
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

      {/* Mantém a estrutura/estilos originais via HTML puro */}
      <div
        dangerouslySetInnerHTML={{
          __html: `
  <div class="container">
    <nav class="sidebar">
      <h2>MyILove 💕</h2>
      <ul>
        <li><a href="/"><i data-lucide="home"></i> Início</a></li>
        <li><a href="/eventos"><i data-lucide="calendar"></i> Eventos</a></li>
        <li><a href="/desejos" class="active"><i data-lucide="heart"></i> Desejos</a></li>
        <li><a href="/anotacoes"><i data-lucide="file-text"></i> Anotações</a></li>
        <li><a href="/fotos"><i data-lucide="camera"></i> Fotos</a></li>
        <li><a href="/viagens"><i data-lucide="map"></i> Viagens</a></li>
        <li><a href="/realizadas"><i data-lucide="check-circle"></i> Realizadas</a></li>
        <li><a href="/config"><i data-lucide="settings"></i> Configurações</a></li>
      </ul>
    </nav>

    <main class="content">
      <h2>Desejos 💝</h2>
      <div class="actions">
        <button class="pink" onclick="openWishModal()">
          <i data-lucide="plus"></i> Novo Desejo
        </button>
      </div>
      <div id="wishesGrid" class="wishes-grid"></div>
    </main>
  </div>

  <!-- Modal -->
  <div id="wishModal" class="modal">
    <div class="modal-content">
      <span class="close" onclick="closeWishModal()">&times;</span>
      <h3>Novo Desejo</h3>
      <form id="wishForm">
        <input id="wishTitle" type="text" placeholder="Título" required />
        <textarea id="wishDescription" placeholder="Descrição (opcional)"></textarea>
        <select id="wishCategory" required>
          <option value="places">Lugares</option>
          <option value="experiences">Experiências</option>
          <option value="gifts">Presentes</option>
          <option value="goals">Metas</option>
        </select>
        <select id="wishPriority" required>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
        <input id="wishEstimate" type="text" placeholder="Estimativa de custo (opcional)" />
        <button type="submit" class="pink">Salvar</button>
      </form>
    </div>
  </div>
          `,
        }}
      />
    </>
  );
}
