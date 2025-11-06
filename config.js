// CONFIGURAÇÕES PADRÃO
const DEFAULT_SETTINGS = {
  theme: 'light',           // Tema inicial da interface
  color: 'pink',            // Cor principal inicial
  notifications: {          // Preferências de notificações
    eventReminders: false,
    anniversaryReminders: false,
    achievementCelebrations: false
  },
  couple: {                 // Dados do casal
    partner1Name: '',
    partner2Name: '',
    relationshipStart: '',
    description: ''
  },
  importantDates: []        // Lista de datas importantes
};

// Carrega as configurações salvas ou aplica as padrão
let settings = loadSettings();

// FUNÇÃO PARA CARREGAR CONFIGURAÇÕES
function loadSettings() {
  try {
    // Recupera do localStorage
    const raw = localStorage.getItem('myilove_settings');

    // Se não existir, retorna cópia das configurações padrão
    if (!raw) return structuredClone(DEFAULT_SETTINGS);

    const parsed = JSON.parse(raw); // Converte string JSON para objeto

    // Mescla dados salvos com padrão para garantir integridade
    return {
      ...structuredClone(DEFAULT_SETTINGS), // cópia base
      ...parsed,                            // sobrescreve com dados salvos
      notifications: { 
        ...DEFAULT_SETTINGS.notifications, 
        ...(parsed.notifications || {})     // sobrescreve apenas notificações
      },
      couple: { 
        ...DEFAULT_SETTINGS.couple, 
        ...(parsed.couple || {})             // sobrescreve apenas dados do casal
      },
      importantDates: Array.isArray(parsed.importantDates) ? parsed.importantDates : [] // garante array
    };
  } catch {
    // Se houver erro no parse, retorna padrão
    return structuredClone(DEFAULT_SETTINGS);
  }
}

// FUNÇÃO PARA SALVAR CONFIGURAÇÕES
function saveSettings() {
  localStorage.setItem('myilove_settings', JSON.stringify(settings));
}

// MAPA DE CORES PRINCIPAIS
const ACCENT_MAP = {
  pink: '#ff4fa0',
  purple: '#7a3cff',
  blue: '#4da3ff',
  green: '#34c759',
  red: '#ff3b30'
};

// APLICA TEMA E COR SELECIONADOS
function applyTheme() {
  const root = document.documentElement; // Elemento <html> para alterar variáveis CSS

  // Define cores de fundo, cards, textos e linhas com base no tema
  if (settings.theme === 'light') {
    root.style.setProperty('--bg', '#faf9fb');
    root.style.setProperty('--card', '#ffffff');
    root.style.setProperty('--text', '#333333');
    root.style.setProperty('--line', '#eee');
  } else if (settings.theme === 'dark') {
    root.style.setProperty('--bg', '#0f0f12');
    root.style.setProperty('--card', '#15151a');
    root.style.setProperty('--text', '#f2f2f2');
    root.style.setProperty('--line', '#2a2a31');
  } else if (settings.theme === 'romantic') {
    root.style.setProperty('--bg', '#fff4f8');
    root.style.setProperty('--card', '#ffffff');
    root.style.setProperty('--text', '#3a2b34');
    root.style.setProperty('--line', '#ffd6e8');
  }

  // Aplica a cor de destaque selecionada
  root.style.setProperty('--purple', ACCENT_MAP[settings.color] || ACCENT_MAP.pink);
}

// INICIALIZA ICONES LUCIDE
function initLucide() {
  try {
    if (window.lucide?.createIcons) window.lucide.createIcons(); // Cria os ícones
  } catch {}
}

// SINCRONIZA APARÊNCIA COM ELEMENTOS HTML
function hydrateAppearance() {
  const themeSelect = document.getElementById('themeSelect');

  if (themeSelect) {
    // Aplica valor inicial
    themeSelect.value = settings.theme;

    // Escuta mudança de tema
    themeSelect.addEventListener('change', () => {
      settings.theme = themeSelect.value;
      saveSettings();   // salva no localStorage
      applyTheme();     // aplica visualmente
    });
  }

  // Cor principal (paleta de cores)
  const options = document.querySelectorAll('.color-option');
  options.forEach(opt => {
    const c = opt.dataset.color;

    // Marca a cor ativa
    opt.classList.toggle('active', c === settings.color);

    // Ao clicar, altera cor principal
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      settings.color = c;
      saveSettings();
      applyTheme();
    });
  });
}

