// VIAGENS - LÓGICA PRINCIPAL

// Recupera viagens salvas no localStorage ou inicia com array vazio
let trips = JSON.parse(localStorage.getItem('trips')) || [];

// Armazena a aba atual exibida ('planned', 'current', 'completed')
let currentTab = 'planned';

// Ao carregar a página, exibe viagens e atualiza estatísticas
document.addEventListener('DOMContentLoaded', () => {
  displayTrips();  // Mostra as viagens na grade correta
  updateStats();   // Atualiza contadores gerais (total, destinos, dias)
});

// MODAIS DE VIAGEM

// Abre o modal de criar nova viagem
function openTripModal() {
  document.getElementById('tripModal').style.display = 'flex';
}

// Fecha o modal de criar viagem e reseta o formulário
function closeTripModal() {
  document.getElementById('tripModal').style.display = 'none';
  document.getElementById('tripForm').reset();
}

// Fecha o modal de detalhes de uma viagem
function closeTripDetailsModal() {
  document.getElementById('tripDetailsModal').style.display = 'none';
}

// ADICIONAR NOVA VIAGEM
document.getElementById('tripForm').addEventListener('submit', (e) => {
  e.preventDefault(); // Evita o envio padrão do formulário

  // Pega datas do formulário
  const startDate = new Date(document.getElementById('tripStartDate').value);
  const endDate = new Date(document.getElementById('tripEndDate').value);
  const today = new Date();

  // Determina status da viagem com base nas datas
  let status = 'planned';
  if (today >= startDate && today <= endDate) {
    status = 'current'; // Viagem em andamento
  } else if (today > endDate) {
    status = 'completed'; // Viagem concluída
  }

  // Cria objeto da viagem
  const trip = {
    id: Date.now(), // ID único baseado em timestamp
    destination: document.getElementById('tripDestination').value,
    startDate: document.getElementById('tripStartDate').value,
    endDate: document.getElementById('tripEndDate').value,
    description: document.getElementById('tripDescription').value,
    type: document.getElementById('tripType').value,
    budget: document.getElementById('tripBudget').value,
    notes: document.getElementById('tripNotes').value,
    status: status,
    createdAt: new Date().toISOString(),
    memories: [],   // Lista de memórias futuras
    checklist: []   // Lista de itens de planejamento
  };

  // Adiciona ao array de viagens e salva no localStorage
  trips.push(trip);
  localStorage.setItem('trips', JSON.stringify(trips));

  // Atualiza visualização e estatísticas
  displayTrips();
  updateStats();
  closeTripModal();
});

