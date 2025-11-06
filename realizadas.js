// Realizadas JavaScript
// Recupera a lista de conquistas completadas do localStorage ou inicializa como array vazio
let completed = JSON.parse(localStorage.getItem('completed')) || [];

// Executa quando todo o conteúdo da página foi carregado
document.addEventListener('DOMContentLoaded', () => {
  loadCompletedItems();    // Carrega todos os itens realizados (desejos, eventos, viagens)
  displayAchievements();   // Mostra a timeline das conquistas
  updateStats();           // Atualiza estatísticas gerais (mês, ano, pontos)
  updateCategoryStats();   // Atualiza contadores por categoria e conquistas recentes
});

// Função para carregar e combinar todos os itens realizados
function loadCompletedItems() {
  // Recupera desejos realizados do localStorage
  const completedWishes = JSON.parse(localStorage.getItem('completed')) || [];

  // Recupera eventos passados e filtra somente os que já ocorreram
  const events = JSON.parse(localStorage.getItem('events')) || [];
  const pastEvents = events.filter(event => new Date(event.date) < new Date());

  // Recupera viagens completadas
  const trips = JSON.parse(localStorage.getItem('trips')) || [];
  const completedTrips = trips.filter(trip => trip.status === 'completed');

  // Combina todos os itens realizados em um único array
  completed = [
    ...completedWishes,
    ...pastEvents.map(event => ({
      ...event,
      type: 'event',           // Marca como evento
      completedAt: event.date  // Data de conclusão
    })),
    ...completedTrips.map(trip => ({
      ...trip,
      type: 'trip',            // Marca como viagem
      completedAt: trip.endDate,
      title: `Viagem para ${trip.destination}`  // Cria título descritivo
    }))
  ];

  // Ordena os itens por data de conclusão (mais recentes primeiro)
  completed.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
}

// Função para renderizar a timeline das conquistas
function displayAchievements() {
  const timeline = document.getElementById('achievementsTimeline');

  // Se não houver conquistas, mostra o estado vazio
  if (completed.length === 0) {
    timeline.innerHTML = `
      <div class="empty-state">
        <i data-lucide="heart"></i>
        <p>Nenhuma conquista ainda</p>
        <span>Que tal realizar um dos seus desejos? 💖</span>
      </div>
    `;
    lucide.createIcons();  // Inicializa os ícones do Lucide
    return;
  }

  // Monta os itens da timeline dinamicamente
  timeline.innerHTML = completed.map((item, index) => `
    <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}" onclick="viewAchievement(${item.id})">
      <div class="timeline-date">${formatDate(item.completedAt)}</div>
      <div class="timeline-content">
        <div class="achievement-icon">${getAchievementIcon(item)}</div>
        <h4>${item.title}</h4>
        <p class="achievement-type">${getAchievementType(item)}</p>
        ${item.description ? `<p class="achievement-desc">${truncateText(item.description, 60)}</p>` : ''}
        <div class="achievement-score">+${calculateScore(item)} pontos</div>
      </div>
    </div>
  `).join('');

  lucide.createIcons(); // Inicializa os ícones
}