// SINCRONIZA NOTIFICAÇÕES COM ELEMENTOS HTML
function hydrateNotifications() {
  const ev = document.getElementById('eventReminders');
  const an = document.getElementById('anniversaryReminders');
  const ac = document.getElementById('achievementCelebrations');

  if (ev) {
    ev.checked = !!settings.notifications.eventReminders;
    ev.addEventListener('change', () => { 
      settings.notifications.eventReminders = ev.checked; 
      saveSettings(); 
    });
  }

  if (an) {
    an.checked = !!settings.notifications.anniversaryReminders;
    an.addEventListener('change', () => { 
      settings.notifications.anniversaryReminders = an.checked; 
      saveSettings(); 
    });
  }

  if (ac) {
    ac.checked = !!settings.notifications.achievementCelebrations;
    ac.addEventListener('change', () => { 
      settings.notifications.achievementCelebrations = ac.checked; 
      saveSettings(); 
    });
  }
}

// SINCRONIZA FORMULÁRIO DO CASAL
function hydrateCoupleForm() {
  const f = document.getElementById('coupleForm');
  if (!f) return;

  const p1 = document.getElementById('partner1Name');
  const p2 = document.getElementById('partner2Name');
  const rs = document.getElementById('relationshipStart');
  const desc = document.getElementById('coupleDescription');

  // Preenche valores iniciais
  if (p1) p1.value = settings.couple.partner1Name || '';
  if (p2) p2.value = settings.couple.partner2Name || '';
  if (rs) rs.value = settings.couple.relationshipStart || '';
  if (desc) desc.value = settings.couple.description || '';

  // Ao enviar, salva no settings
  f.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita refresh da página
    settings.couple.partner1Name = p1?.value.trim() || '';
    settings.couple.partner2Name = p2?.value.trim() || '';
    settings.couple.relationshipStart = rs?.value || '';
    settings.couple.description = desc?.value.trim() || '';
    saveSettings();
    updateStats(); // Atualiza estatísticas (função externa)
  });
}

// FUNÇÕES AUXILIARES DE DATAS

// Converte tipo interno para label legível
function typeLabel(t) {
  return t==='anniversary' ? 'Aniversário' :
         t==='first' ? 'Primeira vez' :
         'Data especial';
}

// Formata data ISO (YYYY-MM-DD) para padrão brasileiro (DD/MM/YYYY)
function formatDateBR(iso) {
  try {
    const [y, m, d] = iso.split('-');
    return `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`;
  } catch {
    return iso; // Retorna original se houver erro
  }
}

// RENDERIZAÇÃO DAS DATAS IMPORTANTES
function renderImportantDates() {
  const container = document.getElementById('importantDates');
  if (!container) return;

  const list = settings.importantDates;

  // Caso não haja datas, exibe mensagem de estado vazio
  if (!list || !list.length) {
    container.innerHTML = '<p class="empty-state">Nenhuma data importante cadastrada.</p>';
    return;
  }

  // Cria HTML para cada item da lista
  container.innerHTML = list.map(item => `
    <div class="date-item" data-id="${item.id}">
      <div>
        <strong>${item.title.replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]))}</strong>
        <p>${formatDateBR(item.date)} • ${typeLabel(item.type)}</p>
      </div>
      <button class="clear-btn small" data-action="remove">&times;</button>
    </div>
  `).join('');

  // Evento de remoção de datas importantes
  container.onclick = (e) => {
    const btn = e.target.closest('button[data-action="remove"]');
    if (!btn) return;

    const parent = btn.closest('.date-item');
    const id = parent?.dataset?.id;

    // Remove do array e atualiza localStorage
    settings.importantDates = settings.importantDates.filter(d => String(d.id) !== String(id));
    saveSettings();

    // Re-renderiza a lista
    renderImportantDates();
  };
}

// MODAIS DE DATAS IMPORTANTES
function addImportantDate() { openDateModal(); }

function openDateModal() {
  const m = document.getElementById('dateModal');
  if(m) m.classList.add('open'); // Exibe modal
}

function closeDateModal() {
  const m = document.getElementById('dateModal');
  if(m) m.classList.remove('open'); // Oculta modal
}

