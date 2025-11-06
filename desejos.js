// Script de gerenciamento da página de Desejos

// Recupera a lista de desejos do localStorage ou cria um array vazio se não houver
let wishes = JSON.parse(localStorage.getItem('wishes')) || [];

// Define o filtro atual como "all" (todos)
let currentFilter = 'all';

// Executa quando o DOM estiver totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
  displayWishes(); // Mostra os desejos salvos na tela
});

// Funções para abrir e fechar o modal de cadastro de desejo
function openWishModal() {
  // Exibe o modal de cadastro
  document.getElementById('wishModal').style.display = 'flex';
}

function closeWishModal() {
  // Oculta o modal de cadastro
  document.getElementById('wishModal').style.display = 'none';
  // Reseta todos os campos do formulário
  document.getElementById('wishForm').reset();
}

// Cadastro de um novo desejo
document.getElementById('wishForm').addEventListener('submit', (e) => {
  e.preventDefault(); // Evita o envio padrão do formulário

  // Cria um objeto com os dados do desejo
  const wish = {
    id: Date.now(), // Gera um ID único baseado no timestamp atual
    title: document.getElementById('wishTitle').value,
    description: document.getElementById('wishDescription').value,
    category: document.getElementById('wishCategory').value,
    priority: document.getElementById('wishPriority').value,
    estimate: document.getElementById('wishEstimate').value,
    completed: false, // Inicialmente o desejo não está realizado
    createdAt: new Date().toISOString() // Data de criação
  };

  // Adiciona o desejo à lista
  wishes.push(wish);

  // Atualiza o localStorage para persistir os dados
  localStorage.setItem('wishes', JSON.stringify(wishes));

  // Atualiza a exibição na tela
  displayWishes();

  // Fecha o modal após salvar
  closeWishModal();
});

// Filtragem de desejos por categoria
function filterWishes(category) {
  currentFilter = category; // Atualiza o filtro atual

  // Atualiza visualmente quais botões estão ativos
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active'); // Adiciona classe "active" ao botão clicado

  displayWishes(); // Atualiza a exibição com base no filtro
}

// Função que exibe os desejos na tela
function displayWishes() {
  const grid = document.getElementById('wishesGrid'); // Container dos cards

  // Filtra os desejos se houver filtro selecionado
  let filteredWishes = wishes;
  if (currentFilter !== 'all') {
    filteredWishes = wishes.filter(wish => wish.category === currentFilter);
  }

  // Se não houver desejos filtrados, mostra mensagem de vazio
  if (filteredWishes.length === 0) {
    grid.innerHTML = '<p class="empty-state">Nenhum desejo encontrado. Que tal sonhar um pouco? ✨</p>';
    return;
  }

  // Gera o HTML para cada desejo
  grid.innerHTML = filteredWishes.map(wish => `
    <div class="wish-card ${wish.priority}">
      <div class="wish-header">
        <div class="wish-category">${getCategoryIcon(wish.category)}</div>
        <div class="wish-priority">${getPriorityIcon(wish.priority)}</div>
      </div>
      <h4>${wish.title}</h4>
      ${wish.description ? `<p class="wish-description">${wish.description}</p>` : ''}
      ${wish.estimate ? `<p class="wish-estimate">💰 ${wish.estimate}</p>` : ''}
      <div class="wish-actions">
        <button class="complete-btn" onclick="completeWish(${wish.id})" title="Marcar como realizado">
          <i data-lucide="check"></i>
        </button>
        <button class="delete-btn" onclick="deleteWish(${wish.id})" title="Excluir">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>
  `).join('');

  // Cria os ícones usando a biblioteca Lucide
  lucide.createIcons();
}

// Funções auxiliares para ícones
function getCategoryIcon(category) {
  const icons = {
    places: '🗺️',
    experiences: '🎭',
    gifts: '🎁',
    goals: '🎯'
  };
  return icons[category] || '💫'; // Ícone padrão caso categoria não exista
}

function getPriorityIcon(priority) {
  const icons = {
    low: '🔵',
    medium: '🟡',
    high: '🔴'
  };
  return icons[priority] || '🔵'; // Ícone padrão para prioridade
}

// Função para marcar desejo como realizado
function completeWish(id) {
  if (confirm('Parabéns! Vocês realizaram este desejo? 🎉')) {
    const wish = wishes.find(w => w.id === id);
    if (wish) {
      wish.completed = true;
      wish.completedAt = new Date().toISOString();

      // Recupera lista de desejos realizados e adiciona o desejo concluído
      let completed = JSON.parse(localStorage.getItem('completed')) || [];
      completed.push(wish);
      localStorage.setItem('completed', JSON.stringify(completed));

      // Remove o desejo da lista ativa
      wishes = wishes.filter(w => w.id !== id);
      localStorage.setItem('wishes', JSON.stringify(wishes));

      // Atualiza a exibição
      displayWishes();
    }
  }
}

// Função para deletar um desejo
function deleteWish(id) {
  if (confirm('Tem certeza que deseja excluir este desejo?')) {
    // Remove o desejo da lista
    wishes = wishes.filter(wish => wish.id !== id);
    localStorage.setItem('wishes', JSON.stringify(wishes));

    // Atualiza a exibição
    displayWishes();
  }
}
