// Configuração inicial

// Data atual do calendário
let currentDate = new Date();

// Array de eventos, carregando do localStorage ou vazio caso não exista
let events = JSON.parse(localStorage.getItem('events')) || [];

// Parse local de 'YYYY-MM-DD' para Date em horário local (00:00)
function parseLocalDate(isoDate) {
  const [y, m, d] = (isoDate || '').split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// Executa funções quando a página termina de carregar
document.addEventListener('DOMContentLoaded', () => {
  updateCalendar();    // Atualiza a visualização do calendário
  displayEvents();     // Mostra os eventos cadastrados
  updateMonthDisplay();// Atualiza o nome do mês na tela
});

// Funções de controle do mês

// Atualiza o título do mês atual no calendário
function updateMonthDisplay() {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  document.getElementById('currentMonth').textContent = 
    `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

// Avança ou retrocede meses
function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  updateCalendar();
  updateMonthDisplay();
}

// Funções do calendário

// Atualiza o calendário com os dias do mês
function updateCalendar() {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = ''; // Limpa a grid antes de renderizar

  // Cabeçalho com os dias da semana
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  daysOfWeek.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day-header';
    dayElement.textContent = day;
    grid.appendChild(dayElement);
  });

  // Calcula o primeiro e último dia do mês
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Define a data inicial exibida no calendário (início da semana do primeiro dia)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // Cria 42 células (6 semanas) para exibir os dias
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = date.getDate();

    // Diferencia dias de outros meses
    if (date.getMonth() !== currentDate.getMonth()) {
      dayElement.classList.add('other-month');
    }

    // Destaca o dia atual
    if (date.toDateString() === new Date().toDateString()) {
      dayElement.classList.add('today');
    }

    // Verifica se há algum evento nesta data
    const hasEvent = events.some(ev =>
  parseLocalDate(ev.date).toDateString() === date.toDateString()
);

    if (hasEvent) {
      dayElement.classList.add('has-event');
    }

    grid.appendChild(dayElement);
  }
}

// Modal de criação de evento

function openEventModal() {
  document.getElementById('eventModal').style.display = 'flex';
}

function closeEventModal() {
  document.getElementById('eventModal').style.display = 'none';
  document.getElementById('eventForm').reset();
}

// Cadastro de novos eventos

document.getElementById('eventForm').addEventListener('submit', (e) => {
  e.preventDefault(); // Impede o envio padrão do formulário

  // Cria objeto do evento com dados do formulário
  const event = {
    id: Date.now(), // ID único baseado no timestamp
    title: document.getElementById('eventTitle').value,
    date: document.getElementById('eventDate').value,
    time: document.getElementById('eventTime').value,
    description: document.getElementById('eventDescription').value,
    category: document.getElementById('eventCategory').value
  };

  events.push(event); // Adiciona ao array
  localStorage.setItem('events', JSON.stringify(events)); // Salva no localStorage

  displayEvents();    // Atualiza a lista de eventos
  updateCalendar();   // Atualiza o calendário para mostrar marcação
  closeEventModal();  // Fecha o modal
});

// Exibição dos eventos

function displayEvents() {
  const list = document.getElementById('eventsList');

  if (!events || events.length === 0) {
    list.innerHTML = '<p class="empty-state">Nenhum evento cadastrado. Que tal planejar algo especial? 💖</p>';
    return;
  }

  // Normaliza "hoje" para 00:00 local
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Converte todas as datas para local (00:00) antes de operar
  const withLocal = events.map(ev => ({ ...ev, _d: parseLocalDate(ev.date) }));

  const upcoming = withLocal
    .filter(ev => ev._d >= today)
    .sort((a, b) => a._d - b._d);

  // Se quiser, mostre um fallback dos 5 mais recentes do passado caso não haja próximos
  // (descomente se fizer sentido pra você)
  // const past = withLocal.filter(ev => ev._d < today).sort((a,b) => b._d - a._d).slice(0,5);

  list.innerHTML = upcoming.length
    ? upcoming.map(event => `
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
    : '<p class="empty-state">Nenhum evento futuro. Que tal planejar algo especial? 💖</p>';

  lucide.createIcons();
}


// Funções auxiliares

function getCategoryIcon(category) {
  const icons = {
    date: '💕',        // Encontro
    anniversary: '🎉', // Aniversário
    travel: '✈️',      // Viagem
    special: '⭐'       // Evento especial
  };
  return icons[category] || '📅';
}

// Formata a data no padrão brasileiro
function formatDate(dateString) {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('pt-BR');
}


// Excluir evento
function deleteEvent(id) {
  if (confirm('Tem certeza que deseja excluir este evento?')) {
    events = events.filter(event => event.id !== id); // Remove do array
    localStorage.setItem('events', JSON.stringify(events)); // Atualiza localStorage
    displayEvents();  // Atualiza lista
    updateCalendar(); // Atualiza calendário
  }
}
// ---------- Helpers robustos ----------
function parseLocalDate(isoDate) {
  // Aceita 'YYYY-MM-DD' e também 'YYYY-MM-DDTHH:mm' se vier
  if (!isoDate) return new Date(NaN);
  const onlyDate = String(isoDate).split('T')[0];
  const [y, m, d] = onlyDate.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function todayLocal00() {
  const t = new Date();
  t.setHours(0,0,0,0);
  return t;
}

// ---------- Substitua displayEvents por esta ----------
function displayEvents() {
  const list = document.getElementById('eventsList');

  if (!events || events.length === 0) {
    list.innerHTML = '<p class="empty-state">Nenhum evento cadastrado. Que tal planejar algo especial? 💖</p>';
    return;
  }

  const t0 = todayLocal00();

  // Normaliza datas em local 00:00, e guarda um campo calculado _d para ordenar/filtrar
  const normalized = events
    .map(ev => ({ ...ev, _d: parseLocalDate(ev.date) }))
    .filter(ev => !isNaN(ev._d)); // remove datas inválidas, se houver

  // Próximos (>= hoje)
  const upcoming = normalized
    .filter(ev => ev._d >= t0)
    .sort((a, b) => a._d - b._d);

  // Fallback: se não houver próximos, mostra os 5 mais recentes do passado
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

  if (window.lucide?.createIcons) lucide.createIcons();
}

// ---------- Ajuste no calendário dentro de updateCalendar ----------
/* Dentro de updateCalendar(), troque a verificação hasEvent por: */
/// const hasEvent = events.some(event =>
///   parseLocalDate(event.date).toDateString() === date.toDateString()
/// );

// ---------- Substitua formatDate por esta ----------
function formatDate(dateString) {
  const d = parseLocalDate(dateString);
  return isNaN(d) ? dateString : d.toLocaleDateString('pt-BR');
}
