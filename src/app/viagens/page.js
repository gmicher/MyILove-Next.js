'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Page() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lucide stub (evita erro se o script ainda não carregou)
    if (!window.lucide) window.lucide = { createIcons: () => {} };

    requestAnimationFrame(() => {
      // ===== Estado =====
      let trips = JSON.parse(localStorage.getItem('trips')) || [];
      let currentTab = 'planned';

      // ===== Init =====
      displayTrips();
      updateStats();

      // ===== Modais =====
      function openTripModal() {
        document.getElementById('tripModal')?.style.setProperty('display', 'flex');
      }
      function closeTripModal() {
        document.getElementById('tripModal')?.style.setProperty('display', 'none');
        document.getElementById('tripForm')?.reset();
      }
      function closeTripDetailsModal() {
        document.getElementById('tripDetailsModal')?.style.setProperty('display', 'none');
      }

      // ===== Form Nova Viagem =====
      document.getElementById('tripForm')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const startDate = new Date(document.getElementById('tripStartDate').value);
        const endDate   = new Date(document.getElementById('tripEndDate').value);
        const today     = new Date();

        let status = 'planned';
        if (today >= startDate && today <= endDate) status = 'current';
        else if (today > endDate) status = 'completed';

        const trip = {
          id: Date.now(),
          destination: document.getElementById('tripDestination').value,
          startDate: document.getElementById('tripStartDate').value,
          endDate: document.getElementById('tripEndDate').value,
          description: document.getElementById('tripDescription').value,
          type: document.getElementById('tripType').value,
          budget: document.getElementById('tripBudget').value,
          notes: document.getElementById('tripNotes').value,
          status,
          createdAt: new Date().toISOString(),
          memories: [],
          checklist: [],
        };

        trips.push(trip);
        localStorage.setItem('trips', JSON.stringify(trips));

        displayTrips();
        updateStats();
        closeTripModal();
      });

      // ===== Tabs =====
      function showTab(tab, evt) {
        currentTab = tab;
        (document.querySelectorAll('.tab-btn') || []).forEach((btn) => btn.classList.remove('active'));
        evt?.target?.classList?.add('active');

        (document.querySelectorAll('.trip-section') || []).forEach((section) => {
          section.classList.remove('active');
        });
        document.getElementById(`${tab}Trips`)?.classList.add('active');

        displayTrips();
      }

      // ===== Exibição =====
      function displayTrips() {
        const plannedGrid   = document.getElementById('plannedGrid');
        const currentGrid   = document.getElementById('currentGrid');
        const completedGrid = document.getElementById('completedGrid');
        if (!plannedGrid || !currentGrid || !completedGrid) return;

        updateTripStatuses();

        const plannedTrips   = trips.filter((t) => t.status === 'planned');
        const currentTrips   = trips.filter((t) => t.status === 'current');
        const completedTrips = trips.filter((t) => t.status === 'completed');

        plannedGrid.innerHTML = plannedTrips.length
          ? plannedTrips.map(createTripCard).join('')
          : '<p class="empty-state">Nenhuma viagem planejada. Que tal planejar uma escapada romântica? 🌍</p>';

        currentGrid.innerHTML = currentTrips.length
          ? currentTrips.map(createTripCard).join('')
          : '<p class="empty-state">Nenhuma viagem em andamento.</p>';

        completedGrid.innerHTML = completedTrips.length
          ? completedTrips.map(createTripCard).join('')
          : '<p class="empty-state">Nenhuma viagem realizada ainda.</p>';

        try { window.lucide?.createIcons?.(); } catch {}
      }

      function updateTripStatuses() {
        const today = new Date();
        let changed = false;

        trips.forEach((trip) => {
          const startDate = new Date(trip.startDate);
          const endDate   = new Date(trip.endDate);

          let newStatus = 'planned';
          if (today >= startDate && today <= endDate) newStatus = 'current';
          else if (today > endDate) newStatus = 'completed';

          if (trip.status !== newStatus) {
            trip.status = newStatus;
            changed = true;
          }
        });

        if (changed) localStorage.setItem('trips', JSON.stringify(trips));
      }

      function createTripCard(trip) {
        const duration = calculateDuration(trip.startDate, trip.endDate);
        const typeIcon = getTripTypeIcon(trip.type);
        // IMPORTANTE: manter `return` e a crase na MESMA LINHA
        return `
          <div class="trip-card ${trip.status}" onclick="viewTripDetails(${trip.id})">
            <div class="trip-header">
              <div class="trip-type">${typeIcon}</div>
              <div class="trip-status">${getStatusBadge(trip.status)}</div>
            </div>
            <h4>${escapeHtml(trip.destination)}</h4>
            <p class="trip-dates">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>
            <p class="trip-duration">${duration} dias</p>
            ${trip.budget ? `<p class="trip-budget">💰 ${escapeHtml(trip.budget)}</p>` : ''}
            ${trip.description ? `<p class="trip-description">${escapeHtml(truncateText(trip.description, 80))}</p>` : ''}
            <div class="trip-actions">
              <button onclick="event.stopPropagation(); editTrip(${trip.id})" title="Editar">
                <i data-lucide="edit-2"></i>
              </button>
              <button onclick="event.stopPropagation(); deleteTrip(${trip.id})" title="Excluir">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        `;
      }

      // ===== Detalhes =====
      function viewTripDetails(id) {
        const trip = trips.find((t) => t.id === id);
        if (!trip) return;

        const titleEl = document.getElementById('tripDetailsTitle');
        if (titleEl) titleEl.textContent = trip.destination;

        const content = document.getElementById('tripDetailsContent');
        if (content) {
          content.innerHTML = `
            <div class="trip-details">
              <div class="trip-info">
                <h4>Informações da Viagem</h4>
                <p><strong>Período:</strong> ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>
                <p><strong>Duração:</strong> ${calculateDuration(trip.startDate, trip.endDate)} dias</p>
                <p><strong>Tipo:</strong> ${getTripTypeName(trip.type)}</p>
                ${trip.budget ? `<p><strong>Orçamento:</strong> ${escapeHtml(trip.budget)}</p>` : ''}
                <p><strong>Status:</strong> ${getStatusBadge(trip.status)}</p>
              </div>

              ${trip.description ? `
                <div class="trip-description">
                  <h4>Descrição</h4>
                  <p>${escapeHtml(trip.description)}</p>
                </div>` : ''}

              ${trip.notes ? `
                <div class="trip-notes">
                  <h4>Notas de Planejamento</h4>
                  <p>${escapeHtml(trip.notes)}</p>
                </div>` : ''}

              <div class="trip-actions-details">
                <button onclick="addMemory(${trip.id})" class="memory-btn">
                  <i data-lucide="camera"></i> Adicionar Memória
                </button>
                <button onclick="addChecklistItem(${trip.id})" class="checklist-btn">
                  <i data-lucide="check-square"></i> Lista de Tarefas
                </button>
              </div>
            </div>
          `;
        }

        document.getElementById('tripDetailsModal')?.style.setProperty('display', 'flex');
        try { window.lucide?.createIcons?.(); } catch {}
      }

      // ===== Ações =====
      function editTrip(id) {
        console.log('Editar viagem:', id);
      }
      function deleteTrip(id) {
        if (!confirm('Tem certeza que deseja excluir esta viagem?')) return;
        trips = trips.filter((t) => t.id !== id);
        localStorage.setItem('trips', JSON.stringify(trips));
        displayTrips();
        updateStats();
      }
      function addMemory(tripId) {
        console.log('Adicionar memória para viagem:', tripId);
      }
      function addChecklistItem(tripId) {
        console.log('Adicionar item à lista para viagem:', tripId);
      }

      // ===== Stats =====
      function updateStats() {
        const totalTrips = trips.length;
        const totalDestinations = new Set(trips.map((t) => t.destination)).size;
        const totalDays = trips.reduce((sum, t) => sum + calculateDuration(t.startDate, t.endDate), 0);

        const elTrips = document.getElementById('totalTrips');
        const elDest  = document.getElementById('totalDestinations');
        const elDays  = document.getElementById('totalDays');

        if (elTrips) elTrips.textContent = String(totalTrips);
        if (elDest)  elDest.textContent  = String(totalDestinations);
        if (elDays)  elDays.textContent  = String(totalDays);
      }

      // ===== Helpers =====
      function getTripTypeIcon(type) {
        const icons = { romantic: '💕', adventure: '🏔️', relax: '🏖️', cultural: '🏛️', family: '👨‍👩‍👧‍👦' };
        return icons[type] || '✈️';
      }
      function getTripTypeName(type) {
        const names = { romantic: 'Romântica', adventure: 'Aventura', relax: 'Relaxante', cultural: 'Cultural', family: 'Família' };
        return names[type] || 'Viagem';
      }
      function getStatusBadge(status) {
        const badges = { planned: '📅 Planejada', current: '🎒 Em andamento', completed: '✅ Realizada' };
        return badges[status] || status;
      }
      function calculateDuration(startDate, endDate) {
        const start = new Date(startDate);
        const end   = new Date(endDate);
        const diff  = Math.abs(end - start);
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1; // inclui o dia inicial
      }
      function formatDate(dateString) {
        const d = new Date(dateString);
        return isNaN(d) ? '' : d.toLocaleDateString('pt-BR');
      }
      function truncateText(text, maxLength) {
        if (!text) return '';
        return String(text).length <= maxLength ? text : String(text).substring(0, maxLength) + '...';
      }
      function escapeHtml(s = '') {
        return String(s)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#039;');
      }

      // ===== Expor globais p/ HTML inline =====
      window.openTripModal = openTripModal;
      window.closeTripModal = closeTripModal;
      window.closeTripDetailsModal = closeTripDetailsModal;
      window.viewTripDetails = viewTripDetails;
      window.editTrip = editTrip;
      window.deleteTrip = deleteTrip;
      window.addMemory = addMemory;
      window.addChecklistItem = addChecklistItem;
      window.showTab = (tab) => showTab(tab, window.event);

      // Recriar ícones
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
  <div class="container">
    <!--MENU LATERAL-->
    <nav class="sidebar">
      <h2>MyILove 💕</h2>
      <ul>
        <li><a href="/"><i data-lucide="home"></i> Início</a></li>
        <li><a href="/eventos"><i data-lucide="calendar"></i> Eventos</a></li>
        <li><a href="/desejos"><i data-lucide="heart"></i> Desejos</a></li>
        <li><a href="/anotacoes"><i data-lucide="file-text"></i> Anotações</a></li>
        <li><a href="/fotos"><i data-lucide="camera"></i> Fotos</a></li>
        <li><a href="/viagens" class="active"><i data-lucide="map"></i> Viagens</a></li>
        <li><a href="/realizadas"><i data-lucide="check-circle"></i> Realizadas</a></li>
        <li><a href="/config"><i data-lucide="settings"></i> Configurações</a></li>
      </ul>
    </nav>

    <!--CONTEÚDO PRINCIPAL-->
    <main class="content">
      <div class="page-header">
        <h2>Nossas Viagens ✈️</h2>
        <button class="add-btn" onclick="openTripModal()">
          <i data-lucide="plus"></i> Nova Viagem
        </button>
      </div>

      <div class="trip-stats">
        <div class="stat-item">
          <span id="totalTrips">0</span>
          <p>Viagens</p>
        </div>
        <div class="stat-item">
          <span id="totalDestinations">0</span>
          <p>Destinos</p>
        </div>
        <div class="stat-item">
          <span id="totalDays">0</span>
          <p>Dias viajando</p>
        </div>
      </div>

      <div class="trip-tabs">
        <button class="tab-btn active" onclick="showTab('planned')">Planejadas</button>
        <button class="tab-btn" onclick="showTab('current')">Em andamento</button>
        <button class="tab-btn" onclick="showTab('completed')">Realizadas</button>
      </div>

      <div id="plannedTrips" class="trip-section active">
        <div class="trips-grid" id="plannedGrid">
          <p class="empty-state">Nenhuma viagem planejada. Que tal planejar uma escapada romântica? 🌍</p>
        </div>
      </div>

      <div id="currentTrips" class="trip-section">
        <div class="trips-grid" id="currentGrid">
          <p class="empty-state">Nenhuma viagem em andamento.</p>
        </div>
      </div>

      <div id="completedTrips" class="trip-section">
        <div class="trips-grid" id="completedGrid">
          <p class="empty-state">Nenhuma viagem realizada ainda.</p>
        </div>
      </div>
    </main>
  </div>

  <!--MODAL PARA CRIAR NOVA VIAGEM-->
  <div id="tripModal" class="modal">
    <div class="modal-content large">
      <div class="modal-header">
        <h3>Nova Viagem</h3>
        <span class="close" onclick="closeTripModal()">&times;</span>
      </div>
      <form id="tripForm">
        <input type="text" id="tripDestination" placeholder="Destino" required>
        <div class="form-row">
          <input type="date" id="tripStartDate" required>
          <input type="date" id="tripEndDate" required>
        </div>
        <textarea id="tripDescription" placeholder="Descrição da viagem..."></textarea>
        <select id="tripType">
          <option value="romantic">Romântica</option>
          <option value="adventure">Aventura</option>
          <option value="relax">Relaxante</option>
          <option value="cultural">Cultural</option>
          <option value="family">Família</option>
        </select>
        <input type="text" id="tripBudget" placeholder="Orçamento estimado (opcional)">
        <textarea id="tripNotes" placeholder="Notas e planejamento..."></textarea>
        <button type="submit" class="submit-btn">Criar Viagem</button>
      </form>
    </div>
  </div>

  <!--MODAL PARA DETALHES DE UMA VIAGEM-->
  <div id="tripDetailsModal" class="modal">
    <div class="modal-content large">
      <div class="modal-header">
        <h3 id="tripDetailsTitle"></h3>
        <span class="close" onclick="closeTripDetailsModal()">&times;</span>
      </div>
      <div id="tripDetailsContent"></div>
    </div>
  </div>
          `,
        }}
      />
    </>
  );
}
