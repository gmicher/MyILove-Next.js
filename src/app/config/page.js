'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Page() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Lucide stub (evita erro se o script ainda não carregou)
    if (!window.lucide) window.lucide = { createIcons: () => {} };

    requestAnimationFrame(() => {
      // ===== CONFIGURAÇÕES PADRÃO =====
      const DEFAULT_SETTINGS = {
        theme: 'light',
        color: 'pink',
        notifications: {
          eventReminders: false,
          anniversaryReminders: false,
          achievementCelebrations: false,
        },
        couple: {
          partner1Name: '',
          partner2Name: '',
          relationshipStart: '',
          description: '',
        },
        importantDates: [],
      };

      // ===== Estado =====
      let settings = loadSettings();

      // ===== Load/Save =====
      function loadSettings() {
        try {
          const raw = localStorage.getItem('myilove_settings');
          if (!raw) return structuredClone(DEFAULT_SETTINGS);
          const parsed = JSON.parse(raw);
          return {
            ...structuredClone(DEFAULT_SETTINGS),
            ...parsed,
            notifications: {
              ...DEFAULT_SETTINGS.notifications,
              ...(parsed.notifications || {}),
            },
            couple: {
              ...DEFAULT_SETTINGS.couple,
              ...(parsed.couple || {}),
            },
            importantDates: Array.isArray(parsed.importantDates)
              ? parsed.importantDates
              : [],
          };
        } catch {
          return structuredClone(DEFAULT_SETTINGS);
        }
      }

      function saveSettings() {
        localStorage.setItem('myilove_settings', JSON.stringify(settings));
      }

      // ===== Aparência =====
      const ACCENT_MAP = {
        pink: '#ff4fa0',
        purple: '#7a3cff',
        blue: '#4da3ff',
        green: '#34c759',
        red: '#ff3b30',
      };

      function applyTheme() {
        const root = document.documentElement;

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

        root.style.setProperty('--purple', ACCENT_MAP[settings.color] || ACCENT_MAP.pink);
      }

      function initLucide() {
        try { window.lucide?.createIcons?.(); } catch {}
      }

      function hydrateAppearance() {
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
          themeSelect.value = settings.theme;
          themeSelect.addEventListener('change', () => {
            settings.theme = themeSelect.value;
            saveSettings();
            applyTheme();
          });
        }

        const options = document.querySelectorAll('.color-option');
        options.forEach((opt) => {
          const c = opt.dataset.color;
          opt.classList.toggle('active', c === settings.color);
          opt.addEventListener('click', () => {
            options.forEach((o) => o.classList.remove('active'));
            opt.classList.add('active');
            settings.color = c;
            saveSettings();
            applyTheme();
          });
        });
      }

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

      function hydrateCoupleForm() {
        const f = document.getElementById('coupleForm');
        if (!f) return;

        const p1 = document.getElementById('partner1Name');
        const p2 = document.getElementById('partner2Name');
        const rs = document.getElementById('relationshipStart');
        const desc = document.getElementById('coupleDescription');

        if (p1) p1.value = settings.couple.partner1Name || '';
        if (p2) p2.value = settings.couple.partner2Name || '';
        if (rs) rs.value = settings.couple.relationshipStart || '';
        if (desc) desc.value = settings.couple.description || '';

        f.addEventListener('submit', (e) => {
          e.preventDefault();
          settings.couple.partner1Name = p1?.value.trim() || '';
          settings.couple.partner2Name = p2?.value.trim() || '';
          settings.couple.relationshipStart = rs?.value || '';
          settings.couple.description = desc?.value.trim() || '';
          saveSettings();
          updateStats();
        });
      }

      // ===== Datas importantes =====
      function typeLabel(t) {
        return t === 'anniversary' ? 'Aniversário' : t === 'first' ? 'Primeira vez' : 'Data especial';
      }

      function formatDateBR(iso) {
        try {
          const [y, m, d] = iso.split('-');
          return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
        } catch {
          return iso;
        }
      }

      function renderImportantDates() {
        const container = document.getElementById('importantDates');
        if (!container) return;

        const list = settings.importantDates;

        if (!list || !list.length) {
          container.innerHTML = '<p class="empty-state">Nenhuma data importante cadastrada.</p>';
          return;
        }

        container.innerHTML = list
          .map(
            (item) => `
          <div class="date-item" data-id="${item.id}">
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${formatDateBR(item.date)} • ${typeLabel(item.type)}</p>
            </div>
            <button class="clear-btn small" data-action="remove">&times;</button>
          </div>
        `
          )
          .join('');

        container.onclick = (e) => {
          const btn = e.target.closest('button[data-action="remove"]');
          if (!btn) return;
          const parent = btn.closest('.date-item');
          const id = parent?.dataset?.id;
          settings.importantDates = settings.importantDates.filter((d) => String(d.id) !== String(id));
          saveSettings();
          renderImportantDates();
          updateStats();
        };
      }

      function addImportantDate() {
        openDateModal();
      }
      function openDateModal() {
        document.getElementById('dateModal')?.classList.add('open');
      }
      function closeDateModal() {
        document.getElementById('dateModal')?.classList.remove('open');
      }

      function handleDateForm() {
        const form = document.getElementById('dateForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const title = document.getElementById('dateTitle')?.value.trim();
          const date = document.getElementById('dateValue')?.value;
          const type = document.getElementById('dateType')?.value || 'special';
          if (!title || !date) return;

          settings.importantDates.push({ id: Date.now(), title, date, type });
          saveSettings();
          renderImportantDates();
          closeDateModal();
          form.reset();
          updateStats();
        });
      }

      // ===== Export/Import/Clear =====
      function exportData() {
        const data = JSON.stringify(settings, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'myilove_backup.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }

      function importData() {
        const input = document.getElementById('importFile');
        if (!input) return;

        input.value = '';
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const parsed = JSON.parse(reader.result);
              settings = {
                ...structuredClone(DEFAULT_SETTINGS),
                ...parsed,
                notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications || {}) },
                couple: { ...DEFAULT_SETTINGS.couple, ...(parsed.couple || {}) },
                importantDates: Array.isArray(parsed.importantDates) ? parsed.importantDates : [],
              };
              saveSettings();
              applyTheme();
              hydrateAppearance();
              hydrateNotifications();
              hydrateCoupleForm();
              handleDateForm();
              renderImportantDates();
              updateStats();
              alert('Dados importados com sucesso!');
            } catch {
              alert('Arquivo inválido.');
            }
          };
          reader.readAsText(file);
        };
        input.click();
      }

      function clearAllData() {
        if (!confirm('Tem certeza que deseja limpar TODOS os dados?')) return;
        localStorage.removeItem('myilove_settings');
        settings = structuredClone(DEFAULT_SETTINGS);
        saveSettings();
        applyTheme();
        hydrateAppearance();
        hydrateNotifications();
        hydrateCoupleForm();
        handleDateForm();
        renderImportantDates();
        updateStats();
        alert('Todos os dados foram limpos.');
      }

      // ===== Estatísticas =====
      function updateStats() {
        // Total de memórias
        const mem = document.getElementById('totalMemories');
        if (mem) mem.textContent = String(settings.importantDates.length || 0);

        // Dias juntos
        const days = document.getElementById('relationshipDays');
        if (days) {
          const start = settings.couple.relationshipStart;
          if (start) {
            const d0 = new Date(start + 'T00:00:00');
            const now = new Date();
            days.textContent = String(Math.max(0, Math.floor((now - d0) / (1000 * 60 * 60 * 24))));
          } else {
            days.textContent = '0';
          }
        }

        // Total de fotos (usa a mesma chave do restante do app)
        const photosEl = document.getElementById('totalPhotos');
        if (photosEl) {
          const arr = JSON.parse(localStorage.getItem('photos') || '[]');
          photosEl.textContent = String(arr.length || 0);
        }

        // Total de viagens (usa a mesma chave do restante do app)
        const tripsEl = document.getElementById('totalTrips');
        if (tripsEl) {
          const arr = JSON.parse(localStorage.getItem('trips') || '[]');
          tripsEl.textContent = String(arr.length || 0);
        }
      }

      // ===== Helpers =====
      function escapeHtml(s = '') {
        return String(s)
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#039;');
      }

      // ===== Expor globais para onclick do HTML =====
      window.addImportantDate = addImportantDate;
      window.exportData = exportData;
      window.importData = importData;
      window.clearAllData = clearAllData;
      window.closeDateModal = closeDateModal;

      // ===== Boot =====
      initLucide();
      applyTheme();
      hydrateAppearance();
      hydrateNotifications();
      hydrateCoupleForm();
      handleDateForm();
      renderImportantDates();
      updateStats();

      // Recriar ícones após mutações
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
  <!-- Container principal: sidebar + conteúdo -->
  <div class="container">

    <!--SIDEBAR DE NAVEGAÇÃO-->
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
        <li><a href="/config" class="active"><i data-lucide="settings"></i> Configurações</a></li>
      </ul>
    </nav>

    <!--CONTEÚDO PRINCIPAL-->
    <main class="content">
      <h2>Configurações ⚙️</h2>

      <!--CONFIGURAÇÃO DO PERFIL DO CASAL-->
      <div class="config-section">
        <div class="card">
          <h3><i data-lucide="users"></i> Perfil do Casal</h3>
          <form id="coupleForm">
            <div class="form-row">
              <input type="text" id="partner1Name" placeholder="Nome do primeiro parceiro">
              <input type="text" id="partner2Name" placeholder="Nome do segundo parceiro">
            </div>
            <input type="date" id="relationshipStart" placeholder="Data do início do relacionamento">
            <textarea id="coupleDescription" placeholder="Conte um pouco sobre vocês..."></textarea>
            <button type="submit" class="submit-btn">Salvar Perfil</button>
          </form>
        </div>
      </div>

      <!--CONFIGURAÇÃO DE NOTIFICAÇÕES-->
      <div class="config-section">
        <div class="card">
          <h3><i data-lucide="bell"></i> Notificações</h3>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="eventReminders"> 
              Lembrar de eventos próximos
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="anniversaryReminders"> 
              Lembrar de aniversários importantes
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" id="achievementCelebrations"> 
              Celebrar conquistas realizadas
            </label>
          </div>
        </div>
      </div>

      <!--CONFIGURAÇÃO DE APARÊNCIA-->
      <div class="config-section">
        <div class="card">
          <h3><i data-lucide="palette"></i> Aparência</h3>
          <div class="setting-item">
            <label for="themeSelect">Tema:</label>
            <select id="themeSelect">
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="romantic">Romântico</option>
            </select>
          </div>
          <div class="color-palette">
            <h4>Cor principal:</h4>
            <div class="color-options">
              <div class="color-option pink active" data-color="pink"></div>
              <div class="color-option purple" data-color="purple"></div>
              <div class="color-option blue" data-color="blue"></div>
              <div class="color-option green" data-color="green"></div>
              <div class="color-option red" data-color="red"></div>
            </div>
          </div>
        </div>
      </div>

      <!--CONFIGURAÇÃO DE DATAS IMPORTANTES-->
      <div class="config-section">
        <div class="card">
          <h3><i data-lucide="calendar"></i> Datas Importantes</h3>
          <div id="importantDates">
            <p class="empty-state">Nenhuma data importante cadastrada.</p>
          </div>
          <button class="add-btn" onclick="addImportantDate()">
            <i data-lucide="plus"></i> Adicionar Data
          </button>
        </div>
      </div>

      <!--CONFIGURAÇÃO DE DADOS (EXPORT/IMPORT/LIMPAR)-->
      <div class="config-section">
        <div class="card">
          <h3><i data-lucide="download"></i> Dados</h3>
          <div class="data-actions">
            <button class="export-btn" onclick="exportData()">
              <i data-lucide="download"></i> Exportar Dados
            </button>
            <button class="import-btn" onclick="importData()">
              <i data-lucide="upload"></i> Importar Dados
            </button>
            <button class="clear-btn" onclick="clearAllData()">
              <i data-lucide="trash-2"></i> Limpar Todos os Dados
            </button>
          </div>
          <input type="file" id="importFile" accept=".json" style="display: none;">
        </div>
      </div>

      <!--ESTATÍSTICAS-->
      <div class="config-section">
        <div class="card">
          <h3><i data-lucide="info"></i> Estatísticas</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span id="totalMemories">0</span>
              <p>Total de memórias</p>
            </div>
            <div class="stat-item">
              <span id="relationshipDays">0</span>
              <p>Dias juntos</p>
            </div>
            <div class="stat-item">
              <span id="totalPhotos">0</span>
              <p>Fotos compartilhadas</p>
            </div>
            <div class="stat-item">
              <span id="totalTrips">0</span>
              <p>Viagens realizadas</p>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>

  <!--MODAL DE DATA IMPORTANTE-->
  <div id="dateModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Nova Data Importante</h3>
        <span class="close" onclick="closeDateModal()">&times;</span>
      </div>
      <form id="dateForm">
        <input type="text" id="dateTitle" placeholder="Nome da data (ex: Primeiro encontro)" required>
        <input type="date" id="dateValue" required>
        <select id="dateType">
          <option value="anniversary">Aniversário</option>
          <option value="first">Primeira vez</option>
          <option value="special">Data especial</option>
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