// FORMULÁRIO DE DATAS IMPORTANTES
function handleDateForm() {
  const form = document.getElementById('dateForm');
  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita refresh

    const title = document.getElementById('dateTitle')?.value.trim();
    const date = document.getElementById('dateValue')?.value;
    const type = document.getElementById('dateType')?.value || 'special';

    if(!title || !date) return; // Validação simples

    // Adiciona nova data ao settings
    settings.importantDates.push({ id: Date.now(), title, date, type });

    saveSettings();           // Salva alterações
    renderImportantDates();   // Atualiza interface
    closeDateModal();         // Fecha modal
    form.reset();             // Limpa formulário
  });
}

// EXPORTAÇÃO E IMPORTAÇÃO DE DADOS
function exportData() {
  const data = JSON.stringify(settings, null, 2);  // Converte settings para JSON
  const blob = new Blob([data], {type:'application/json'}); // Cria arquivo
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'myilove_backup.json';  // Nome do arquivo
  document.body.appendChild(a); a.click(); a.remove(); // Dispara download
  URL.revokeObjectURL(url); // Libera memória
}

function importData() {
  const input = document.getElementById('importFile');
  if(!input) return;

  input.value=''; // Limpa input
  input.onchange = () => {
    const file = input.files?.[0]; if(!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);

        // Mescla dados importados com padrões
        settings = {
          ...structuredClone(DEFAULT_SETTINGS),
          ...parsed,
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications||{}) },
          couple: { ...DEFAULT_SETTINGS.couple, ...(parsed.couple||{}) },
          importantDates: Array.isArray(parsed.importantDates)? parsed.importantDates: []
        };

        saveSettings();           // Salva no localStorage
        applyTheme();             // Aplica tema
        hydrateAppearance();      // Atualiza cores e tema
        hydrateNotifications();   // Atualiza checkboxes
        hydrateCoupleForm();      // Atualiza form do casal
        handleDateForm();         // Reaplica evento do form
        renderImportantDates();   // Re-renderiza datas
        updateStats();            // Atualiza estatísticas

        alert('Dados importados com sucesso!');
      } catch {
        alert('Arquivo inválido.');
      }
    };
    reader.readAsText(file); // Lê arquivo
  };
  input.click(); // Abre seletor de arquivo
}

// LIMPAR TODOS OS DADOS
function clearAllData() {
  if(!confirm('Tem certeza que deseja limpar TODOS os dados?')) return;

  localStorage.removeItem('myilove_settings'); // Remove do storage
  settings = structuredClone(DEFAULT_SETTINGS); // Reseta settings

  saveSettings();
  applyTheme(); hydrateAppearance(); hydrateNotifications(); hydrateCoupleForm(); handleDateForm(); renderImportantDates(); updateStats();

  alert('Todos os dados foram limpos.');
}

// ESTATÍSTICAS
function updateStats() {
  // Total de memórias (datas importantes)
  const mem = document.getElementById('totalMemories');
  if (mem) mem.textContent = String(settings.importantDates.length || 0);

  // Dias juntos
  const days = document.getElementById('relationshipDays');
  if (days){
    const start = settings.couple.relationshipStart;
    if (start){
      const d0 = new Date(start+'T00:00:00');
      const now = new Date();
      days.textContent = String(Math.max(0, Math.floor((now - d0)/(1000*60*60*24))));
    } else {
      days.textContent = '0';
    }
  }

  // Total de fotos
  const photos = document.getElementById('totalPhotos');
  if (photos){
    const arr = JSON.parse(localStorage.getItem('myilove_photos')||'[]');
    photos.textContent = String(arr.length||0);
  }

  // Total de viagens
  const trips = document.getElementById('totalTrips');
  if (trips){
    const arr = JSON.parse(localStorage.getItem('myilove_trips')||'[]');
    trips.textContent = String(arr.length||0);
  }
}

// EXPÕE FUNÇÕES PARA HTML
window.addImportantDate = addImportantDate;
window.exportData = exportData;
window.importData = importData;
window.clearAllData = clearAllData;
window.closeDateModal = closeDateModal;

// INICIALIZAÇÃO AO CARREGAR PÁGINA
document.addEventListener('DOMContentLoaded', ()=>{
  initLucide();           // Inicializa ícones
  applyTheme();           // Aplica tema
  hydrateAppearance();    // Atualiza cores
  hydrateNotifications(); // Atualiza checkboxes
  hydrateCoupleForm();    // Preenche formulário do casal
  handleDateForm();       // Configura eventos do form
  renderImportantDates(); // Renderiza datas importantes
  updateStats();          // Atualiza estatísticas
});
