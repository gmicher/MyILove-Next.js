Integrantes:
• Gustavo Micher Santana - RA : 10737606
• Lucas Zeferino – RA: 10396267
• Caio Mussi - RA : 10735885
• Vitor Carneiro RA : 10748048

Evolução e Migração para React/Next.js

Com o avanço do projeto e a necessidade de melhorar o desempenho e a organização do código, o MyILove foi migrado para o framework Next.js (React 19 e Next.js 15), que trouxe uma estrutura mais moderna, componentizada e fácil de manter.

Essa migração permite que o sistema seja mais escalável, modular e performático, além de abrir espaço pra futuras integrações, como autenticação, banco de dados e APIs.

Vantagens da Migração

A transição do modelo baseado em HTML/CSS/JS puro para React e Next.js trouxe benefícios técnicos e de experiência do usuário:

Componentização: agora cada parte da interface (botões, cards, listas, modais) é um componente React reutilizável.

Performance: renderização otimizada no servidor com React Server Components.

Organização: estrutura de pastas padronizada (app, components, lib, etc).

Facilidade de manutenção: código dividido por responsabilidades, reduzindo repetição.

Escalabilidade: o sistema pode crescer sem comprometer o desempenho.

UX aprimorada: carregamentos mais rápidos, navegação fluida e visual mais moderno.

<img width="681" height="274" alt="Captura de tela 2025-10-23 192402" src="https://github.com/user-attachments/assets/bf1ec963-2c9b-470b-9a4a-d1ae84ceb9a3" />


Protótipos e Ideação Visual

Durante a migração, os protótipos foram mantidos com base no design inicial do MyILove, priorizando:

cores suaves e românticas, representando o tema do casal;

cards e modais com cantos arredondados e sombras leves;

layout responsivo compatível com desktop e mobile;

navegação lateral (sidebar) simplificada, mantendo a identidade original.

Os protótipos foram usados como referência para reimplementar as páginas com componentes React reutilizáveis, mantendo a experiência do usuário fiel à proposta original.

Como Rodar o Projeto
# Instalar dependências
npm install

# Rodar o ambiente de desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar o servidor de produção
npm start


A aplicação usa Next.js
Por padrão, roda em http://localhost:3000
.

Caráter Extensionista

O caráter extensionista foi ampliado na migração.
Além da proposta original de inclusão digital e bem-estar emocional, agora:

o sistema pode ser hospedado online e compartilhado com outros casais;

há possibilidade de expansão para apps móveis via React Native;

a estrutura com Server Actions permite integração futura com bancos de dados e login;

reforça o aprendizado prático em tecnologias de ponta e acessíveis.

 Aprendizados da Nova Etapa

Experiência com Next.js, React e componentização moderna.

Aprendizado de arquitetura front-end escalável.

Implementação de Tailwind CSS e padrões visuais consistentes.

Entendimento de Server Components, rotas dinâmicas e deploy.

Prática de migração de projetos legados (HTML/JS → React).

 Resumo: o MyILove evoluiu de um projeto estático para um sistema dinâmico e moderno, mantendo sua essência romântica e intuitiva, mas agora com uma base sólida para o futuro.

Por fim, exemplos de código mais detalhadamente:

(config/page.js)
   
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
Neste trecho, a função hydrateNotifications() é responsável por sincronizar as configurações de notificações do usuário com os elementos HTML da página. Ela garante que os checkboxes exibidos na interface reflitam corretamente as preferências salvas e que qualquer alteração feita pelo usuário seja atualizada imediatamente nas configurações.

Primeiro, a função procura três elementos no HTML usando seus respectivos IDs: eventReminders, anniversaryReminders e achievementCelebrations. Cada um deles representa um tipo diferente de notificação — lembretes de eventos, lembretes de aniversários e celebrações de conquistas.

Em seguida, para cada elemento encontrado, o código define o estado inicial do checkbox com base nas configurações atuais armazenadas em settings.notifications. O operador !! é usado para garantir que o valor atribuído à propriedade checked seja sempre um valor booleano (verdadeiro ou falso).

Depois disso, a função adiciona um ouvinte de evento (addEventListener) para o evento 'change' de cada checkbox. Isso significa que, sempre que o usuário marcar ou desmarcar uma das opções, o valor correspondente dentro de settings.notifications é atualizado automaticamente. Logo em seguida, a função saveSettings() é chamada para salvar as novas preferências — geralmente em um armazenamento local, banco de dados ou serviço remoto.