// Atualiza estatísticas gerais
function updateStats() {
  const now = new Date(); // Data atual para comparar mês e ano

  // Filtra conquistas que ocorreram no mês atual
  const thisMonth = completed.filter(item => {
    const date = new Date(item.completedAt); // Converte a data da conquista para objeto Date
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  // Filtra conquistas que ocorreram no ano atual
  const thisYear = completed.filter(item => {
    const date = new Date(item.completedAt);
    return date.getFullYear() === now.getFullYear();
  });

  // Calcula a soma dos pontos de todas as conquistas
  const totalScore = completed.reduce((sum, item) => sum + calculateScore(item), 0);

  // Atualiza o DOM com os valores calculados
  document.getElementById('totalAchievements').textContent = completed.length; // Total de conquistas
  document.getElementById('thisMonthCount').textContent = thisMonth.length;    // Conquistas do mês
  document.getElementById('thisYearCount').textContent = thisYear.length;      // Conquistas do ano
  document.getElementById('totalScore').textContent = totalScore;              // Pontos totais
}

// Atualiza contadores por categoria e recentes
function updateCategoryStats() {
  // Calcula a quantidade de conquistas em cada categoria
  const categories = {
    places: completed.filter(item => item.category === 'places' || item.type === 'trip').length,
    experiences: completed.filter(item => item.category === 'experiences' || item.type === 'event').length,
    gifts: completed.filter(item => item.category === 'gifts').length,
    goals: completed.filter(item => item.category === 'goals').length
  };

  // Atualiza os elementos DOM com os valores de cada categoria
  document.getElementById('placesCount').textContent = categories.places;
  document.getElementById('experiencesCount').textContent = categories.experiences;
  document.getElementById('giftsCount').textContent = categories.gifts;
  document.getElementById('goalsCount').textContent = categories.goals;

  // Mostra as 5 conquistas mais recentes
  const recent = completed.slice(0, 5);
  const recentList = document.getElementById('recentList');

  if (recent.length === 0) {
    // Caso não haja conquistas recentes, mostra mensagem de estado vazio
    recentList.innerHTML = '<p class="empty-state">Nenhuma conquista recente.</p>';
    return;
  }

  // Monta a lista de conquistas recentes no DOM
  recentList.innerHTML = recent.map(item => `
    <div class="achievement-item" onclick="viewAchievement(${item.id})">
      <div class="achievement-icon">${getAchievementIcon(item)}</div>
      <div class="achievement-details">
        <h4>${item.title}</h4>
        <p class="achievement-date">${formatDate(item.completedAt)}</p>
        <span class="achievement-score">+${calculateScore(item)} pontos</span>
      </div>
    </div>
  `).join('');
}

// Exibe modal com detalhes completos da conquista
function viewAchievement(id) {
  const achievement = completed.find(item => item.id === id); // Busca a conquista pelo ID
  if (achievement) {
    // Atualiza o título do modal
    document.getElementById('achievementTitle').textContent = achievement.title;

    // Atualiza o conteúdo do modal
    const content = document.getElementById('achievementContent');
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

        ${achievement.description ? `
          <div class="achievement-description">
            <h4>Descrição</h4>
            <p>${achievement.description}</p>
          </div>
        ` : ''}

        ${achievement.location ? `
          <div class="achievement-location">
            <h4>Local</h4>
            <p>📍 ${achievement.location}</p>
          </div>
        ` : ''}

        ${achievement.estimate ? `
          <div class="achievement-cost">
            <h4>Investimento</h4>
            <p>💰 ${achievement.estimate}</p>
          </div>
        ` : ''}

        <div class="achievement-celebration">
          <h4>Celebração</h4>
          <p>Parabéns por mais essa conquista juntos! 🎉💕</p>
        </div>
      </div>
    `;

    // Exibe o modal na tela
    document.getElementById('achievementModal').style.display = 'flex';
  }
}

// Fecha o modal de conquistas
function closeAchievementModal() {
  document.getElementById('achievementModal').style.display = 'none';
}

// Retorna o ícone apropriado da conquista
function getAchievementIcon(item) {
  if (item.type === 'trip') return '✈️';       // Viagem
  if (item.type === 'event') return '🎉';      // Evento

  // Ícones por categoria
  const categoryIcons = {
    places: '🗺️',
    experiences: '🎭',
    gifts: '🎁',
    goals: '🎯'
  };
  return categoryIcons[item.category] || '⭐'; // Ícone padrão
}

// Retorna o nome legível da conquista
function getAchievementType(item) {
  if (item.type === 'trip') return 'Viagem';
  if (item.type === 'event') return 'Evento';

  const categoryNames = {
    places: 'Lugar visitado',
    experiences: 'Experiência',
    gifts: 'Presente',
    goals: 'Objetivo alcançado'
  };
  return categoryNames[item.category] || 'Conquista';
}

// Calcula pontuação da conquista
function calculateScore(item) {
  let baseScore = 10;

  if (item.type === 'trip') baseScore = 50;       // Viagem = 50 pontos
  else if (item.type === 'event') baseScore = 20; // Evento = 20 pontos
  else if (item.priority === 'high') baseScore = 30;
  else if (item.priority === 'medium') baseScore = 20;
  else if (item.priority === 'low') baseScore = 10;

  return baseScore;
}

// Formata datas para "dia de mês de ano"
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Trunca textos longos adicionando reticências
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