// ABAS (TABS) DE VIAGENS
function showTab(tab) {
  currentTab = tab; // Atualiza aba atual

  // Atualiza visual dos botões, deixando apenas o ativo destacado
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  // Mostra somente a seção da aba selecionada
  document.querySelectorAll('.trip-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(`${tab}Trips`).classList.add('active');

  // Atualiza as viagens exibidas
  displayTrips();
}

// EXIBIR VIAGENS NAS GRADES
function displayTrips() {
  const plannedGrid = document.getElementById('plannedGrid');
  const currentGrid = document.getElementById('currentGrid');
  const completedGrid = document.getElementById('completedGrid');

  // Filtra viagens por status
  const plannedTrips = trips.filter(trip => trip.status === 'planned');
  const currentTrips = trips.filter(trip => trip.status === 'current');
  const completedTrips = trips.filter(trip => trip.status === 'completed');

  // Atualiza os status antes de exibir
  updateTripStatuses();

  // Preenche cada grade ou mostra estado vazio
  plannedGrid.innerHTML = plannedTrips.length ? 
    plannedTrips.map(trip => createTripCard(trip)).join('') :
    '<p class="empty-state">Nenhuma viagem planejada. Que tal planejar uma escapada romântica? 🌍</p>';

  currentGrid.innerHTML = currentTrips.length ?
    currentTrips.map(trip => createTripCard(trip)).join('') :
    '<p class="empty-state">Nenhuma viagem em andamento.</p>';

  completedGrid.innerHTML = completedTrips.length ?
    completedTrips.map(trip => createTripCard(trip)).join('') :
    '<p class="empty-state">Nenhuma viagem realizada ainda.</p>';

  // Renderiza os ícones Lucide nos cards
  lucide.createIcons();
}

// ATUALIZA STATUS DAS VIAGENS
function updateTripStatuses() {
  const today = new Date();
  let updated = false;

  trips.forEach(trip => {
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    // Define novo status
    let newStatus = 'planned';
    if (today >= startDate && today <= endDate) {
      newStatus = 'current';
    } else if (today > endDate) {
      newStatus = 'completed';
    }

    // Atualiza somente se houver mudança
    if (trip.status !== newStatus) {
      trip.status = newStatus;
      updated = true;
    }
  });

  // Salva novamente no localStorage se houve atualização
  if (updated) {
    localStorage.setItem('trips', JSON.stringify(trips));
  }
}

// FUNÇÃO PARA CRIAR O CARD DE CADA VIAGEM
function createTripCard(trip) {
  // Calcula a duração da viagem em dias usando função auxiliar
  const duration = calculateDuration(trip.startDate, trip.endDate);

  // Obtém o ícone representativo do tipo da viagem (romântica, aventura etc.)
  const typeIcon = getTripTypeIcon(trip.type);
  
  // Retorna um template HTML como string com todas as informações do card
  return `
    <div class="trip-card ${trip.status}" onclick="viewTripDetails(${trip.id})">
      <!-- Cabeçalho do card: ícone do tipo + status -->
      <div class="trip-header">
        <div class="trip-type">${typeIcon}</div> <!-- Ícone do tipo de viagem -->
        <div class="trip-status">${getStatusBadge(trip.status)}</div> <!-- Badge do status -->
      </div>

      <!-- Destino da viagem -->
      <h4>${trip.destination}</h4>

      <!-- Datas da viagem -->
      <p class="trip-dates">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>

      <!-- Duração da viagem -->
      <p class="trip-duration">${duration} dias</p>

      <!-- Orçamento, exibido apenas se houver -->
      ${trip.budget ? `<p class="trip-budget">💰 ${trip.budget}</p>` : ''}

      <!-- Descrição resumida, se houver -->
      ${trip.description ? `<p class="trip-description">${truncateText(trip.description, 80)}</p>` : ''}

      <!-- Botões de ação: Editar e Excluir -->
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

// FUNÇÃO PARA EXIBIR DETALHES COMPLETOS DE UMA VIAGEM
function viewTripDetails(id) {
  // Busca a viagem pelo ID
  const trip = trips.find(t => t.id === id);

  // Se encontrar a viagem
  if (trip) {
    // Atualiza título do modal com o destino
    document.getElementById('tripDetailsTitle').textContent = trip.destination;
    
    // Seleciona a div onde o conteúdo do modal será exibido
    const content = document.getElementById('tripDetailsContent');

    // Monta o HTML do modal com informações completas da viagem
    content.innerHTML = `
      <div class="trip-details">

        <!-- Informações gerais da viagem -->
        <div class="trip-info">
          <h4>Informações da Viagem</h4>
          <p><strong>Período:</strong> ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>
          <p><strong>Duração:</strong> ${calculateDuration(trip.startDate, trip.endDate)} dias</p>
          <p><strong>Tipo:</strong> ${getTripTypeName(trip.type)}</p>
          ${trip.budget ? `<p><strong>Orçamento:</strong> ${trip.budget}</p>` : ''}
          <p><strong>Status:</strong> ${getStatusBadge(trip.status)}</p>
        </div>
        
        <!-- Descrição detalhada da viagem, se houver -->
        ${trip.description ? `
          <div class="trip-description">
            <h4>Descrição</h4>
            <p>${trip.description}</p>
          </div>
        ` : ''}
        
        <!-- Notas de planejamento da viagem, se houver -->
        ${trip.notes ? `
          <div class="trip-notes">
            <h4>Notas de Planejamento</h4>
            <p>${trip.notes}</p>
          </div>
        ` : ''}
        
        <!-- Botões de ações adicionais: adicionar memória e checklist -->
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
    
    // Exibe o modal
    document.getElementById('tripDetailsModal').style.display = 'flex';

    // Atualiza os ícones Lucide dentro do modal
    lucide.createIcons();
  }
}


