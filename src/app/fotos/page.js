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
      let photos = JSON.parse(localStorage.getItem('photos')) || [];
      let currentFilter = 'all';

      // ===== Inicialização =====
      displayPhotos();
      updateStats();

      // ===== Abertura/fechamento de modais =====
      function openPhotoModal() {
        const modal = document.getElementById('photoModal');
        if (modal) modal.style.display = 'flex';
        const date = document.getElementById('photoDate');
        if (date) date.value = new Date().toISOString().split('T')[0];
      }

      function closePhotoModal() {
        const modal = document.getElementById('photoModal');
        const form = document.getElementById('photoForm');
        const preview = document.getElementById('photoPreview');
        if (modal) modal.style.display = 'none';
        form?.reset();
        if (preview) preview.innerHTML = '';
      }

      function closeViewModal() {
        const modal = document.getElementById('viewModal');
        if (modal) modal.style.display = 'none';
      }

      // ===== Preview de upload =====
      document.getElementById('photoFile')?.addEventListener('change', function (e) {
        const file = e.target.files?.[0];
        const preview = document.getElementById('photoPreview');
        if (!preview) return;

        if (file) {
          const reader = new FileReader();
          reader.onload = function (ev) {
            preview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
          };
          reader.readAsDataURL(file);
        } else {
          preview.innerHTML = '';
        }
      });

      // ===== Submit do formulário =====
      document.getElementById('photoForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('photoFile');
        const file = fileInput?.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (ev) {
          const photo = {
            id: Date.now(),
            title: document.getElementById('photoTitle')?.value || '',
            description: document.getElementById('photoDescription')?.value || '',
            date: document.getElementById('photoDate')?.value || '',
            category: document.getElementById('photoCategory')?.value || 'special',
            location: document.getElementById('photoLocation')?.value || '',
            image: ev.target.result,
            isFavorite: false,
            createdAt: new Date().toISOString(),
          };

          photos.unshift(photo);
          localStorage.setItem('photos', JSON.stringify(photos));
          displayPhotos();
          updateStats();
          closePhotoModal();
        };
        reader.readAsDataURL(file);
      });

      // ===== Filtro =====
      function filterPhotos(category, evt) {
        currentFilter = category;

        (document.querySelectorAll('.filter-btn') || []).forEach((btn) => {
          btn.classList.remove('active');
        });
        evt?.target?.classList?.add('active');

        displayPhotos();
      }

      // ===== Renderização da grid =====
      function displayPhotos() {
        const grid = document.getElementById('photosGrid');
        if (!grid) return;

        let filteredPhotos = photos;
        if (currentFilter === 'favorites') {
          filteredPhotos = photos.filter((p) => p.isFavorite);
        } else if (currentFilter !== 'all') {
          filteredPhotos = photos.filter((p) => p.category === currentFilter);
        }

        if (filteredPhotos.length === 0) {
          grid.innerHTML = `
            <div class="photo-placeholder">
              <i data-lucide="camera"></i>
              <p>Nenhuma foto encontrada</p>
              <span>Comece a criar memórias visuais do seu amor! 💕</span>
            </div>
          `;
          try { window.lucide?.createIcons?.(); } catch {}
          return;
        }

        grid.innerHTML = filteredPhotos
          .map(
            (photo) => `
          <div class="photo-item" onclick="viewPhoto(${photo.id})">
            <div class="photo-image">
              <img src="${photo.image}" alt="${escapeHtml(photo.title)}">
              <div class="photo-overlay">
                <div class="photo-actions">
                  <button onclick="event.stopPropagation(); toggleFavorite(${photo.id})" class="favorite-btn ${photo.isFavorite ? 'active' : ''}">
                    <i data-lucide="heart"></i>
                  </button>
                  <button onclick="event.stopPropagation(); deletePhoto(${photo.id})" class="delete-btn">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="photo-info">
              <h4>${escapeHtml(photo.title)}</h4>
              <p class="photo-date">${formatDate(photo.date)}</p>
              ${photo.location ? `<p class="photo-location">📍 ${escapeHtml(photo.location)}</p>` : ''}
            </div>
          </div>
        `
          )
          .join('');

        try { window.lucide?.createIcons?.(); } catch {}
      }

      // ===== Visualização =====
      function viewPhoto(id) {
        const photo = photos.find((p) => p.id === id);
        if (!photo) return;
        const content = document.getElementById('photoViewContent');
        if (!content) return;

        content.innerHTML = `
          <div class="photo-view">
            <img src="${photo.image}" alt="${escapeHtml(photo.title)}">
            <div class="photo-details">
              <h3>${escapeHtml(photo.title)}</h3>
              <p class="photo-date">${formatDate(photo.date)}</p>
              ${photo.location ? `<p class="photo-location">📍 ${escapeHtml(photo.location)}</p>` : ''}
              ${photo.description ? `<p class="photo-description">${escapeHtml(photo.description)}</p>` : ''}
              <div class="photo-category">${getCategoryIcon(photo.category)} ${getCategoryName(photo.category)}</div>
            </div>
          </div>
        `;
        const modal = document.getElementById('viewModal');
        if (modal) modal.style.display = 'flex';
      }

      // ===== Ações =====
      function toggleFavorite(id) {
        const photo = photos.find((p) => p.id === id);
        if (!photo) return;
        photo.isFavorite = !photo.isFavorite;
        localStorage.setItem('photos', JSON.stringify(photos));
        displayPhotos();
        updateStats();
      }

      function deletePhoto(id) {
        if (!confirm('Tem certeza que deseja excluir esta foto?')) return;
        photos = photos.filter((p) => p.id !== id);
        localStorage.setItem('photos', JSON.stringify(photos));
        displayPhotos();
        updateStats();
      }

      function updateStats() {
        const totalPhotos = document.getElementById('totalPhotos');
        const totalAlbums = document.getElementById('totalAlbums');
        const favoritesCount = document.getElementById('favoritesCount');
        if (totalPhotos) totalPhotos.textContent = String(photos.length);
        if (totalAlbums) totalAlbums.textContent = String(new Set(photos.map((p) => p.category)).size);
        if (favoritesCount) favoritesCount.textContent = String(photos.filter((p) => p.isFavorite).length);
      }

      // ===== Helpers =====
      function getCategoryIcon(category) {
        const icons = { selfie: '🤳', date: '💕', travel: '✈️', special: '⭐' };
        return icons[category] || '📸';
      }
      function getCategoryName(category) {
        const names = { selfie: 'Selfie', date: 'Encontro', travel: 'Viagem', special: 'Momento especial' };
        return names[category] || 'Foto';
      }
      function formatDate(dateString) {
        const d = new Date(dateString);
        return isNaN(d) ? '' : d.toLocaleDateString('pt-BR');
      }
      function escapeHtml(s = '') {
        return String(s)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#039;');
      }

      // ===== Expor no window para handlers inline =====
      window.filterPhotos = function (category) {
        // adaptador para manter o mesmo onClick inline (recebe 'event' implícito)
        filterPhotos(category, window.event);
      };
      window.openPhotoModal = openPhotoModal;
      window.closePhotoModal = closePhotoModal;
      window.closeViewModal = closeViewModal;
      window.viewPhoto = viewPhoto;
      window.toggleFavorite = toggleFavorite;
      window.deletePhoto = deletePhoto;

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
      <div
        dangerouslySetInnerHTML={{
          __html: `
  <!-- Container principal da aplicação -->
  <div class="container">

    <!-- Sidebar de navegação lateral -->
    <nav class="sidebar">
      <h2>MyILove 💕</h2>
      <ul>
        <li><a href="/"><i data-lucide="home"></i> Início</a></li>
        <li><a href="/eventos"><i data-lucide="calendar"></i> Eventos</a></li>
        <li><a href="/desejos"><i data-lucide="heart"></i> Desejos</a></li>
        <li><a href="/anotacoes"><i data-lucide="file-text"></i> Anotações</a></li>
        <li><a href="/fotos" class="active"><i data-lucide="camera"></i> Fotos</a></li>
        <li><a href="/viagens"><i data-lucide="map"></i> Viagens</a></li>
        <li><a href="/realizadas"><i data-lucide="check-circle"></i> Realizadas</a></li>
        <li><a href="/config"><i data-lucide="settings"></i> Configurações</a></li>
      </ul>
    </nav>

    <!-- Conteúdo principal da página -->
    <main class="content">

      <div class="page-header">
        <h2>Galeria de Fotos 📸</h2>
        <button class="add-btn" onclick="openPhotoModal()">
          <i data-lucide="plus"></i> Adicionar Foto
        </button>
      </div>

      <div class="gallery-stats">
        <div class="stat-item">
          <span id="totalPhotos">0</span>
          <p>Total de fotos</p>
        </div>
        <div class="stat-item">
          <span id="totalAlbums">0</span>
          <p>Álbuns</p>
        </div>
        <div class="stat-item">
          <span id="favoritesCount">0</span>
          <p>Favoritas</p>
        </div>
      </div>

      <div class="gallery-filter">
        <button class="filter-btn active" onclick="filterPhotos('all')">Todas</button>
        <button class="filter-btn" onclick="filterPhotos('selfie')">Selfies</button>
        <button class="filter-btn" onclick="filterPhotos('date')">Encontros</button>
        <button class="filter-btn" onclick="filterPhotos('travel')">Viagens</button>
        <button class="filter-btn" onclick="filterPhotos('special')">Especiais</button>
        <button class="filter-btn" onclick="filterPhotos('favorites')">Favoritas</button>
      </div>

      <div class="photos-grid" id="photosGrid">
        <div class="photo-placeholder">
          <i data-lucide="camera"></i>
          <p>Nenhuma foto ainda</p>
          <span>Comece a criar memórias visuais do seu amor! 💕</span>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal para adicionar uma nova foto -->
  <div id="photoModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Adicionar Foto</h3>
        <span class="close" onclick="closePhotoModal()">&times;</span>
      </div>
      <form id="photoForm">
        <div class="photo-upload">
          <input type="file" id="photoFile" accept="image/*" required>
          <label for="photoFile" class="upload-label">
            <i data-lucide="upload"></i>
            Escolher foto
          </label>
          <div id="photoPreview" class="photo-preview"></div>
        </div>
        <input type="text" id="photoTitle" placeholder="Título da foto" required>
        <textarea id="photoDescription" placeholder="Descrição ou história desta foto..."></textarea>
        <input type="date" id="photoDate" required>
        <select id="photoCategory" required>
          <option value="">Categoria</option>
          <option value="selfie">Selfie</option>
          <option value="date">Encontro</option>
          <option value="travel">Viagem</option>
          <option value="special">Momento especial</option>
        </select>
        <input type="text" id="photoLocation" placeholder="Local (opcional)">
        <button type="submit" class="submit-btn">Adicionar Foto</button>
      </form>
    </div>
  </div>

  <!-- Modal para visualizar foto em tamanho maior -->
  <div id="viewModal" class="modal photo-viewer">
    <div class="modal-content large">
      <span class="close" onclick="closeViewModal()">&times;</span>
      <div id="photoViewContent"></div>
    </div>
  </div>
          `,
        }}
      />
    </>
  );
}
