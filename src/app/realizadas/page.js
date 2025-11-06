'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Page() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lucide stub (evita erro se script ainda não carregou)
    if (!window.lucide) window.lucide = { createIcons: () => {} };

    requestAnimationFrame(() => {
      // ===== Estado =====
      let completed = JSON.parse(localStorage.getItem('completed')) || [];

      // ===== Inicialização =====
      loadCompletedItems();
      displayAchievements();
      updateStats();
      updateCategoryStats();

      // ===== Carrega e combina itens realizados =====
      function loadCompletedItems() {
        const completedWishes = JSON.parse(localStorage.getItem('completed')) || [];

        const events = JSON.parse(localStorage.getItem('events')) || [];
        const pastEvents = events.filter((ev) => new Date(ev.date) < new Date());

        const trips = JSON.parse(localStorage.getItem('trips')) || [];
        const completedTrips = trips.filter((t) => t.status === 'completed');

        completed = [
          ...completedWishes.map(w => ({ ...w, type: w.type || 'wish', completedAt: w.completedAt || w.date || w.createdAt })),
          ...pastEvents.map(event => ({
            ...event,
            type: 'event',
            completedAt: event.date,
          })),
          ...completedTrips.map(trip => ({
            ...trip,
            type: 'trip',
            completedAt: trip.endDate || trip.date || trip.createdAt,
            title: trip.title || `Viagem para ${trip.destination || ''}`.trim(),
          })),
        ].filter(it => it.completedAt);

        completed.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      }

      // ===== Renderiza timeline =====
      function displayAchievements() {
        const timeline = document.getElementById('achievementsTimeline');
        if (!timeline) return;

        if (completed.length === 0) {
          timeline.innerHTML = `
            <div class="empty-state">
              <i data-lucide="heart"></i>
              <p>Nenhuma conquista ainda</p>
              <span>Que tal realizar um dos seus desejos? 💖</span>
            </div>
          `;
          try { window.lucide?.createIcons?.(); } catch {}
          return;
        }

        timeline.innerHTML = completed
          .map((item, index) => `
            <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}" onclick="viewAchievement(${item.id})">
              <div class="timeline-date">${formatDate(item.completedAt)}</div>
              <div class="timeline-content">
                <div class="achievement-icon">${getAchievementIcon(item)}</div>
                <h4>${escapeHtml(item.title || 'Conquista')}</h4>
                <p class="achievement-type">${getAchievementType(item)}</p>
                ${
                  item.description
                    ? `<p class="achievement-desc">${escapeHtml(truncateText(String(item.description), 60))}</p>`
                    : ''
                }
                <div class="achievement-score">+${calculateScore(item)} pontos</div>
              </div>
            </div>
          `)
          .join('');

        try { window.lucide?.createIcons?.(); } catch {}
      }

      // ===== Estatísticas gerais =====
      function updateStats() {
        const now = new Date();

        const thisMonth = completed.filter((item) => {
          const d = new Date(item.completedAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const thisYear = completed.filter((item) => {
          const d = new Date(item.completedAt);
          return d.getFullYear() === now.getFullYear();
        });

        const totalScore = completed.reduce((sum, item) => sum + calculateScore(item), 0);

        const elTotal = document.getElementById('totalAchievements');
        const elMonth = document.getElementById('thisMonthCount');
        const elYear = document.getElementById('thisYearCount');
        const elScore = document.getElementById('totalScore');

        if (elTotal) elTotal.textContent = String(completed.length);
        if (elMonth) elMonth.textContent = String(thisMonth.length);
        if (elYear) elYear.textContent = String(thisYear.length);
        if (elScore) elScore.textContent = String(totalScore);
      }

      // ===== Estatísticas por categoria + recentes =====
      function updateCategoryStats() {
        const categories = {
          places: completed.filter((item) => item.category === 'places' || item.type === 'trip').length,
          experiences: completed.filter((item) => item.category === 'experiences' || item.type === 'event').length,
          gifts: completed.filter((item) => item.category === 'gifts').length,
          goals: completed.filter((item) => item.category === 'goals').length,
        };

        const elPlaces = document.getElementById('placesCount');
        const elExp = document.getElementById('experiencesCount');
        const elGifts = document.getElementById('giftsCount');
        const elGoals = document.getElementById('goalsCount');

        if (elPlaces) elPlaces.textContent = String(categories.places);
        if (elExp) elExp.textContent = String(categories.experiences);
        if (elGifts) elGifts.textContent = String(categories.gifts);
        if (elGoals) elGoals.textContent = String(categories.goals);

        const recent = completed.slice(0, 5);
        const recentList = document.getElementById('recentList');
        if (!recentList) return;

        if (recent.length === 0) {
          recentList.innerHTML = '<p class="empty-state">Nenhuma conquista recente.</p>';
          return;
        }

        recentList.innerHTML = recent
          .map(
            (item) => `
            <div class="achievement-item" onclick="viewAchievement(${item.id})">
              <div class="achievement-icon">${getAchievementIcon(item)}</div>
              <div class="achievement-details">
                <h4>${escapeHtml(item.title || 'Conquista')}</h4>
                <p class="achievement-date">${formatDate(item.completedAt)}</p>
                <span class="achievement-score">+${calculateScore(item)} pontos</span>
              </div>
            </div>
          `
          )
          .join('');
      }

      // ===== Modal de detalhes =====
      function viewAchievement(id) {
        const achievement = completed.find((item) => item.id === id);
        if (!achievement) return;

        const titleEl = document.getElementById('achievementTitle');
        if (titleEl) titleEl.textContent = achievement.title || 'Conquista';

        const content = document.getElementById('achievementContent');
        if (content) {
          content.innerHTML = `
            <div class="achievement-details-view">
              <div class="achievement-header">
                <div class="achievement-icon-large">${getAchievementIcon(achievement)}</div>
                <div class="achievement-info">
                  <p class="achievement-type">${getAchievementType(achievement)}</p>
                  <p class="achievement-date">Realizado em ${formatDate(achievement.completedAt)}</p>
                  <div class="achievement-score-large">+${calculateScore(achievement)} pontos de amor</div>
                </div>
              </div>

              ${
                achievement.description
                  ? `
                <div class="achievement-description">
                  <h4>Descrição</h4>
                  <p>${escapeHtml(achievement.description)}</p>
                </div>
              `
                  : ''
              }

              ${
                achievement.location
                  ? `
                <div class="achievement-location">
                  <h4>Local</h4>
                  <p>📍 ${escapeHtml(achievement.location)}</p>
                </div>
              `
                  : ''
              }

              ${
                achievement.estimate
                  ? `
                <div class="achievement-cost">
                  <h4>Investimento</h4>
                  <p>💰 ${escapeHtml(achievement.estimate)}</p>
                </div>
              `
                  : ''
              }

              <div class="achievement-celebration">
                <h4>Celebração</h4>
                <p>Parabéns por mais essa conquista juntos! 🎉💕</p>
              </div>
            </div>
          `;
        }

        const modal = document.getElementById('achievementModal');
        if (modal) modal.style.display = 'flex';
      }

      function closeAchievementModal() {
        const modal = document.getElementById('achievementModal');
        if (modal) modal.style.display = 'none';
      }

      // ===== Helpers =====
      function getAchievementIcon(item) {
        if (item.type === 'trip') return '✈️';
        if (item.type === 'event') return '🎉';
        const categoryIcons = { places: '🗺️', experiences: '🎭', gifts: '🎁', goals: '🎯' };
        return categoryIcons[item.category] || '⭐';
      }

      function getAchievementType(item) {
        if (item.type === 'trip') return 'Viagem';
        if (item.type === 'event') return 'Evento';
        const categoryNames = {
          places: 'Lugar visitado',
          experiences: 'Experiência',
          gifts: 'Presente',
          goals: 'Objetivo alcançado',
        };
        return categoryNames[item.category] || 'Conquista';
      }

      function calculateScore(item) {
        let baseScore = 10;
        if (item.type === 'trip') baseScore = 50;
        else if (item.type === 'event') baseScore = 20;
        else if (item.priority === 'high') baseScore = 30;
        else if (item.priority === 'medium') baseScore = 20;
        else if (item.priority === 'low') baseScore = 10;
        return baseScore;
      }

      function formatDate(dateString) {
        const d = new Date(dateString);
        if (isNaN(d)) return '';
        return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
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

      // ===== Expor globais p/ onclicks do HTML =====
      window.viewAchievement = viewAchievement;
      window.closeAchievementModal = closeAchievementModal;

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
  <!-- Container principal que envolve toda a interface -->
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
        <li><a href="/realizadas" class="active"><i data-lucide="check-circle"></i> Realizadas</a></li>
        <li><a href="/config"><i data-lucide="settings"></i> Configurações</a></li>
      </ul>
    </nav>

    <!-- CONTEÚDO PRINCIPAL -->
    <main class="content">
      <div class="page-header">
        <h2>Conquistas Realizadas ✨</h2>
        <div class="achievement-counter">
          <span id="totalAchievements">0</span> conquistas
        </div>
      </div>

      <div class="achievements-stats">
        <div class="stat-item">
          <span id="thisMonthCount">0</span>
          <p>Este mês</p>
        </div>
        <div class="stat-item">
          <span id="thisYearCount">0</span>
          <p>Este ano</p>
        </div>
        <div class="stat-item">
          <span id="totalScore">0</span>
          <p>Pontos de amor</p>
        </div>
      </div>

      <div class="timeline-view">
        <h3>Linha do Tempo das Conquistas</h3>
        <div id="achievementsTimeline" class="timeline">
          <div class="empty-state">
            <i data-lucide="heart"></i>
            <p>Nenhuma conquista ainda</p>
            <span>Que tal realizar um dos seus desejos? 💖</span>
          </div>
        </div>
      </div>

      <div class="achievement-categories">
        <h3>Conquistas por Categoria</h3>
        <div class="categories-grid">
          <div class="category-card" data-category="places">
            <div class="category-icon">🗺️</div>
            <h4>Lugares Visitados</h4>
            <span class="category-count" id="placesCount">0</span>
          </div>
          <div class="category-card" data-category="experiences">
            <div class="category-icon">🎭</div>
            <h4>Experiências</h4>
            <span class="category-count" id="experiencesCount">0</span>
          </div>
          <div class="category-card" data-category="gifts">
            <div class="category-icon">🎁</div>
            <h4>Presentes</h4>
            <span class="category-count" id="giftsCount">0</span>
          </div>
          <div class="category-card" data-category="goals">
            <div class="category-icon">🎯</div>
            <h4>Objetivos</h4>
            <span class="category-count" id="goalsCount">0</span>
          </div>
        </div>
      </div>

      <div class="recent-achievements">
        <h3>Conquistas Recentes</h3>
        <div id="recentList" class="achievements-list">
          <p class="empty-state">Nenhuma conquista recente.</p>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal para exibir detalhes de uma conquista -->
  <div id="achievementModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="achievementTitle"></h3>
        <span class="close" onclick="closeAchievementModal()">&times;</span>
      </div>
      <div id="achievementContent"></div>
    </div>
  </div>
          `,
        }}
      />
    </>
  );
}