// RETORNA O ÍCONE DE UM TIPO DE VIAGEM
function getTripTypeIcon(type) {
  // Mapeamento dos tipos de viagem para emojis
  const icons = {
    romantic: '💕',        // Romântica
    adventure: '🏔️',      // Aventura
    relax: '🏖️',          // Relaxante
    cultural: '🏛️',       // Cultural
    family: '👨‍👩‍👧‍👦'    // Família
  };
  // Retorna o ícone correspondente ou ✈️ como padrão se o tipo não existir
  return icons[type] || '✈️';
}

// RETORNA O NOME LEGÍVEL DE UM TIPO DE VIAGEM
function getTripTypeName(type) {
  // Mapeamento dos tipos de viagem para nomes legíveis
  const names = {
    romantic: 'Romântica',
    adventure: 'Aventura',
    relax: 'Relaxante',
    cultural: 'Cultural',
    family: 'Família'
  };
  // Retorna o nome correspondente ou "Viagem" como padrão
  return names[type] || 'Viagem';
}

// RETORNA O BADGE DE STATUS DE UMA VIAGEM
function getStatusBadge(status) {
  // Mapeamento dos status para badges com emojis
  const badges = {
    planned: '📅 Planejada',       // Viagem ainda planejada
    current: '🎒 Em andamento',   // Viagem em andamento
    completed: '✅ Realizada'      // Viagem concluída
  };
  // Retorna o badge correspondente ou o status original caso não esteja no mapa
  return badges[status] || status;
}

// CALCULA A DURAÇÃO EM DIAS DE UMA VIAGEM
function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);  // Converte string para objeto Date
  const end = new Date(endDate);      // Converte string para objeto Date
  const diffTime = Math.abs(end - start); // Diferença em milissegundos
  // Converte para dias e adiciona +1 para incluir o dia inicial
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// FORMATA UMA DATA PARA O PADRÃO "DD/MM/AAAA"
function formatDate(dateString) {
  const date = new Date(dateString); // Converte string para Date
  return date.toLocaleDateString('pt-BR'); // Retorna data formatada
}

// TRUNCA UM TEXTO PARA UM NÚMERO MÁXIMO DE CARACTERES
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text; // Se menor que o limite, retorna original
  return text.substring(0, maxLength) + '...'; // Senão, corta e adiciona reticências
}

// ATUALIZA OS ESTATÍSTICOS GERAIS DE VIAGENS
function updateStats() {
  const totalTrips = trips.length; // Total de viagens cadastradas

  // Conta quantos destinos diferentes existem usando Set
  const totalDestinations = new Set(trips.map(trip => trip.destination)).size;

  // Soma o total de dias de todas as viagens
  const totalDays = trips.reduce((sum, trip) => 
    sum + calculateDuration(trip.startDate, trip.endDate), 0
  );

  // Atualiza o DOM com os valores calculados
  document.getElementById('totalTrips').textContent = totalTrips;
  document.getElementById('totalDestinations').textContent = totalDestinations;
  document.getElementById('totalDays').textContent = totalDays;
}

// FUNÇÃO PARA EDITAR UMA VIAGEM (AINDA NÃO IMPLEMENTADA)
function editTrip(id) {
  console.log('Editar viagem:', id); // Exibe no console o id da viagem
}

// FUNÇÃO PARA EXCLUIR UMA VIAGEM
function deleteTrip(id) {
  // Confirmação antes de deletar
  if (confirm('Tem certeza que deseja excluir esta viagem?')) {
    // Filtra todas as viagens exceto a que será excluída
    trips = trips.filter(trip => trip.id !== id);

    // Atualiza o localStorage com a lista atualizada
    localStorage.setItem('trips', JSON.stringify(trips));

    // Atualiza a visualização dos cards
    displayTrips();

    // Atualiza os estatísticos gerais
    updateStats();
  }
}

// FUNÇÃO PARA ADICIONAR MEMÓRIAS A UMA VIAGEM (AINDA NÃO IMPLEMENTADA)
function addMemory(tripId) {
  console.log('Adicionar memória para viagem:', tripId);
}

// FUNÇÃO PARA ADICIONAR ITENS À LISTA DE TAREFAS (AINDA NÃO IMPLEMENTADA)
function addChecklistItem(tripId) {
  console.log('Adicionar item à lista para viagem:', tripId);
}
