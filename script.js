document.addEventListener('DOMContentLoaded', () => {
  // Lucide + marcação do link ativo (mantém seu código atual)
  if (window.lucide?.createIcons) lucide.createIcons();
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) a.classList.add('active');
  });

  // ===== ATUALIZA CONTADORES DA DASHBOARD =====
  updateDashboardStats();

  // ===== AÇÕES RÁPIDAS (HOME) =====
  const qa = document.querySelector('.quick-actions .buttons');
  if (qa) {
    const [eventBtn, wishBtn, noteBtn, photoBtn] = qa.querySelectorAll('button') || [];
    eventBtn?.addEventListener('click', () => goQuick('event', 'eventos.html'));
    wishBtn?.addEventListener('click', () => goQuick('wish',  'desejos.html'));
    noteBtn?.addEventListener('click', () => goQuick('note',  'anotacoes.html'));
    photoBtn?.addEventListener('click', () => goQuick('photo', 'fotos.html'));
  }

  // ===== AUTO-ABRIR MODAL NA PÁGINA DE DESTINO =====
  const flag = localStorage.getItem('myilove_quick_open');
  if (flag) {
    const page = location.pathname.split('/').pop() || 'index.html';
    const openerMap = {
      event: ['eventos.html',   () => window.openEventModal?.()],
      wish:  ['desejos.html',   () => window.openWishModal?.()],
      note:  ['anotacoes.html', () => window.openNoteModal?.()],
      photo: ['fotos.html',     () => window.openPhotoModal?.()],
    };
    const cfg = openerMap[flag];
    if (cfg && page === cfg[0]) {
      // pequeno atraso garante que o HTML/JS da página já montou os modais
      setTimeout(() => { cfg[1]?.(); }, 0);
      localStorage.removeItem('myilove_quick_open');
    }
  }
});

// Função utilitária: grava a intenção e navega
function goQuick(key, href) {
  try { localStorage.setItem('myilove_quick_open', key); } catch {}
  location.href = href;
}

// ===== NOVA FUNÇÃO: ATUALIZA CONTADORES DA PÁGINA PRINCIPAL =====
/**
 * Lê os dados do localStorage e atualiza os contadores na dashboard
 * Essa função é chamada automaticamente ao carregar index.html
 */
function updateDashboardStats() {
  // Recupera dados do localStorage (ou array vazio se não existir)
  const events = JSON.parse(localStorage.getItem('events')) || [];
  const wishes = JSON.parse(localStorage.getItem('wishes')) || [];
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  const photos = JSON.parse(localStorage.getItem('photos')) || [];
  const trips = JSON.parse(localStorage.getItem('trips')) || [];
  const completed = JSON.parse(localStorage.getItem('completed')) || [];

  // Atualiza os contadores na tela (somente se os elementos existirem)
  const countEventos = document.getElementById('countEventos');
  const countDesejos = document.getElementById('countDesejos');
  const countAnotacoes = document.getElementById('countAnotacoes');
  const countFotos = document.getElementById('countFotos');
  const countViagens = document.getElementById('countViagens');
  const countRealizadas = document.getElementById('countRealizadas');

  // Atribui o valor da contagem aos elementos HTML
  if (countEventos) countEventos.textContent = events.length;
  if (countDesejos) countDesejos.textContent = wishes.length;
  if (countAnotacoes) countAnotacoes.textContent = notes.length;
  if (countFotos) countFotos.textContent = photos.length;
  if (countViagens) countViagens.textContent = trips.length;
  if (countRealizadas) countRealizadas.textContent = completed.length;
}