Em resumo, hydrateNotifications() funciona como uma ponte entre os dados internos da aplicação (as configurações salvas) e a interface exibida ao usuário. Assim, ao carregar a página, os checkboxes mostram o estado atual das notificações, e qualquer mudança feita pelo usuário é imediatamente registrada e persistida.


(eventos/page.js)

    function updateMonthDisplay() {
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      document.getElementById('currentMonth').textContent = 
        `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    
    function changeMonth(direction) {
      currentDate.setMonth(currentDate.getMonth() + direction);
      updateCalendar();
      updateMonthDisplay();
    }
Neste trecho, as funções updateMonthDisplay() e changeMonth() trabalham juntas para controlar e exibir corretamente o mês atual em uma interface de calendário.
A função updateMonthDisplay() tem a responsabilidade de atualizar o texto que mostra o mês e o ano atuais na tela. Primeiro, ela cria um array chamado months, que contém o nome de todos os meses em português, de “Janeiro” a “Dezembro”. Em seguida, a função obtém o elemento HTML com o ID currentMonth, que é o local onde o nome do mês e o ano são exibidos. Utilizando o objeto currentDate (que representa a data atual do calendário), a função pega o número do mês através de currentDate.getMonth() e o converte no nome correspondente usando o array months. Por fim, ela também adiciona o ano atual, obtido com currentDate.getFullYear(), formando um texto completo como “Março 2025”, por exemplo. Esse texto é então atribuído à propriedade textContent do elemento, atualizando o que o usuário vê na tela.

Já a função changeMonth(direction) é responsável por navegar entre os meses — ou seja, avançar ou retroceder no calendário. Ela recebe um parâmetro chamado direction, que normalmente é 1 para avançar um mês ou -1 para voltar um mês. Dentro da função, o método setMonth() do objeto currentDate é usado para ajustar o mês atual com base nesse valor. Depois de alterar a data, a função chama updateCalendar(), que provavelmente redesenha os dias do novo mês, e em seguida executa updateMonthDisplay() para atualizar o nome e o ano exibidos na interface.


(realizadas/page.js)
    
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
A função displayAchievements() é responsável por exibir na tela a linha do tempo (timeline) das conquistas do usuário. Ela atualiza dinamicamente o conteúdo da seção de conquistas com base nos dados disponíveis, mostrando tanto o estado vazio (quando não há conquistas registradas) quanto a lista completa de conquistas realizadas.

Logo no início, a função obtém o elemento HTML com o ID achievementsTimeline, que é o contêiner onde toda a timeline será renderizada. Em seguida, há uma verificação para saber se a lista completed (que contém as conquistas concluídas) está vazia. Caso não existam conquistas, o código insere dentro do elemento um pequeno bloco HTML representando um estado vazio, com um ícone, uma mensagem e uma sugestão motivacional para o usuário realizar alguma meta. Após isso, a função lucide.createIcons() é chamada para inicializar e renderizar os ícones do conjunto Lucide, garantindo que o ícone de coração apareça corretamente. Nesse ponto, a função retorna, encerrando sua execução.

Se houver conquistas registradas, a função passa para a próxima etapa: a construção dinâmica dos itens da timeline. Isso é feito usando o método map() sobre o array completed. Para cada conquista (item), o código cria um bloco HTML que representa visualmente o evento na linha do tempo. A posição alterna entre os lados esquerdo e direito da timeline (definida pela classe CSS 'left' ou 'right'), de acordo com o índice do item (index % 2 === 0). Cada item exibe diversas informações:
- A data de conclusão, formatada pela função formatDate(item.completedAt);
- Um ícone personalizado obtido por getAchievementIcon(item);
- O título da conquista;
- O tipo da conquista, gerado pela função getAchievementType(item);
- Uma breve descrição, que só é mostrada se existir (item.description) e é truncada para não ficar muito longa, usando truncateText(item.description, 60);
- E, por fim, a pontuação associada à conquista, calculada por calculateScore(item).
  
Além disso, cada item é clicável: ao ser selecionado, ele chama a função viewAchievement(item.id), que provavelmente exibe mais detalhes sobre a conquista.
Por fim, após gerar todo o conteúdo HTML, o código usa .join('') para juntar os blocos em uma única string e insere tudo dentro do elemento timeline através de innerHTML. Para finalizar, lucide.createIcons() é chamado novamente, garantindo que todos os ícones das conquistas sejam renderizados corretamente após a atualização do conteúdo.
