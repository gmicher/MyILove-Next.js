// Recupera fotos do localStorage ou cria array vazio se não houver
let photos = JSON.parse(localStorage.getItem('photos')) || [];
// Filtro atual da galeria (all, selfie, date, travel, special, favorites)
let currentFilter = 'all';

// Executa funções quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  displayPhotos(); // Exibe as fotos na grid
  updateStats();   // Atualiza as estatísticas da galeria
});

// Abre o modal de adicionar foto
function openPhotoModal() {
  document.getElementById('photoModal').style.display = 'flex';
  // Define a data atual no campo de data
  document.getElementById('photoDate').value = new Date().toISOString().split('T')[0];
}

// Fecha o modal de adicionar foto e reseta o formulário
function closePhotoModal() {
  document.getElementById('photoModal').style.display = 'none';
  document.getElementById('photoForm').reset();
  document.getElementById('photoPreview').innerHTML = ''; // Limpa preview
}

// Fecha o modal de visualização de foto
function closeViewModal() {
  document.getElementById('viewModal').style.display = 'none';
}

// Preview da foto selecionada no input
document.getElementById('photoFile').addEventListener('change', function(e) {
  const file = e.target.files[0]; // Pega arquivo selecionado
  const preview = document.getElementById('photoPreview');

  if (file) {
    const reader = new FileReader();
    // Quando a leitura do arquivo termina, cria uma imagem no preview
    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file); // Lê arquivo como URL de dados
  }
});

// Evento de submissão do formulário de nova foto
document.getElementById('photoForm').addEventListener('submit', (e) => {
  e.preventDefault(); // Evita reload da página

  const fileInput = document.getElementById('photoFile');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      // Cria objeto photo com todos os dados
      const photo = {
        id: Date.now(), // ID único
        title: document.getElementById('photoTitle').value,
        description: document.getElementById('photoDescription').value,
        date: document.getElementById('photoDate').value,
        category: document.getElementById('photoCategory').value,
        location: document.getElementById('photoLocation').value,
        image: e.target.result, // Conteúdo da imagem
        isFavorite: false,      // Se é favorita
        createdAt: new Date().toISOString()
      };

      photos.unshift(photo); // Adiciona no início do array
      localStorage.setItem('photos', JSON.stringify(photos)); // Salva no localStorage

      displayPhotos(); // Atualiza grid
      updateStats();   // Atualiza estatísticas
      closePhotoModal(); // Fecha modal
    };
    reader.readAsDataURL(file);
  }
});

// Função para alterar filtro da galeria
function filterPhotos(category) {
  currentFilter = category;

  // Remove classe active de todos os botões
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active'); // Adiciona active no botão clicado

  displayPhotos(); // Atualiza grid com o filtro
}

// Função que exibe as fotos na grid
function displayPhotos() {
  const grid = document.getElementById('photosGrid');

  let filteredPhotos = photos;

  // Filtra por favoritas ou categoria específica
  if (currentFilter === 'favorites') {
    filteredPhotos = photos.filter(photo => photo.isFavorite);
  } else if (currentFilter !== 'all') {
    filteredPhotos = photos.filter(photo => photo.category === currentFilter);
  }

  // Se não houver fotos, exibe placeholder
  if (filteredPhotos.length === 0) {
    grid.innerHTML = `
      <div class="photo-placeholder">
        <i data-lucide="camera"></i>
        <p>Nenhuma foto encontrada</p>
        <span>Comece a criar memórias visuais do seu amor! 💕</span>
      </div>
    `;
    lucide.createIcons(); // Atualiza ícones Lucide
    return;
  }

  // Mapeia as fotos filtradas para o HTML
  grid.innerHTML = filteredPhotos.map(photo => `
    <div class="photo-item" onclick="viewPhoto(${photo.id})">
      <div class="photo-image">
        <img src="${photo.image}" alt="${photo.title}">
        <div class="photo-overlay">
          <div class="photo-actions">
            <!-- Botão de favorita -->
            <button onclick="event.stopPropagation(); toggleFavorite(${photo.id})" class="favorite-btn ${photo.isFavorite ? 'active' : ''}">
              <i data-lucide="heart"></i>
            </button>
            <!-- Botão de excluir -->
            <button onclick="event.stopPropagation(); deletePhoto(${photo.id})" class="delete-btn">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="photo-info">
        <h4>${photo.title}</h4>
        <p class="photo-date">${formatDate(photo.date)}</p>
        ${photo.location ? `<p class="photo-location">📍 ${photo.location}</p>` : ''}
      </div>
    </div>
  `).join('');

  lucide.createIcons(); // Atualiza ícones Lucide
}

// Abre modal de visualização da foto
function viewPhoto(id) {
  const photo = photos.find(p => p.id === id);
  if (photo) {
    const content = document.getElementById('photoViewContent');
    content.innerHTML = `
      <div class="photo-view">
        <img src="${photo.image}" alt="${photo.title}">
        <div class="photo-details">
          <h3>${photo.title}</h3>
          <p class="photo-date">${formatDate(photo.date)}</p>
          ${photo.location ? `<p class="photo-location">📍 ${photo.location}</p>` : ''}
          ${photo.description ? `<p class="photo-description">${photo.description}</p>` : ''}
          <div class="photo-category">${getCategoryIcon(photo.category)} ${getCategoryName(photo.category)}</div>
        </div>
      </div>
    `;
    document.getElementById('viewModal').style.display = 'flex';
  }
}

// Alterna favorita / desfavorita
function toggleFavorite(id) {
  const photo = photos.find(p => p.id === id);
  if (photo) {
    photo.isFavorite = !photo.isFavorite;
    localStorage.setItem('photos', JSON.stringify(photos));
    displayPhotos();
    updateStats();
  }
}

// Exclui uma foto
function deletePhoto(id) {
  if (confirm('Tem certeza que deseja excluir esta foto?')) {
    photos = photos.filter(photo => photo.id !== id);
    localStorage.setItem('photos', JSON.stringify(photos));
    displayPhotos();
    updateStats();
  }
}

// Atualiza estatísticas da galeria
function updateStats() {
  document.getElementById('totalPhotos').textContent = photos.length;
  document.getElementById('totalAlbums').textContent = new Set(photos.map(p => p.category)).size;
  document.getElementById('favoritesCount').textContent = photos.filter(p => p.isFavorite).length;
}

// Retorna ícone baseado na categoria
function getCategoryIcon(category) {
  const icons = {
    selfie: '🤳',
    date: '💕',
    travel: '✈️',
    special: '⭐'
  };
  return icons[category] || '📸';
}

// Retorna nome legível da categoria
function getCategoryName(category) {
  const names = {
    selfie: 'Selfie',
    date: 'Encontro',
    travel: 'Viagem',
    special: 'Momento especial'
  };
  return names[category] || 'Foto';
}

// Formata datas para pt-BR
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}
