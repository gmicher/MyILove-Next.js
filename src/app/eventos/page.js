'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Page() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lucide stub (evita erro se script ainda não carregou)
    if (!window.lucide) window.lucide = { createIcons: () => {} };

    // --- Estado local da página ---
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('events')) || [];

    // Helpers
    function parseLocalDate(isoDate) {
      // Aceita 'YYYY-MM-DD' (ou 'YYYY-MM-DDTHH:mm')
      if (!isoDate) return new Date(NaN);
      const onlyDate = String(isoDate).split('T')[0];
      const [y, m, d] = onlyDate.split('-').map(Number);
      return new Date(y, (m || 1) - 1, d || 1);
    }

    function todayLocal00() {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return t;
    }

    function formatDate(dateString) {
      const d = parseLocalDate(dateString);
      return isNaN(d) ? dateString : d.toLocaleDateString('pt-BR');
    }

    // Navegação de mês
    function updateMonthDisplay() {
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const el = document.getElementById('currentMonth');
      if (el) el.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }

    function changeMonth(direction) {
      currentDate.setMonth(currentDate.getMonth() + direction);
      updateCalendar();
      updateMonthDisplay();
    }

    // Calendário
    function updateCalendar() {
      const grid = document.getElementById('calendarGrid');
      if (!grid) return;
      grid.innerHTML = '';

      // Cabeçalho
      const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day-header';
        dayElement.textContent = day;
        grid.appendChild(dayElement);
      });

      // Intervalo exibido (6 semanas)
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = date.getDate();

        if (date.getMonth() !== currentDate.getMonth()) {
          dayElement.classList.add('other-month');
        }
        if (date.toDateString() === new Date().toDateString()) {
          dayElement.classList.add('today');
        }

        const hasEvent = events.some(ev => parseLocalDate(ev.date).toDateString() === date.toDateString());
        if (hasEvent) dayElement.classList.add('has-event');

        grid.appendChild(dayElement);
      }
    }

    // Modal
    function openEventModal() {
      const m = document.getElementById('eventModal');
      if (m) m.style.display = 'flex';
    }
    function closeEventModal() {
      const m = document.getElementById('eventModal');
      const f = document.getElementById('eventForm');
      if (m) m.style.display = 'none';
      if (f) f.reset();
    }

    // Listagem
    function getCategoryIcon(category) {
      const icons = {
        date: '💕',
        anniversary: '🎉',
        travel: '✈️',
        special: '⭐'
      };
      return icons[category] || '📅';
    }

    function displayEvents() {
      const list = document.getElementById('eventsList');
      if (!list) return;

      if (!events || events.length === 0) {
        list.innerHTML = '<p class="empty-state">Nenhum evento cadastrado. Que tal planejar algo especial? 💖</p>';
        return;
      }

      const t0 = todayLocal00();
      const normalized = events
        .map(ev => ({ ...ev, _d: parseLocalDate(ev.date) }))
        .filter(ev => !isNaN(ev._d));

      const upcoming = normalized
        .filter(ev => ev._d >= t0)
        .sort((a, b) => a._d - b._d);

      const fallbackPast = normalized
        .filter(ev => ev._d < t0)
        .sort((a, b) => b._d - a._d)
        .slice(0, 5);

      const toShow = upcoming.length ? upcoming : fallbackPast;

      list.innerHTML = toShow.length
        ? toShow.map(event => `
            <div class="event-item">
              <div class="event-icon">${getCategoryIcon(event.category)}</div>
              <div class="event-details">
                <h4>${event.title}</h4>
                <p class="event-date">${formatDate(event.date)} ${event.time ? `às ${event.time}` : ''}</p>
                ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
              </div>
              <button class="delete-btn" onclick="deleteEvent(${event.id})">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          `).join('')
        : '<p class="empty-state">Nenhum evento para exibir.</p>';

      try { window.lucide?.createIcons?.(); } catch {}
    }

    function deleteEvent(id) {
      if (!confirm('Tem certeza que deseja excluir este evento?')) return;
      events = events.filter(ev => ev.id !== id);
      localStorage.setItem('events', JSON.stringify(events));
      displayEvents();
      updateCalendar();
    }

    // Eventos do form
    const form = document.getElementById('eventForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const event = {
        id: Date.now(),
        title: document.getElementById('eventTitle')?.value || '',
        date: document.getElementById('eventDate')?.value || '',
        time: document.getElementById('eventTime')?.value || '',
        description: document.getElementById('eventDescription')?.value || '',
        category: document.getElementById('eventCategory')?.value || 'special',
      };
      events.push(event);
      localStorage.setItem('events', JSON.stringify(events));
      displayEvents();
      updateCalendar();
      closeEventModal();
    });

    // Expor no window para os onClick do HTML
    window.changeMonth = changeMonth;
    window.openEventModal = openEventModal;
    window.closeEventModal = closeEventModal;
    window.deleteEvent = deleteEvent;

    // Inicialização após a renderização
    requestAnimationFrame(() => {
      updateCalendar();
      displayEvents();
      updateMonthDisplay();
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
  <!-- Container principal da aplicação, organiza sidebar + conteúdo -->
  <div class="container">

    <!-- Sidebar lateral com navegação do aplicativo -->
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

    <!-- Área principal de conteúdo -->
    <main class="content">
      <div class="page-header">
        <h2>Eventos 📅</h2>
        <button class="add-btn" onclick="openEventModal()">
          <i data-lucide="plus"></i> Adicionar Evento
        </button>
      </div>

      <!-- Seção do calendário -->
      <div class="calendar-view">
        <div class="calendar-header">
          <button onclick="changeMonth(-1)"><i data-lucide="chevron-left"></i></button>
          <h3 id="currentMonth"></h3>
          <button onclick="changeMonth(1)"><i data-lucide="chevron-right"></i></button>
        </div>
        <div class="calendar-grid" id="calendarGrid"></div>
      </div>

      <!-- Lista de próximos eventos cadastrados -->
      <div class="events-list">
        <h3>Próximos Eventos</h3>
        <div id="eventsList">
          <p class="empty-state">Nenhum evento cadastrado. Que tal planejar algo especial? 💖</p>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal para cadastro de novo evento -->
  <div id="eventModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Novo Evento</h3>
        <span class="close" onclick="closeEventModal()">&times;</span>
      </div>
      <form id="eventForm">
        <input type="text" id="eventTitle" placeholder="Título do evento" required>
        <input type="date" id="eventDate" required>
        <input type="time" id="eventTime">
        <textarea id="eventDescription" placeholder="Descrição (opcional)"></textarea>
        <select id="eventCategory">
          <option value="date">Encontro</option>
          <option value="anniversary">Aniversário</option>
          <option value="travel">Viagem</option>
          <option value="special">Especial</option>
        </select>
        <button type="submit" class="submit-btn">Adicionar</button>
      </form>
    </div>
  </div>
          `,
        }}
      />
    </>
  );
}
