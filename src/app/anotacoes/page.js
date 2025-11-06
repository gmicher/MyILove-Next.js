'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Page() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lucide stub (evita erro se o script ainda não carregou)
    if (!window.lucide) window.lucide = { createIcons: () => {} };

    // Estado interno
    let notes = JSON.parse(localStorage.getItem('notes') || '[]');
    let currentFilter = 'all';
    let currentMood = 'happy';

    // ===== Utils =====
    function save() {
      localStorage.setItem('notes', JSON.stringify(notes));
    }

    // ===== Ações do Modal =====
    function openNoteModal() {
      document.getElementById('noteModal')?.style.setProperty('display', 'flex');
      document.getElementById('modalTitle') && (document.getElementById('modalTitle').textContent = 'Nova Anotação');
      document.getElementById('noteForm')?.reset();
      currentMood = 'happy';
      document.getElementById('noteMood') && (document.getElementById('noteMood').value = currentMood);
      markSelectedMood(currentMood);
    }

    function closeNoteModal() {
      document.getElementById('noteModal')?.style.setProperty('display', 'none');
      document.getElementById('noteForm')?.reset();
    }

    // ===== Filtro e busca =====
    function filterNotes(category) {
      currentFilter = category;
      const buttons = document.querySelectorAll('.filter-btn');
      buttons.forEach(b => b.classList.remove('active'));
      // ativa o botão correspondente se existir
      const map = { all: 0, memories: 1, ideas: 2, important: 3 };
      const idx = map[category];
      if (typeof idx === 'number' && buttons[idx]) buttons[idx].classList.add('active');
      render();
    }

    function searchNotes() {
      render();
    }

    // ===== Humor =====
    function markSelectedMood(mood) {
      document.querySelectorAll('.mood').forEach(el => el.classList.remove('selected'));
      const el = document.querySelector(`.mood[data-mood="${mood}"]`);
      el?.classList.add('selected');
    }

    function selectMood(mood) {
      currentMood = mood;
      const hidden = document.getElementById('noteMood');
      if (hidden) hidden.value = mood;
      markSelectedMood(mood);
    }

    // ===== Render =====
    function render() {
      const grid = document.getElementById('notesGrid');
      if (!grid) return;

      const q = (document.getElementById('searchInput')?.value || '').toLowerCase();

      let list = [...notes];
      if (currentFilter !== 'all') list = list.filter(n => n.category === currentFilter);
      if (q) list = list.filter(n => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q));

      if (!list.length) {
        grid.innerHTML = '<p class="empty-state">Nenhuma anotação ainda. Que tal registrar uma memória especial? 💭</p>';
        try { window.lucide?.createIcons?.(); } catch {}
        return;
      }

      grid.innerHTML = list.map(n => `
        <div class="note-card">
          <div class="note-head">
            <h4>${escapeHtml(n.title)}</h4>
            <span class="note-badges">
              <span class="badge">${badgeFromCategory(n.category)}</span>
              <span class="badge">${emojiFromMood(n.mood || 'happy')}</span>
            </span>
          </div>
          <p class="note-content">${escapeHtml(n.content)}</p>
          <div class="note-meta">
            <span>${formatDate(n.createdAt)}</span>
            <button class="delete-btn" onclick="window.deleteNote(${n.id})" title="Excluir">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `).join('');

      try { window.lucide?.createIcons?.(); } catch {}
    }

    // ===== Helpers de UI =====
    function formatDate(iso) {
      try { return new Date(iso).toLocaleString('pt-BR'); } catch { return ''; }
    }
    function badgeFromCategory(cat) {
      const map = { memories: 'Memórias', ideas: 'Ideias', important: 'Importante' };
      return map[cat] || 'Geral';
    }
    function emojiFromMood(m) {
      const map = { happy: '😊', love: '😍', excited: '🤩', peaceful: '😌', thoughtful: '🤔' };
      return map[m] || '😊';
    }
    function escapeHtml(s = '') {
      return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    // ===== Form =====
    document.getElementById('noteForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = {
        id: Date.now(),
        title: document.getElementById('noteTitle')?.value || '',
        content: document.getElementById('noteContent')?.value || '',
        category: document.getElementById('noteCategory')?.value || 'memories',
        mood: document.getElementById('noteMood')?.value || currentMood || 'happy',
        createdAt: new Date().toISOString()
      };
      notes.unshift(note);
      save();
      closeNoteModal();
      render();
    });

    // ===== Excluir =====
    function deleteNote(id) {
      if (!confirm('Tem certeza que deseja excluir esta anotação?')) return;
      notes = notes.filter(n => n.id !== id);
      save();
      render();
    }

    // ===== Expor no window para handlers inline =====
    window.openNoteModal = openNoteModal;
    window.closeNoteModal = closeNoteModal;
    window.filterNotes = filterNotes;
    window.selectMood = selectMood;
    window.searchNotes = searchNotes;
    window.deleteNote = deleteNote;

    // ===== Inicialização =====
    requestAnimationFrame(() => {
      render();
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
  <!-- Estrutura principal da página -->
  <div class="container">
    <!-- Sidebar (menu de navegação lateral) -->
    <nav class="sidebar">
      <h2>MyILove 💕</h2>
      <ul>
        <li><a href="/"><i data-lucide="home"></i> Início</a></li>
        <li><a href="/eventos"><i data-lucide="calendar"></i> Eventos</a></li>
        <li><a href="/desejos"><i data-lucide="heart"></i> Desejos</a></li>
        <li><a href="/anotacoes" class="active"><i data-lucide="file-text"></i> Anotações</a></li>
        <li><a href="/fotos"><i data-lucide="camera"></i> Fotos</a></li>
        <li><a href="/viagens"><i data-lucide="map"></i> Viagens</a></li>
        <li><a href="/realizadas"><i data-lucide="check-circle"></i> Realizadas</a></li>
        <li><a href="/config"><i data-lucide="settings"></i> Configurações</a></li>
      </ul>
    </nav>

    <!-- Conteúdo principal -->
    <main class="content">
      <div class="page-header">
        <h2>Anotações 📝</h2>
        <button class="add-btn" onclick="openNoteModal()">
          <i data-lucide="plus"></i> Nova Anotação
        </button>
      </div>

      <div class="search-bar">
        <input type="text" id="searchInput" placeholder="Buscar anotações..." onkeyup="searchNotes()">
        <i data-lucide="search"></i>
      </div>

      <div class="notes-filter">
        <button class="filter-btn active" onclick="filterNotes('all')">Todas</button>
        <button class="filter-btn" onclick="filterNotes('memories')">Memórias</button>
        <button class="filter-btn" onclick="filterNotes('ideas')">Ideias</button>
        <button class="filter-btn" onclick="filterNotes('important')">Importante</button>
      </div>

      <div class="notes-grid" id="notesGrid">
        <p class="empty-state">Nenhuma anotação ainda. Que tal registrar uma memória especial? 💭</p>
      </div>
    </main>
  </div>

  <!-- Modal: componente flutuante para adicionar ou editar anotações -->
  <div id="noteModal" class="modal">
    <div class="modal-content large">
      <div class="modal-header">
        <h3 id="modalTitle">Nova Anotação</h3>
        <span class="close" onclick="closeNoteModal()">&times;</span>
      </div>

      <form id="noteForm">
        <input type="text" id="noteTitle" placeholder="Título da anotação" required>
        <textarea id="noteContent" placeholder="Escreva aqui..." required></textarea>

        <div class="form-row">
          <select id="noteCategory" required>
            <option value="memories">Memórias</option>
            <option value="ideas">Ideias</option>
            <option value="important">Importante</option>
          </select>

          <div class="mood-selector">
            <label>Humor:</label>
            <div class="mood-options">
              <span class="mood selected" data-mood="happy"      onclick="selectMood('happy')">😊</span>
              <span class="mood"          data-mood="love"       onclick="selectMood('love')">😍</span>
              <span class="mood"          data-mood="excited"    onclick="selectMood('excited')">🤩</span>
              <span class="mood"          data-mood="peaceful"   onclick="selectMood('peaceful')">😌</span>
              <span class="mood"          data-mood="thoughtful" onclick="selectMood('thoughtful')">🤔</span>
            </div>
          </div>
        </div>

        <input type="hidden" id="noteMood" value="happy">
        <button type="submit" class="submit-btn">Salvar Anotação</button>
      </form>
    </div>
  </div>
          `,
        }}
      />
    </>
  );
}
