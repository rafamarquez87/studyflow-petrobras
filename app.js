    // XSS Sanitization Helper
    function escapeHTML(str) {
      if (str === null || str === undefined) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // Global State
    let state = {
      subjects: [],
      logs: [],
      timer: {
        secondsLeft: 25 * 60,
        totalSeconds: 25 * 60,
        running: false,
        intervalId: null,
        preset: 'pomodoro', // 'pomodoro', 'long', 'short', 'stopwatch'
        selectedSubjectId: '',
        elapsedSeconds: 0 // for stopwatch mode
      },
      schedule: {
        examDate: '2026-08-30', // Data padrão de prova (~3 meses a partir de 25 de Maio)
        dailyHours: 3.0
      }
    };

    // Syllabus definition fully aligned with the official Petrobras Elétrica syllabus
    const DEFAULT_SYLLABUS = [
      // Bloco 1
      { id: 'b1_eletromag', bloco: 'Bloco 1', nome: 'Teoria Eletromagnética', qs: 3, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b1_circuitos', bloco: 'Bloco 1', nome: 'Circuitos Elétricos (CC e CA)', qs: 5, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b1_maquinas', bloco: 'Bloco 1', nome: 'Máquinas Elétricas (Transf./Sínc./Ind./CC)', qs: 6, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b1_analise_sep', bloco: 'Bloco 1', nome: 'Análise de SEP (p.u./Componentes Simétricas/Faltas)', qs: 6, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      
      // Bloco 2
      { id: 'b2_geracao_trans_dist', bloco: 'Bloco 2', nome: 'Geração, Transmissão e Distribuição', qs: 2, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b2_acionam', bloco: 'Bloco 2', nome: 'Acionamentos e Controles Elétricos', qs: 2, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b2_instalacoes', bloco: 'Bloco 2', nome: 'Instalações Elétricas (BT e MT)', qs: 2, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b2_aterramento', bloco: 'Bloco 2', nome: 'Aterramento de Sistemas e Segurança', qs: 1, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b2_protecao', bloco: 'Bloco 2', nome: 'Proteção de Sistemas Elétricos', qs: 2, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b2_medidas', bloco: 'Bloco 2', nome: 'Medidas Elétricas', qs: 1, pri: 'Baixa', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b2_eletronica', bloco: 'Bloco 2', nome: 'Eletrônica Analógica e Digital', qs: 2, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b2_elet_pot', bloco: 'Bloco 2', nome: 'Eletrônica de Potência', qs: 3, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      
      // Bloco 3
      { id: 'b3_calculo', bloco: 'Bloco 3', nome: 'Cálculo Diferencial, Integral e Vetorial', qs: 2, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b3_edo', bloco: 'Bloco 3', nome: 'Equações Diferenciais Ordinárias (EDO)', qs: 1, pri: 'Baixa', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b3_alg_lin', bloco: 'Bloco 3', nome: 'Álgebra Linear', qs: 2, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b3_controle', bloco: 'Bloco 3', nome: 'Sistemas de Controle (Laplace/F.T./Estabilidade)', qs: 3, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b3_prob_estat', bloco: 'Bloco 3', nome: 'Probabilidade e Estatística', qs: 1, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b3_termo', bloco: 'Bloco 3', nome: 'Termodinâmica e Ciclos Térmicos', qs: 2, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b3_fluidos', bloco: 'Bloco 3', nome: 'Fenômenos de Transporte e Fluidos', qs: 2, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'b3_maq_fluxo', bloco: 'Bloco 3', nome: 'Máquinas de Fluxo (Bombas/Comp./Turbinas)', qs: 2, pri: 'Baixa', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      // Conhecimentos Básicos - Português e Inglês detalhados
      { id: 'bas_port_interp', bloco: 'Básico', nome: 'Português: Interpretação textual', qs: 2, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'bas_port_semantica', bloco: 'Básico', nome: 'Português: Aspectos semânticos (adequação vocabular, denotação, conotação, polissemia e ambiguidade)', qs: 1, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'bas_port_pontuacao', bloco: 'Básico', nome: 'Português: Emprego dos sinais de pontuação (vírgula, ponto, dois-pontos, reticências, aspas, travessão, parênteses)', qs: 1, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'bas_port_crase', bloco: 'Básico', nome: 'Português: Emprego do acento indicativo de crase', qs: 1, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'bas_port_coesao', bloco: 'Básico', nome: 'Português: Coesão e coerência textuais (conexão, sequência lógica, paralelismo sintático/semântico)', qs: 1, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'bas_port_relacoes', bloco: 'Básico', nome: 'Português: Relações de coordenação, correlação e subordinação', qs: 1, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'bas_port_colocacao', bloco: 'Básico', nome: 'Português: Colocação pronominal (próclise, mesóclise e ênclise)', qs: 1, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'bas_port_concordancia', bloco: 'Básico', nome: 'Português: Concordância verbal e nominal', qs: 1, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'bas_port_regencia', bloco: 'Básico', nome: 'Português: Regência verbal', qs: 1, pri: 'Alta', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'bas_ing_texto', bloco: 'Básico', nome: 'Inglês: Compreensão de texto escrito', qs: 3, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 },
      { id: 'bas_ing_gram', bloco: 'Básico', nome: 'Inglês: Itens gramaticais relevantes para compreensão semântica', qs: 2, pri: 'Média', horas: 0, totalQuestoes: 0, corretasQuestoes: 0 }
    ];

    // Initial Mock Logs for demonstrating beautiful dashboards right away
    const MOCK_LOGS = [
      { id: 'log1', type: 'estudo', subjectId: 'b1_analise_sep', subjectName: 'Análise de SEP (p.u./Componentes Simétricas/Faltas)', value: 8.5, date: '2026-05-20', details: 'Estudo focado em componentes simétricas e p.u.' },
      { id: 'log2', type: 'nota', subjectId: 'b1_analise_sep', subjectName: 'Análise de SEP (p.u./Componentes Simétricas/Faltas)', value: 76, date: '2026-05-21', details: '38 acertos de 50 respondidas' },
      { id: 'log3', type: 'estudo', subjectId: 'b1_circuitos', subjectName: 'Circuitos Elétricos (CC e CA)', value: 6.0, date: '2026-05-22', details: 'Revisão de CA monofásico e trifásico' },
      { id: 'log4', type: 'nota', subjectId: 'b1_circuitos', subjectName: 'Circuitos Elétricos (CC e CA)', value: 80, date: '2026-05-22', details: '16 acertos de 20 respondidas' },
      { id: 'log5', type: 'estudo', subjectId: 'bas_port_crase', subjectName: 'Português: Emprego do acento indicativo de crase', value: 3.5, date: '2026-05-23', details: 'Estudo de crase e pontuação' },
      { id: 'log6', type: 'nota', subjectId: 'bas_port_crase', subjectName: 'Português: Emprego do acento indicativo de crase', value: 70, date: '2026-05-23', details: '7 acertos de 10 respondidas' },
      { id: 'log7', type: 'estudo', subjectId: 'b3_controle', subjectName: 'Sistemas de Controle (Laplace/F.T./Estabilidade)', value: 2.0, date: '2026-05-24', details: 'Função de transferência e malhas' },
      { id: 'log8', type: 'nota', subjectId: 'b3_controle', subjectName: 'Sistemas de Controle (Laplace/F.T./Estabilidade)', value: 55, date: '2026-05-24', details: '11 acertos de 20 respondidas' },
      { id: 'log9', type: 'estudo', subjectId: 'b2_elet_pot', subjectName: 'Eletrônica de Potência', value: 4.5, date: '2026-05-25', details: 'Conversores CC-CC e retificadores' }
    ];

    // Chart.js Globals
    let chartRadarBlocks = null;
    let chartDoughnutGrades = null;
    let chartBarComparison = null;
    let chartEvolution = null;
    let countdownInterval = null;

    // Web Audio Synthesizer for White Noise (Focus sound)
    let audioCtx = null;
    let whiteNoiseNode = null;
    let gainNode = null;
    let ambientSoundPlaying = false;

    // Initialization
    window.addEventListener('DOMContentLoaded', () => {
      loadState();
      initTheme();
      switchView('dashboard');
      initDropdowns();
      updateDashboardData();
      startCountdown();
    });

    // ==========================================================================
    // THEME MANAGEMENT (LIGHT / DARK MODE)
    // ==========================================================================
    function initTheme() {
      if (!state.theme) {
        state.theme = 'dark';
      }
      const isDark = state.theme === 'dark';
      if (isDark) {
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
      }
      updateThemeIcon(isDark);
    }

    function toggleTheme() {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      saveState();
      initTheme();
    }

    function updateThemeIcon(isDark) {
      const path = document.getElementById('theme-toggle-path');
      if (!path) return;
      if (isDark) {
        // Sun icon path
        path.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z');
      } else {
        // Moon icon path
        path.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
      }
      
      const themeBtn = document.getElementById('settings-theme-btn');
      if (themeBtn) {
        themeBtn.textContent = isDark ? 'Modo Claro' : 'Modo Escuro';
      }
    }

    // ==========================================================================
    // PROFILE MANAGEMENT
    // ==========================================================================
    function initProfileUI() {
      const usernameInput = document.getElementById('settings-username');
      const avatarPreview = document.getElementById('settings-avatar-preview');
      const notifCheckbox = document.getElementById('settings-notif');

      if (usernameInput) usernameInput.value = state.username || 'Estudante StudyFlow';
      if (avatarPreview) avatarPreview.textContent = state.avatar || '👤';
      if (notifCheckbox) notifCheckbox.checked = state.notificationsEnabled !== false;
    }

    function saveProfile() {
      const usernameInput = document.getElementById('settings-username');
      const notifCheckbox = document.getElementById('settings-notif');

      if (usernameInput) state.username = usernameInput.value;
      if (notifCheckbox) state.notificationsEnabled = notifCheckbox.checked;

      saveState();
      
      if (currentView === 'dashboard') {
        const username = state.username || 'Estudante';
        const subtitleEl = document.getElementById('main-view-subtitle');
        if (subtitleEl) {
          subtitleEl.textContent = `Olá, ${username}! Recomendações e métricas com base no edital Petrobras.`;
        }
      }
    }

    const AVATARS = ['👤', '⚡', '🧠', '⚙️', '📈', '🎓', '🏆', '🔥'];
    function changeAvatar() {
      const currentIdx = AVATARS.indexOf(state.avatar || '👤');
      const nextIdx = (currentIdx + 1) % AVATARS.length;
      state.avatar = AVATARS[nextIdx];
      saveState();
      
      const avatarPreview = document.getElementById('settings-avatar-preview');
      if (avatarPreview) avatarPreview.textContent = state.avatar;
    }

    // ==========================================================================
    // PERSISTENCE & DATA MANAGEMENT
    // ==========================================================================
    function loadState() {
      const savedState = localStorage.getItem('studyflow_state');
      if (savedState) {
        try {
          state = JSON.parse(savedState);
          // Sync database array to match any newly added static subjects if needed
          if (!state.subjects || state.subjects.length === 0) {
            resetData('mock');
            return;
          }
          
          // Migration/Sync: update subjects with values from DEFAULT_SYLLABUS
          // Keep progress for matching subjects, add new ones, remove deleted ones.
          const migratedSubjects = DEFAULT_SYLLABUS.map(defaultSub => {
            const existingSub = state.subjects.find(s => s.id === defaultSub.id);
            if (existingSub) {
              return {
                ...defaultSub,
                horas: existingSub.horas !== undefined ? existingSub.horas : 0,
                totalQuestoes: existingSub.totalQuestoes !== undefined ? existingSub.totalQuestoes : 0,
                corretasQuestoes: existingSub.corretasQuestoes !== undefined ? existingSub.corretasQuestoes : 0
              };
            }
            return { ...defaultSub };
          });
          state.subjects = migratedSubjects;

          if (!state.schedule) {
            state.schedule = {
              examDate: '2026-08-30',
              dailyHours: 3.0
            };
          }
          if (!state.username) {
            state.username = 'Estudante StudyFlow';
          }
          if (!state.avatar) {
            state.avatar = '👤';
          }
          if (state.notificationsEnabled === undefined) {
            state.notificationsEnabled = true;
          }
          initProfileUI();
        } catch (e) {
          console.error("Error loading localStorage state, resetting.", e);
          resetData('mock');
          return;
        }
      } else {
        resetData('mock');
        return;
      }
      
      // Guarantee timer matches state correctly
      resetTimer();
    }

    function saveState() {
      localStorage.setItem('studyflow_state', JSON.stringify(state));
    }

    function resetData(mode) {
      state.schedule = {
        examDate: '2026-08-30',
        dailyHours: 3.0
      };
      
      if (mode === 'clear') {
        state.subjects = DEFAULT_SYLLABUS.map(s => ({ ...s, horas: 0, totalQuestoes: 0, corretasQuestoes: 0 }));
        state.logs = [];
        state.username = 'Estudante StudyFlow';
        state.avatar = '👤';
        state.notificationsEnabled = true;
      } else {
        // Load mock state
        state.subjects = DEFAULT_SYLLABUS.map(s => ({ ...s, horas: 0, totalQuestoes: 0, corretasQuestoes: 0 }));
        state.logs = JSON.parse(JSON.stringify(MOCK_LOGS));
        
        // Recompute subject aggregates based on logs
        state.logs.forEach(log => {
          const sub = state.subjects.find(s => s.id === log.subjectId);
          if (sub) {
            if (log.type === 'estudo') {
              sub.horas += log.value;
            } else if (log.type === 'nota') {
              // Extract details from mock
              const match = log.details.match(/(\d+) acertos de (\d+)/);
              if (match) {
                sub.corretasQuestoes += parseInt(match[1]);
                sub.totalQuestoes += parseInt(match[2]);
              }
            }
          }
        });
      }
      
      saveState();
      initDropdowns();
      updateDashboardData();
      initProfileUI();
      
      if (currentView === 'matrix') renderSubjectsMatrix();
      if (currentView === 'history') renderHistoryLogTable();
    }

    function initDropdowns() {
      const dropdowns = [
        document.getElementById('timer-subject-dropdown'),
        document.getElementById('study-subject'),
        document.getElementById('grade-subject')
      ];

      // Sort subjects by name for dropdowns
      const sorted = [...state.subjects].sort((a, b) => a.nome.localeCompare(b.nome));

      dropdowns.forEach(dd => {
        if (!dd) return;
        dd.innerHTML = '';
        sorted.forEach(sub => {
          const opt = document.createElement('option');
          opt.value = sub.id;
          opt.textContent = `[${sub.bloco}] ${sub.nome}`;
          dd.appendChild(opt);
        });
      });
      
      if (sorted.length > 0) {
        state.timer.selectedSubjectId = sorted[0].id;
      }
    }

    // ==========================================================================
    // NAVIGATION & CONTROLLERS
    // ==========================================================================
    let currentView = 'dashboard';
    function switchView(viewId) {
      currentView = viewId;
      document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active');
      });
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });

      const activeView = document.getElementById(`view-${viewId}`);
      const activeNav = document.getElementById(`nav-${viewId}`);
      if (activeView) activeView.classList.add('active');
      if (activeNav) activeNav.classList.add('active');

      // Update titles
      const viewTitles = {
        dashboard: { title: "Dashboard Analítico", subtitle: "Recomendações e métricas com base no edital Petrobras." },
        matrix: { title: "Grade Curricular", subtitle: "Todos os assuntos do edital para Engenheiro Elétrica." },
        timer: { title: "Foco & Pomodoro", subtitle: "Inicie sessões de foco isoladas e marque tempos de estudo diretos." },
        history: { title: "Lançamento Manual", subtitle: "Registre suas sessões de estudo offline e resoluções de questões." },
        goals: { title: "Metas & Conquistas", subtitle: "Acompanhe seus dias seguidos, medalhas ganhas e progresso semanal." },
        settings: { title: "Opções do Painel", subtitle: "Reset de dados, Importação e Exportação do progresso." }
      };

      document.getElementById('main-view-title').textContent = viewTitles[viewId].title;
      if (viewId === 'dashboard') {
        const username = state.username || 'Estudante';
        document.getElementById('main-view-subtitle').textContent = `Olá, ${username}! Recomendações e métricas com base no edital Petrobras.`;
      } else {
        document.getElementById('main-view-subtitle').textContent = viewTitles[viewId].subtitle;
      }

      // Trigger specific initializers
      if (viewId === 'dashboard') {
        updateDashboardData();
      } else if (viewId === 'matrix') {
        renderSubjectsMatrix();
      } else if (viewId === 'history') {
        renderHistoryLogTable();
      } else if (viewId === 'goals') {
        updateGoalsView();
      }
      
      // Auto scroll to top
      window.scrollTo(0, 0);
    }

    // ==========================================================================
    // DYNAMIC ALGORITHM: STUDY NEED COEFFICIENT (INE)
    // ==========================================================================
    function calculateINE(subj) {
      const priorityWeight = { 'Alta': 35, 'Média': 20, 'Baixa': 5 };
      const baseWeight = priorityWeight[subj.pri] || 15;
      
      // Question factor (incidência em prova)
      const qFactor = subj.qs * 6.5; 
      
      // Study hours penalty proportional to dynamic target hours
      const totalHoursAvailable = getAvailableHours();
      const target = getSubjectTargetHours(subj, totalHoursAvailable) || 10;
      const progressRatio = Math.min(1.5, subj.horas / target);
      const studyPenalty = progressRatio * 40.0; // max penalty of 40 points when target is met
      
      // Grade performance penalty (acertos baixos = urgência alta)
      let mockNota = 50; // Neutral 50% if unattempted
      if (subj.totalQuestoes > 0) {
        mockNota = (subj.corretasQuestoes / subj.totalQuestoes) * 100;
      }
      
      // Unstudied bonus (matérias zeradas saltam primeiro)
      const unstudiedBonus = subj.horas === 0 ? 15 : 0;

      // Compound calculation
      let ine = baseWeight + qFactor - studyPenalty + (100 - mockNota) * 0.4 + unstudiedBonus;
      
      // Clamping between 0 and 100
      return Math.round(Math.max(0, Math.min(100, ine)));
    }

    // ==========================================================================
    // SCHEDULE & PLANNING ENGINE (METAS DINÂMICAS)
    // ==========================================================================
    function getStudyDaysCount(startDate, endDate, studyDaysList) {
      const dayMap = { 0: 'DOM', 1: 'SEG', 2: 'TER', 3: 'QUA', 4: 'QUI', 5: 'SEX', 6: 'SÁB' };
      let count = 0;
      let cur = new Date(startDate.getTime());
      cur.setHours(0,0,0,0);
      
      const end = new Date(endDate.getTime());
      end.setHours(0,0,0,0);
      
      while (cur <= end) {
        const dayStr = dayMap[cur.getDay()];
        if (studyDaysList.includes(dayStr)) {
          count++;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return count;
    }

    function getAvailableHours() {
      if (!state.schedule || !state.schedule.examDate) return 0;
      
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      const examDate = new Date(state.schedule.examDate);
      examDate.setHours(0,0,0,0);
      
      if (examDate < todayDate) return 0;
      
      const studyDaysList = state.schedule.studyDays || ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
      const studyDaysCount = getStudyDaysCount(todayDate, examDate, studyDaysList);
      
      const dailyHours = parseFloat(state.schedule.dailyHours) || 3.0;
      return studyDaysCount * dailyHours;
    }

    function getSubjectTargetHours(sub, totalHoursAvailable) {
      if (!totalHoursAvailable || totalHoursAvailable <= 0) {
        // Fallback standard targets
        const targets = { 'Alta': 15, 'Média': 10, 'Baixa': 6 };
        return targets[sub.pri] || 10;
      }
      
      const blockWeights = {
        'Bloco 1': 0.35,
        'Bloco 2': 0.25,
        'Bloco 3': 0.20,
        'Básico': 0.20
      };
      
      const weight = blockWeights[sub.bloco] || 0.20;
      const blockTotalHours = totalHoursAvailable * weight;
      
      // Sum questions in this block
      const sameBlock = state.subjects.filter(s => s.bloco === sub.bloco);
      const totalQsInBlock = sameBlock.reduce((acc, s) => acc + s.qs, 0) || 1;
      
      // Proportional allocation based on qs
      const allocatedHours = blockTotalHours * (sub.qs / totalQsInBlock);
      
      // Let's set a minimum target of 1.0 hour so subjects aren't completely ignored
      return parseFloat(Math.max(1.0, allocatedHours).toFixed(1));
    }

    function toggleStudyDay(day) {
      if (!state.schedule.studyDays) {
        state.schedule.studyDays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
      }
      
      const idx = state.schedule.studyDays.indexOf(day);
      if (idx > -1) {
        if (state.schedule.studyDays.length === 1) {
          alert("Você deve selecionar pelo menos 1 dia de estudo na semana!");
          return;
        }
        state.schedule.studyDays.splice(idx, 1);
      } else {
        state.schedule.studyDays.push(day);
      }
      
      saveState();
      updateScheduleUI();
      updateSchedule();
    }

    function updateScheduleUI() {
      const days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
      const studyDays = state.schedule.studyDays || days;
      
      days.forEach(day => {
        const btn = document.getElementById(`day-btn-${day}`);
        if (btn) {
          if (studyDays.includes(day)) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        }
      });
    }

    function updateSchedule() {
      const dateEl = document.getElementById('schedule-exam-date');
      const hoursEl = document.getElementById('schedule-daily-hours');
      
      if (!dateEl || !hoursEl) return;
      
      state.schedule.examDate = dateEl.value;
      state.schedule.dailyHours = parseFloat(hoursEl.value) || 3.0;
      
      saveState();
      
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      const examDate = new Date(state.schedule.examDate);
      examDate.setHours(0,0,0,0);
      
      const timeDiff = examDate.getTime() - todayDate.getTime();
      const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
      
      const studyDaysList = state.schedule.studyDays || ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
      const studyDaysCount = getStudyDaysCount(todayDate, examDate, studyDaysList);
      const totalHours = studyDaysCount * state.schedule.dailyHours;
      
      document.getElementById('schedule-days-left').textContent = daysLeft;
      document.getElementById('schedule-total-hours').textContent = `${totalHours.toFixed(0)}h`;
      
      // Recompute everything
      updateDashboardData();
      startCountdown();
    }

    function initScheduleUI() {
      const dateEl = document.getElementById('schedule-exam-date');
      const hoursEl = document.getElementById('schedule-daily-hours');
      
      if (!dateEl || !hoursEl) return;
      
      dateEl.value = state.schedule.examDate;
      hoursEl.value = state.schedule.dailyHours;
      
      const todayDate = new Date();
      todayDate.setHours(0,0,0,0);
      const examDate = new Date(state.schedule.examDate);
      examDate.setHours(0,0,0,0);
      
      const timeDiff = examDate.getTime() - todayDate.getTime();
      const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
      
      const studyDaysList = state.schedule.studyDays || ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
      const studyDaysCount = getStudyDaysCount(todayDate, examDate, studyDaysList);
      const totalHours = studyDaysCount * state.schedule.dailyHours;
      
      document.getElementById('schedule-days-left').textContent = daysLeft;
      document.getElementById('schedule-total-hours').textContent = `${totalHours.toFixed(0)}h`;
      
      updateScheduleUI();
    }

    // ==========================================================================
    // DASHBOARD & CHARTS CONTROLLER
    // ==========================================================================
    function updateDashboardData() {
      // Initialize inputs from state first
      initScheduleUI();

      // 1. General stats
      let totalHours = 0;
      let totalCorrect = 0;
      let totalQuestions = 0;
      let startedCount = 0;
      
      state.subjects.forEach(sub => {
        totalHours += sub.horas;
        totalCorrect += sub.corretasQuestoes;
        totalQuestions += sub.totalQuestoes;
        if (sub.horas > 0 || sub.totalQuestoes > 0) {
          startedCount++;
        }
      });
      
      document.getElementById('stat-total-hours').textContent = `${totalHours.toFixed(1)}h`;
      document.getElementById('stat-total-questions').textContent = totalQuestions;
      document.getElementById('stat-questions-correct').textContent = `${totalCorrect} acertos`;
      document.getElementById('stat-started-subjects').textContent = `${startedCount}/25`;
      
      if (totalQuestions > 0) {
        const avg = Math.round((totalCorrect / totalQuestions) * 100);
        document.getElementById('stat-average-grade').textContent = `${avg}%`;
        
        let avgSub = "Necessita melhorar";
        if (avg >= 75) avgSub = "Excelente desempenho!";
        else if (avg >= 60) avgSub = "Dentro da média de corte";
        document.getElementById('stat-average-grade-sub').textContent = avgSub;
      } else {
        document.getElementById('stat-average-grade').textContent = `N/A`;
        document.getElementById('stat-average-grade-sub').textContent = `Faça questões para gerar média`;
      }

      // 2. Render Smart Recommendations
      renderRecommendations();

      // 3. Draw / Redraw Charts
      drawDashboardCharts();
      // 4. Weekly Plan
      renderWeeklyPlan();
    }

    function renderRecommendations() {
      const container = document.getElementById('recommendations-container');
      if (!container) return;
      
      // Calculate INE for all subjects and sort
      const rated = state.subjects.map(s => {
        return { ...s, ine: calculateINE(s) };
      }).sort((a, b) => b.ine - a.ine);

      container.innerHTML = '';
      
      // Capture top 3
      const top3 = rated.slice(0, 3);
      
      top3.forEach(sub => {
        const mockNota = sub.totalQuestoes > 0 ? Math.round((sub.corretasQuestoes / sub.totalQuestoes) * 100) : null;
        const notaDisplay = mockNota !== null ? `${mockNota}%` : 'S/N';
        const hoursDisplay = `${sub.horas.toFixed(1)}h`;
        
        let priClass = 'rec-priority-medium';
        if (sub.ine >= 70) priClass = 'rec-priority-high';
        else if (sub.ine < 40) priClass = 'rec-priority-low';

        container.innerHTML += `
          <div class="rec-card animated">
            <div class="rec-top">
              <span class="rec-priority-badge ${priClass}">Urgência: ${sub.ine}%</span>
              <span class="rec-coefficient">★ ${sub.qs}q em provas</span>
            </div>
            
            <div class="rec-subject-name">${escapeHTML(sub.nome)}</div>
            <span class="rec-block-tag">${escapeHTML(sub.bloco)} · Prioridade ${escapeHTML(sub.pri)}</span>
            
            <div class="rec-stats-row">
              <div class="rec-stat">
                <div class="rec-stat-lbl">Tempo Estudado</div>
                <div class="rec-stat-val">${hoursDisplay}</div>
              </div>
              <div class="rec-stat">
                <div class="rec-stat-lbl">Média Acertos</div>
                <div class="rec-stat-val">${notaDisplay}</div>
              </div>
            </div>
            
            <button class="rec-btn" onclick="quickStudyAction('${sub.id}', '${sub.nome.replace(/'/g, "\\'")}')">
              <svg viewBox="0 0 24 24" style="width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2.5;"><path d="M12 2v20M17 5v14M22 9v6M7 8v8M2 10v4"/></svg>
              Estudar Agora
            </button>
          </div>
        `;
      });
    }

    function drawDashboardCharts() {
      // 1. Prepare data per Block
      const blocks = ['Bloco 1', 'Bloco 2', 'Bloco 3', 'Básico'];
      const hoursPerBlock = { 'Bloco 1': 0, 'Bloco 2': 0, 'Bloco 3': 0, 'Básico': 0 };
      const correctPerBlock = { 'Bloco 1': 0, 'Bloco 2': 0, 'Bloco 3': 0, 'Básico': 0 };
      const totalQPerBlock = { 'Bloco 1': 0, 'Bloco 2': 0, 'Bloco 3': 0, 'Básico': 0 };

      state.subjects.forEach(sub => {
        hoursPerBlock[sub.bloco] += sub.horas;
        correctPerBlock[sub.bloco] += sub.corretasQuestoes;
        totalQPerBlock[sub.bloco] += sub.totalQuestoes;
      });

      // Target distributions (edital recomendations: Bloco 1=35%, Bloco 2=25%, Bloco 3=20%, Basico=20%)
      const targetDist = [35, 25, 20, 20];
      const totalHours = Object.values(hoursPerBlock).reduce((a, b) => a + b, 0) || 1;
      const actualDist = blocks.map(b => ((hoursPerBlock[b] / totalHours) * 100).toFixed(1));

      // 2. RADAR CHART (Equilíbrio de Horas)
      const ctxRadar = document.getElementById('chart-radar-blocks');
      if (ctxRadar) {
        if (chartRadarBlocks) chartRadarBlocks.destroy();
        chartRadarBlocks = new Chart(ctxRadar, {
          type: 'radar',
          data: {
            labels: blocks,
            datasets: [
              {
                label: 'Distribuição Atual (%)',
                data: actualDist,
                backgroundColor: 'rgba(0, 242, 254, 0.2)',
                borderColor: '#00f2fe',
                borderWidth: 2,
                pointBackgroundColor: '#00f2fe',
              },
              {
                label: 'Foco Recomendado (%)',
                data: targetDist,
                backgroundColor: 'rgba(167, 139, 250, 0.1)',
                borderColor: '#a78bfa',
                borderWidth: 1,
                borderDash: [5, 5],
                pointBackgroundColor: '#a78bfa',
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#8e9bb4', font: { size: 11 } } }
            },
            scales: {
              r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
                grid: { color: 'rgba(255, 255, 255, 0.08)' },
                pointLabels: { color: '#8e9bb4', font: { family: 'Outfit', size: 12 } },
                ticks: { backdropColor: 'transparent', color: '#5e6b8c', showLabelBackdrop: false }
              }
            }
          }
        });
      }

      // 3. DOUGHNUT CHART (Desempenho de Acertos por Bloco)
      const avgGradesPerBlock = blocks.map(b => {
        return totalQPerBlock[b] > 0 ? Math.round((correctPerBlock[b] / totalQPerBlock[b]) * 100) : 0;
      });

      const ctxDoughnut = document.getElementById('chart-doughnut-grades');
      if (ctxDoughnut) {
        if (chartDoughnutGrades) chartDoughnutGrades.destroy();
        chartDoughnutGrades = new Chart(ctxDoughnut, {
          type: 'bar',
          data: {
            labels: blocks,
            datasets: [{
              label: 'Média de Acertos (%)',
              data: avgGradesPerBlock,
              backgroundColor: ['#00f2fe', '#e8c547', '#f7934c', '#a78bfa'],
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#8e9bb4' } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8e9bb4' }, beginAtZero: true, max: 100 }
            }
          }
        });
      }

      // 4. COMBINED BAR & LINE CHART (Hours studied vs Average grades per subject)
      // We will sort subjects by hours studied to keep chart neat
      const activeSubjects = state.subjects.filter(s => s.horas > 0 || s.totalQuestoes > 0)
                                          .sort((a, b) => b.horas - a.horas)
                                          .slice(0, 10); // top 10 studied

      const ctxBar = document.getElementById('chart-bar-comparison');
      if (ctxBar) {
        if (chartBarComparison) chartBarComparison.destroy();
        chartBarComparison = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: activeSubjects.map(s => s.nome.length > 20 ? s.nome.slice(0, 18) + '...' : s.nome),
            datasets: [
              {
                type: 'bar',
                label: 'Tempo Estudado (Horas)',
                data: activeSubjects.map(s => s.horas),
                backgroundColor: 'rgba(0, 242, 254, 0.4)',
                borderColor: '#00f2fe',
                borderWidth: 1.5,
                yAxisID: 'y'
              },
              {
                type: 'line',
                label: 'Média de Acertos (%)',
                data: activeSubjects.map(s => s.totalQuestoes > 0 ? (s.corretasQuestoes / s.totalQuestoes) * 100 : null),
                borderColor: '#a78bfa',
                pointBackgroundColor: '#a78bfa',
                borderWidth: 2.5,
                tension: 0.2,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#8e9bb4' } }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#8e9bb4', font: { size: 10 } } },
              y: {
                position: 'left',
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#8e9bb4' },
                title: { display: true, text: 'Horas', color: '#8e9bb4' }
              },
              y1: {
                position: 'right',
                grid: { display: false },
                ticks: { color: '#8e9bb4' },
                beginAtZero: true,
                max: 100,
                title: { display: true, text: 'Média (%)', color: '#8e9bb4' }
              }
            }
          }
        });
      }

      // 5. EVOLUTION CHART — cumulative hours from logs
      const studyLogsByDate = {};
      state.logs.filter(l => l.type === 'estudo').forEach(log => {
        studyLogsByDate[log.date] = (studyLogsByDate[log.date] || 0) + log.value;
      });
      const sortedEvDates = Object.keys(studyLogsByDate).sort();
      let cumulative = 0;
      const evolutionLabels = [];
      const evolutionPoints = [];
      sortedEvDates.forEach(date => {
        cumulative += studyLogsByDate[date];
        evolutionLabels.push(date.slice(5).replace('-', '/'));
        evolutionPoints.push(parseFloat(cumulative.toFixed(1)));
      });
      const ctxEvol = document.getElementById('chart-evolution');
      if (ctxEvol) {
        if (chartEvolution) chartEvolution.destroy();
        if (evolutionLabels.length > 0) {
          chartEvolution = new Chart(ctxEvol, {
            type: 'line',
            data: {
              labels: evolutionLabels,
              datasets: [{
                label: 'Horas Acumuladas',
                data: evolutionPoints,
                borderColor: '#00f2fe',
                backgroundColor: 'rgba(0, 242, 254, 0.07)',
                fill: true,
                tension: 0.45,
                pointBackgroundColor: '#00f2fe',
                pointBorderColor: 'var(--bg-primary)',
                pointBorderWidth: 2,
                pointRadius: 5,
                borderWidth: 2.5
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}h acumuladas` } }
              },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#8e9bb4', font: { size: 11 } } },
                y: {
                  grid: { color: 'rgba(255,255,255,0.04)' },
                  ticks: { color: '#8e9bb4', callback: v => v + 'h' },
                  beginAtZero: true
                }
              }
            }
          });
        } else {
          ctxEvol.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.85rem;">Registre sessões de estudo para visualizar a evolução.</div>';
        }
      }
    }

    // ==========================================================================
    // SYLLABUS MATRIX CONTROLLER
    // ==========================================================================
    let currentMatrixFilter = 'all';
    let currentPriorityFilter = 'all';

    function setMatrixFilter(filter) {
      currentMatrixFilter = filter;
      document.querySelectorAll('#subject-filter-tabs .filter-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim().toLowerCase() === filter.replace('Bloco ', 'bloco ').replace('Básico', 'básicas').toLowerCase()) {
          btn.classList.add('active');
        }
      });
      // Fallback if text matching fails
      if (filter === 'all') document.querySelector('#subject-filter-tabs .filter-tab:nth-child(1)').classList.add('active');
      renderSubjectsMatrix();
    }

    function setPriorityFilter(priority) {
      currentPriorityFilter = priority;
      document.querySelectorAll('#priority-filter-tabs .filter-tab').forEach(btn => {
        btn.classList.remove('active');
      });
      const idMap = { 'all': 'pri-btn-all', 'Alta': 'pri-btn-alta', 'Média': 'pri-btn-media', 'Baixa': 'pri-btn-baixa' };
      const target = document.getElementById(idMap[priority]);
      if (target) target.classList.add('active');
      renderSubjectsMatrix();
    }

    function filterSubjects() {
      renderSubjectsMatrix();
    }

    function renderSubjectsMatrix() {
      const container = document.getElementById('subject-list-container');
      if (!container) return;

      const query = document.getElementById('subject-search').value.toLowerCase();
      
      let filtered = state.subjects;
      
      // Apply block filter
      if (currentMatrixFilter !== 'all') {
        filtered = filtered.filter(s => s.bloco === currentMatrixFilter);
      }

      // Apply priority filter
      if (currentPriorityFilter !== 'all') {
        filtered = filtered.filter(s => s.pri === currentPriorityFilter);
      }

      // Apply search query
      if (query.trim() !== '') {
        filtered = filtered.filter(s => s.nome.toLowerCase().includes(query) || s.bloco.toLowerCase().includes(query));
      }

      container.innerHTML = '';
      
      if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 2rem; color:var(--text-muted);">Nenhum assunto encontrado.</div>`;
        return;
      }

      // Render items
      filtered.forEach(sub => {
        const ine = calculateINE(sub);
        const hoursDisplay = `${sub.horas.toFixed(1)}h`;
        
        // Correct %
        let scoreClass = 'score-none';
        let scoreDisplay = 'S/Nota';
        if (sub.totalQuestoes > 0) {
          const pct = Math.round((sub.corretasQuestoes / sub.totalQuestoes) * 100);
          scoreDisplay = `${pct}%`;
          if (pct >= 75) scoreClass = 'score-high';
          else if (pct >= 50) scoreClass = 'score-medium';
          else scoreClass = 'score-low';
        }

        // Progress bar percentage (recalculated based on dynamic available hours)
        const totalHoursAvailable = getAvailableHours();
        const target = getSubjectTargetHours(sub, totalHoursAvailable);
        const progressPct = Math.min(100, Math.round((sub.horas / target) * 100));

        let progressColor = 'var(--color-b1)';
        if (sub.bloco === 'Bloco 1') progressColor = 'linear-gradient(90deg, #00c6ff, #00f2fe)';
        else if (sub.bloco === 'Bloco 2') progressColor = 'linear-gradient(90deg, #ffd000, #e8c547)';
        else if (sub.bloco === 'Bloco 3') progressColor = 'linear-gradient(90deg, #ff7b24, #f7934c)';
        else progressColor = 'linear-gradient(90deg, #8b5cf6, #a78bfa)';

        let blocoClass = 'basicas';
        if (sub.bloco === 'Bloco 1') blocoClass = 'b1';
        else if (sub.bloco === 'Bloco 2') blocoClass = 'b2';
        else if (sub.bloco === 'Bloco 3') blocoClass = 'b3';

        let priBadgeClass = 'rec-priority-low';
        if (sub.pri === 'Alta') priBadgeClass = 'rec-priority-high';
        else if (sub.pri === 'Média') priBadgeClass = 'rec-priority-medium';

        container.innerHTML += `
          <div class="subject-item animated">
            <div class="subj-name-block">
              <span class="subj-name">${escapeHTML(sub.nome)}</span>
              <div class="subj-tags">
                <span class="subj-bloco-badge ${blocoClass}">${escapeHTML(sub.bloco)}</span>
                <span class="subj-pri-badge ${priBadgeClass}">Prioridade ${escapeHTML(sub.pri)}</span>
              </div>
            </div>
            
            <div class="subj-stat-col">
              <span class="subj-stat-lbl">Prova</span>
              <span class="subj-stat-val">${sub.qs} questões</span>
            </div>
            
            <div class="subj-stat-col">
              <span class="subj-stat-lbl">Tempo</span>
              <span class="subj-stat-val">${hoursDisplay}</span>
            </div>
            
            <div class="subj-progress-col">
              <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:var(--text-secondary);">
                <span>Meta: ${target}h</span>
                <span>${progressPct}%</span>
              </div>
              <div class="subj-progress-bar-wrap">
                <div class="subj-progress-bar" style="width: ${progressPct}%; background: ${progressColor};"></div>
              </div>
            </div>
            
            <div class="subj-stat-col">
              <span class="subj-stat-lbl">Urgência</span>
              <span class="subj-stat-val" style="color: ${ine > 70 ? 'var(--color-danger)' : 'var(--text-primary)'};">${ine}%</span>
            </div>
            
            <div>
              <span class="subj-score-badge ${scoreClass}">${scoreDisplay}</span>
            </div>
            
            <div class="subj-actions">
              <button class="subj-act-btn study-btn" onclick="quickStudyAction('${sub.id}', '${sub.nome.replace(/'/g, "\\'")}')" title="Registrar Estudo">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </button>
              <button class="subj-act-btn score-btn" onclick="quickGradeAction('${sub.id}', '${sub.nome.replace(/'/g, "\\'")}')" title="Registrar Questões">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </button>
              <button class="subj-act-btn focus-btn" onclick="focusTimerOnSubject('${sub.id}')" title="Focar com Cronômetro" style="border-color:var(--color-b1);">
                <svg viewBox="0 0 24 24" style="stroke:var(--color-b1);"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </button>
            </div>
          </div>
        `;
      });
    }

    // ==========================================================================
    // MANUAL LOGS & HISTORY
    // ==========================================================================
    function renderHistoryLogTable() {
      const tbody = document.getElementById('history-log-tbody');
      if (!tbody) return;

      tbody.innerHTML = '';
      
      if (state.logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color:var(--text-muted);">Nenhum lançamento no histórico.</td></tr>`;
        return;
      }

      // Sort logs by date descending
      const sortedLogs = [...state.logs].sort((a, b) => b.date.localeCompare(a.date));

      sortedLogs.forEach(log => {
        const typePill = log.type === 'estudo' 
          ? `<span class="type-pill study">Estudo</span>` 
          : `<span class="type-pill grade">Desempenho</span>`;
        
        const valDisplay = log.type === 'estudo' 
          ? `${log.value.toFixed(1)}h` 
          : `${log.value}% acertos`;

        tbody.innerHTML += `
          <tr>
            <td style="font-family:'JetBrains Mono', monospace;">${escapeHTML(log.date)}</td>
            <td>${typePill}</td>
            <td style="font-weight:600;">${escapeHTML(log.subjectName)}</td>
            <td style="font-family:'JetBrains Mono', monospace; font-weight:700;">${valDisplay}</td>
            <td style="color:var(--text-secondary);">${escapeHTML(log.details || '-')}</td>
            <td>
              <button class="trash-btn" onclick="deleteLog('${log.id}')" title="Excluir Lançamento">
                <svg viewBox="0 0 24 24" style="width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:2;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </td>
          </tr>
        `;
      });
    }

    function handleStudySubmit(e) {
      e.preventDefault();
      const subjectId = document.getElementById('study-subject').value;
      const hours = parseInt(document.getElementById('study-hours').value) || 0;
      const minutes = parseInt(document.getElementById('study-minutes').value) || 0;
      const comment = document.getElementById('study-comment').value;

      // Validation
      if (!subjectId) {
        alert("Selecione uma matéria.");
        return;
      }
      if (hours < 0 || minutes < 0) {
        alert("Horas e minutos não podem ser negativos.");
        return;
      }
      if (hours === 0 && minutes === 0) {
        alert("Insira uma duração válida maior que 0 minutos.");
        return;
      }
      if (hours > 24 || (hours === 24 && minutes > 0)) {
        alert("Não é possível registrar mais de 24 horas em uma sessão.");
        return;
      }
      if (comment && comment.length > 500) {
        alert("O comentário não pode exceder 500 caracteres.");
        return;
      }

      const decimalHours = hours + (minutes / 60);
      const sub = state.subjects.find(s => s.id === subjectId);
      
      if (!sub) {
        alert("Matéria não encontrada.");
        return;
      }
      
      const newLog = {
        id: 'log_' + Date.now(),
        type: 'estudo',
        subjectId: subjectId,
        subjectName: sub.nome,
        value: decimalHours,
        date: new Date().toISOString().split('T')[0],
        details: comment || `Lançamento manual de ${hours}h ${minutes}m`
      };

      state.logs.push(newLog);
      sub.horas += decimalHours;
      
      saveState();
      document.getElementById('form-study-log').reset();
      document.getElementById('study-minutes').value = 30; // reset to default
      
      renderHistoryLogTable();
      updateDashboardData();
    }

    function handleGradeSubmit(e) {
      e.preventDefault();
      const subjectId = document.getElementById('grade-subject').value;
      const correct = parseInt(document.getElementById('grade-correct').value) || 0;
      const total = parseInt(document.getElementById('grade-total').value) || 0;
      const comment = document.getElementById('grade-comment').value;

      // Validation
      if (!subjectId) {
        alert("Selecione uma matéria.");
        return;
      }
      if (correct < 0 || total < 0) {
        alert("O número de acertos e total não podem ser negativos.");
        return;
      }
      if (total === 0) {
        alert("O total de questões deve ser maior que 0.");
        return;
      }
      if (correct > total) {
        alert("O número de acertos não pode ser maior que o total de questões.");
        return;
      }
      if (total > 1000) {
        alert("O total de questões não pode exceder 1000.");
        return;
      }
      if (comment && comment.length > 500) {
        alert("O comentário não pode exceder 500 caracteres.");
        return;
      }

      const pct = Math.round((correct / total) * 100);
      const sub = state.subjects.find(s => s.id === subjectId);

      if (!sub) {
        alert("Matéria não encontrada.");
        return;
      }

      const newLog = {
        id: 'log_' + Date.now(),
        type: 'nota',
        subjectId: subjectId,
        subjectName: sub.nome,
        value: pct,
        date: new Date().toISOString().split('T')[0],
        details: comment ? `${comment} (${correct}/${total})` : `Resolução de questões: ${correct}/${total}`
      };

      state.logs.push(newLog);
      sub.totalQuestoes += total;
      sub.corretasQuestoes += correct;

      saveState();
      document.getElementById('form-grade-log').reset();
      document.getElementById('grade-correct').value = 8;
      document.getElementById('grade-total').value = 10;

      renderHistoryLogTable();
      updateDashboardData();
    }

    function deleteLog(logId) {
      const index = state.logs.findIndex(l => l.id === logId);
      if (index === -1) return;

      const log = state.logs[index];
      const sub = state.subjects.find(s => s.id === log.subjectId);

      if (sub) {
        if (log.type === 'estudo') {
          sub.horas = Math.max(0, sub.horas - log.value);
        } else if (log.type === 'nota') {
          // Attempt parsing details to extract fractions
          const match = log.details.match(/(\d+)\/(\d+)/);
          if (match) {
            sub.corretasQuestoes = Math.max(0, sub.corretasQuestoes - parseInt(match[1]));
            sub.totalQuestoes = Math.max(0, sub.totalQuestoes - parseInt(match[2]));
          } else {
            // General fallback if no standard format
            sub.corretasQuestoes = 0;
            sub.totalQuestoes = 0;
          }
        }
      }

      state.logs.splice(index, 1);
      saveState();
      renderHistoryLogTable();
      updateDashboardData();
    }

    function clearAllLogs() {
      if (confirm("Deseja realmente limpar todo o histórico de lançamentos?")) {
        resetData('clear');
      }
    }

    // ==========================================================================
    // MODALS QUICK ACTIONS
    // ==========================================================================
    function openModal(id) {
      const overlay = document.getElementById(id);
      if (overlay) overlay.classList.add('active');
    }

    function closeModal(id) {
      const overlay = document.getElementById(id);
      if (overlay) overlay.classList.remove('active');
    }

    function quickStudyAction(subjId, subjName) {
      document.getElementById('quick-study-subj-id').value = subjId;
      document.getElementById('quick-study-subj-name').value = subjName;
      openModal('modal-quick-study');
    }

    function handleQuickStudySubmit(e) {
      e.preventDefault();
      const subjId = document.getElementById('quick-study-subj-id').value;
      const hours = parseInt(document.getElementById('quick-study-hours').value) || 0;
      const minutes = parseInt(document.getElementById('quick-study-minutes').value) || 0;
      const comment = document.getElementById('quick-study-comment').value;

      // Validation
      if (!subjId) {
        alert("Matéria não selecionada.");
        return;
      }
      if (hours < 0 || minutes < 0) {
        alert("Horas e minutos não podem ser negativos.");
        return;
      }
      if (hours === 0 && minutes === 0) {
        alert("Insira uma duração válida maior que 0 minutos.");
        return;
      }
      if (hours > 24 || (hours === 24 && minutes > 0)) {
        alert("Não é possível registrar mais de 24 horas em uma sessão.");
        return;
      }
      if (comment && comment.length > 500) {
        alert("O comentário não pode exceder 500 caracteres.");
        return;
      }

      const decimalHours = hours + (minutes / 60);
      const sub = state.subjects.find(s => s.id === subjId);

      if (!sub) {
        alert("Matéria não encontrada.");
        return;
      }

      const newLog = {
        id: 'log_' + Date.now(),
        type: 'estudo',
        subjectId: subjId,
        subjectName: sub.nome,
        value: decimalHours,
        date: new Date().toISOString().split('T')[0],
        details: comment || `Sessão rápida de estudo`
      };

      state.logs.push(newLog);
      sub.horas += decimalHours;

      saveState();
      closeModal('modal-quick-study');
      document.getElementById('quick-study-comment').value = '';
      
      updateDashboardData();
      if (currentView === 'matrix') renderSubjectsMatrix();
    }

    function quickGradeAction(subjId, subjName) {
      document.getElementById('quick-grade-subj-id').value = subjId;
      document.getElementById('quick-grade-subj-name').value = subjName;
      openModal('modal-quick-grade');
    }

    function handleQuickGradeSubmit(e) {
      e.preventDefault();
      const subjId = document.getElementById('quick-grade-subj-id').value;
      const correct = parseInt(document.getElementById('quick-grade-correct').value) || 0;
      const total = parseInt(document.getElementById('quick-grade-total').value) || 0;
      const comment = document.getElementById('quick-grade-comment').value;

      // Validation
      if (!subjId) {
        alert("Matéria não selecionada.");
        return;
      }
      if (correct < 0 || total < 0) {
        alert("O número de acertos e total não podem ser negativos.");
        return;
      }
      if (total === 0) {
        alert("O total de questões deve ser maior que 0.");
        return;
      }
      if (correct > total) {
        alert("Acertos não podem superar o total de questões.");
        return;
      }
      if (total > 1000) {
        alert("O total de questões não pode exceder 1000.");
        return;
      }
      if (comment && comment.length > 500) {
        alert("O comentário não pode exceder 500 caracteres.");
        return;
      }

      const pct = Math.round((correct / total) * 100);
      const sub = state.subjects.find(s => s.id === subjId);

      if (!sub) {
        alert("Matéria não encontrada.");
        return;
      }

      const newLog = {
        id: 'log_' + Date.now(),
        type: 'nota',
        subjectId: subjId,
        subjectName: sub.nome,
        value: pct,
        date: new Date().toISOString().split('T')[0],
        details: comment ? `${comment} (${correct}/${total})` : `Simulado rápido (${correct}/${total})`
      };

      state.logs.push(newLog);
      sub.totalQuestoes += total;
      sub.corretasQuestoes += correct;

      saveState();
      closeModal('modal-quick-grade');
      document.getElementById('quick-grade-comment').value = '';

      updateDashboardData();
      if (currentView === 'matrix') renderSubjectsMatrix();
    }

    // ==========================================================================
    // STOPWATCH & POMODORO TIMER ENGINE
    // ==========================================================================
    function focusTimerOnSubject(subjId) {
      state.timer.selectedSubjectId = subjId;
      const dropdown = document.getElementById('timer-subject-dropdown');
      if (dropdown) dropdown.value = subjId;
      
      switchView('timer');
    }

    function selectPreset(presetName, minutes) {
      // Deactivate presets styling
      document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
      document.getElementById(`preset-${presetName}`).classList.add('active');

      state.timer.preset = presetName;
      
      if (presetName === 'stopwatch') {
        state.timer.totalSeconds = 0;
        state.timer.secondsLeft = 0;
        state.timer.elapsedSeconds = 0;
        document.getElementById('timer-sublabel').textContent = 'Cronômetro';
      } else {
        state.timer.totalSeconds = minutes * 60;
        state.timer.secondsLeft = minutes * 60;
        state.timer.elapsedSeconds = 0;
        document.getElementById('timer-sublabel').textContent = presetName === 'pomodoro' ? 'Pomodoro' : 'Foco Regressivo';
      }

      resetTimerState();
    }

    function resetTimerState() {
      // Pause interval
      if (state.timer.running) {
        toggleTimer();
      }
      
      updateTimerDisplay();
    }

    function updateTimerDisplay() {
      const clock = document.getElementById('timer-clock');
      const widgetClock = document.getElementById('widget-timer-display');
      
      let seconds = state.timer.secondsLeft;
      
      // If stopwatch, count elapsed seconds
      if (state.timer.preset === 'stopwatch') {
        seconds = state.timer.elapsedSeconds;
      }

      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const displayStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      
      if (clock) clock.textContent = displayStr;
      if (widgetClock) widgetClock.textContent = displayStr;

      // Update circular dash offset
      const ring = document.getElementById('timer-progress-ring');
      if (ring) {
        if (state.timer.preset === 'stopwatch') {
          // Just cycle the ring smoothly every minute
          const cyclePercent = (seconds % 60) / 60;
          ring.style.strokeDashoffset = 628 * (1 - cyclePercent);
        } else {
          const fraction = state.timer.secondsLeft / state.timer.totalSeconds;
          ring.style.strokeDashoffset = 628 * (1 - fraction);
        }
      }
    }

    function toggleTimer() {
      const btn = document.getElementById('btn-timer-toggle');
      const icon = document.getElementById('play-pause-icon');
      const widgetBtn = document.getElementById('widget-timer-action');
      const widgetState = document.getElementById('widget-timer-state');

      if (state.timer.running) {
        // PAUSE
        state.timer.running = false;
        clearInterval(state.timer.intervalId);
        
        if (icon) icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
        if (widgetBtn) widgetBtn.textContent = 'Retomar';
        if (widgetState) widgetState.textContent = 'Pausado';
        document.getElementById('user-status-text').textContent = 'Foco em pausa';
        document.querySelector('.status-dot').style.backgroundColor = 'var(--color-warning)';
        document.querySelector('.status-dot').style.boxShadow = '0 0 10px var(--color-warning)';
      } else {
        // START
        state.timer.running = true;
        state.timer.selectedSubjectId = document.getElementById('timer-subject-dropdown').value;
        
        state.timer.intervalId = setInterval(timerTick, 1000);
        
        if (icon) icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
        if (widgetBtn) widgetBtn.textContent = 'Pausar';
        if (widgetState) widgetState.textContent = 'Focando...';
        
        const activeSub = state.subjects.find(s => s.id === state.timer.selectedSubjectId);
        document.getElementById('user-status-text').textContent = `Focando em ${activeSub ? activeSub.nome.slice(0, 15) + '...' : 'Estudos'}`;
        document.querySelector('.status-dot').style.backgroundColor = 'var(--color-b1)';
        document.querySelector('.status-dot').style.boxShadow = '0 0 10px var(--color-b1)';
      }
    }

    function togglePlayPauseFromWidget() {
      // Force switch to active dropdown subject selection if none is loaded
      state.timer.selectedSubjectId = document.getElementById('timer-subject-dropdown').value;
      toggleTimer();
    }

    function timerTick() {
      if (state.timer.preset === 'stopwatch') {
        state.timer.elapsedSeconds++;
      } else {
        state.timer.secondsLeft--;
        if (state.timer.secondsLeft <= 0) {
          // TIMER COMPLETE!
          state.timer.secondsLeft = 0;
          toggleTimer();
          playAlarmTone();
          triggerSessionCompletionPrompt();
        }
      }
      updateTimerDisplay();
    }

    function resetTimer() {
      state.timer.secondsLeft = state.timer.preset === 'pomodoro' ? 25 * 60 : (state.timer.preset === 'long' ? 50 * 60 : 15 * 60);
      state.timer.elapsedSeconds = 0;
      
      if (state.timer.running) {
        toggleTimer();
      }
      
      updateTimerDisplay();
      
      const widgetState = document.getElementById('widget-timer-state');
      const widgetBtn = document.getElementById('widget-timer-action');
      if (widgetState) widgetState.textContent = 'Cronômetro';
      if (widgetBtn) widgetBtn.textContent = 'Iniciar Foco';
    }

    function completeTimerSession() {
      // Save current status regardless of full completion
      let elapsedMins = 0;
      if (state.timer.preset === 'stopwatch') {
        elapsedMins = Math.round(state.timer.elapsedSeconds / 60);
      } else {
        const completedSeconds = state.timer.totalSeconds - state.timer.secondsLeft;
        elapsedMins = Math.round(completedSeconds / 60);
      }

      if (elapsedMins < 1) {
        alert("Estude pelo menos 1 minuto para poder registrar a sessão de estudos.");
        return;
      }

      if (state.timer.running) {
        toggleTimer();
      }

      const activeSub = state.subjects.find(s => s.id === document.getElementById('timer-subject-dropdown').value);
      
      document.getElementById('timer-complete-duration').textContent = `${elapsedMins} minuto(s)`;
      document.getElementById('timer-complete-subj-name').value = activeSub ? activeSub.nome : 'Sem Matéria';
      document.getElementById('timer-complete-comment').value = `Foco ${state.timer.preset === 'stopwatch' ? 'cronometrado' : 'Pomodoro'} concluído.`;
      
      openModal('modal-timer-complete');
    }

    function triggerSessionCompletionPrompt() {
      // Trigger modal automatically when countdown ends
      const activeSub = state.subjects.find(s => s.id === document.getElementById('timer-subject-dropdown').value);
      const minutes = Math.round(state.timer.totalSeconds / 60);
      
      document.getElementById('timer-complete-duration').textContent = `${minutes} minutos`;
      document.getElementById('timer-complete-subj-name').value = activeSub ? activeSub.nome : 'Sem Matéria';
      document.getElementById('timer-complete-comment').value = `Foco Pomodoro de ${minutes}m concluído com sucesso!`;
      
      openModal('modal-timer-complete');
    }

    function saveTimerLog() {
      const subjectId = document.getElementById('timer-subject-dropdown').value;
      const sub = state.subjects.find(s => s.id === subjectId);
      
      let durationMins = 0;
      if (state.timer.preset === 'stopwatch') {
        durationMins = Math.round(state.timer.elapsedSeconds / 60);
      } else {
        durationMins = Math.round((state.timer.totalSeconds - state.timer.secondsLeft) / 60);
      }

      if (durationMins < 1) return;

      const decimalHours = durationMins / 60;
      const comment = document.getElementById('timer-complete-comment').value;

      const newLog = {
        id: 'log_' + Date.now(),
        type: 'estudo',
        subjectId: subjectId,
        subjectName: sub.nome,
        value: decimalHours,
        date: new Date().toISOString().split('T')[0],
        details: comment || `Sessão de foco cronometrada concluída`
      };

      state.logs.push(newLog);
      sub.horas += decimalHours;

      saveState();
      closeModal('modal-timer-complete');
      
      // Reset timer
      resetTimer();
      updateDashboardData();
      
      alert(`Sua sessão de foco de ${durationMins}m foi salva com sucesso no assunto "${sub.nome}"!`);
    }

    // Audio context alarm (Web Synthesizer alarm bell sound)
    function playAlarmTone() {
      try {
        const audio = new (window.AudioContext || window.webkitAudioContext)();
        
        // Bell sound using multiple oscillators
        const playTone = (freq, duration, delay) => {
          const osc = audio.createOscillator();
          const gain = audio.createGain();
          
          osc.connect(gain);
          gain.connect(audio.destination);
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audio.currentTime + delay);
          
          gain.gain.setValueAtTime(0.3, audio.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + delay + duration);
          
          osc.start(audio.currentTime + delay);
          osc.stop(audio.currentTime + delay + duration);
        };

        // Ring three quick high pitch pleasant beeps
        playTone(880, 0.4, 0);
        playTone(880, 0.4, 0.5);
        playTone(1320, 0.8, 1.0);
      } catch (e) {
        console.error("Synthesizer audio blocked by browser policy.", e);
      }
    }

    // Audio white noise generator synth
    function toggleAmbientNoise() {
      const btnText = document.getElementById('ambient-sound-text');
      const btn = document.getElementById('btn-ambient-sound');

      if (ambientSoundPlaying) {
        // STOP sound
        ambientSoundPlaying = false;
        if (gainNode) {
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          setTimeout(() => {
            if (whiteNoiseNode) whiteNoiseNode.stop();
          }, 600);
        }
        
        btnText.textContent = 'Ativar Ruído Branco';
        btn.style.background = 'var(--bg-tertiary)';
        btn.style.color = 'var(--text-primary)';
      } else {
        // PLAY sound
        ambientSoundPlaying = true;
        
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Web Audio synthetic white noise buffer generator
        const bufferSize = 2 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        // Fill buffer with random noise
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        whiteNoiseNode = audioCtx.createBufferSource();
        whiteNoiseNode.buffer = noiseBuffer;
        whiteNoiseNode.loop = true;

        // Add a lowpass filter to make it sound like a soothing ocean/rain rather than static TV hiss
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 450; // low frequency cut makes it warm

        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
        
        whiteNoiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        whiteNoiseNode.start(0);
        // Fade in smoothly
        gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 1.5);

        btnText.textContent = 'Pausar Ruído Branco';
        btn.style.background = 'var(--color-b1-grad)';
        btn.style.color = 'var(--bg-primary)';
      }
    }

    // ==========================================================================
    // BACKUP & RESET OPTIONS
    // ==========================================================================
    function exportData() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute("href",     dataStr     );
      dlAnchorElem.setAttribute("download", `studyflow_backup_${new Date().toISOString().split('T')[0]}.json`);
      dlAnchorElem.click();
    }

    function triggerImport() {
      document.getElementById('import-file-input').click();
    }

    function importData(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (parsed.subjects && parsed.logs) {
            state = parsed;
            saveState();
            initDropdowns();
            updateDashboardData();
            alert("Backup importado com sucesso!");
            switchView('dashboard');
          } else {
            alert("Formato de backup inválido.");
          }
        } catch (err) {
          alert("Erro ao ler o arquivo JSON.");
        }
      };
      reader.readAsText(file);
    }

    // ==========================================================================
    // COUNTDOWN TO EXAM (live, 1-second tick)
    // ==========================================================================
    function startCountdown() {
      if (countdownInterval) clearInterval(countdownInterval);
      function tick() {
        const wrap = document.getElementById('countdown-wrap');
        if (!state.schedule || !state.schedule.examDate) { if (wrap) wrap.style.display = 'none'; return; }
        const now = new Date();
        const exam = new Date(state.schedule.examDate + 'T08:00:00');
        const diff = exam - now;
        if (diff <= 0) { if (wrap) wrap.style.display = 'none'; return; }
        if (wrap) wrap.style.display = '';
        const pad = n => String(n).padStart(2, '0');
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const dEl = document.getElementById('cd-days');
        const hEl = document.getElementById('cd-hours');
        const mEl = document.getElementById('cd-mins');
        const sEl = document.getElementById('cd-secs');
        if (dEl) dEl.textContent = pad(d);
        if (hEl) hEl.textContent = pad(h);
        if (mEl) mEl.textContent = pad(m);
        if (sEl) sEl.textContent = pad(s);
        const urgencyColor = d <= 7 ? 'var(--color-danger)' : d <= 30 ? 'var(--color-warning)' : 'var(--color-b1)';
        document.querySelectorAll('.countdown-num').forEach(el => el.style.color = urgencyColor);
      }
      tick();
      countdownInterval = setInterval(tick, 1000);
    }

    // ==========================================================================
    // WEEKLY STUDY PLAN (auto-generated from INE + daily hours)
    // ==========================================================================
    function renderWeeklyPlan() {
      const container = document.getElementById('weekly-plan-container');
      const totalBadge = document.getElementById('weekly-plan-total');
      if (!container || !state.subjects || state.subjects.length === 0) return;

      const dayAbbr = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
      const dayFull  = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      const dailyHours = parseFloat(state.schedule.dailyHours) || 3.0;

      // Study days from configuration (fallback: all days)
      const studyDaysList = state.schedule.studyDays || ['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];

      // Sort subjects by urgency (INE) descending
      const rated = state.subjects
        .map(s => ({ ...s, ine: calculateINE(s) }))
        .sort((a, b) => b.ine - a.ine);

      // Today index: Mon=0 ... Sun=6
      const todayDow = new Date().getDay();
      const todayIdx = todayDow === 0 ? 6 : todayDow - 1;

      const blocoColor = { 'Bloco 1': 'var(--color-b1)', 'Bloco 2': 'var(--color-b2)', 'Bloco 3': 'var(--color-b3)', 'Básico': 'var(--color-basicas)' };
      const totalAvail = getAvailableHours();

      const weekPlan = dayAbbr.map((short, i) => {
        const isStudyDay = studyDaysList.includes(short);
        const dayH = isStudyDay ? dailyHours : 0;
        const slots = [];

        if (isStudyDay) {
          let remaining = dayH;
          const n = rated.length;
          // Rotate starting index per day so subjects cycle across the week
          for (let k = 0; k < n && remaining > 0.24 && slots.length < 3; k++) {
            const sub = rated[(i * 2 + k) % n];
            const target = getSubjectTargetHours(sub, totalAvail);
            const session = Math.max(0.5, Math.min(remaining, parseFloat((target / 6).toFixed(1))));
            const rounded = Math.round(session * 2) / 2;
            if (rounded > 0) {
              slots.push({ sub, hours: rounded });
              remaining = parseFloat((remaining - rounded).toFixed(2));
            }
          }
        }

        return { short, fullName: dayFull[i], slots, dayH, isStudyDay };
      });

      // Total hours only counts active study days
      const totalWeekH = weekPlan.reduce((a, d) => a + d.dayH, 0);
      if (totalBadge) totalBadge.textContent = `${totalWeekH.toFixed(1)}h esta semana`;

      container.innerHTML = weekPlan.map((plan, i) => {
        const isToday = i === todayIdx;
        if (!plan.isStudyDay) {
          // Rest day card — muted style
          return `<div class="day-card day-card-rest${isToday ? ' day-card-today' : ''}">
            <div class="day-card-header">
              <span class="day-name-abbr" style="opacity:0.45;">${plan.short}</span>
              ${isToday ? '<span class="today-badge">HOJE</span>' : ''}
              <span class="day-h-total" style="opacity:0.35;">—</span>
            </div>
            <div class="day-subjects-list">
              <span class="day-rest">😴 Descanso</span>
            </div>
          </div>`;
        }

        const slotsHTML = plan.slots.map(slot => {
          const color = blocoColor[slot.sub.bloco] || 'var(--color-b1)';
          const name = slot.sub.nome.length > 24 ? slot.sub.nome.slice(0, 22) + '…' : slot.sub.nome;
          return `<div class="day-subject-item" style="border-left:3px solid ${color};">
            <span class="day-subj-name">${escapeHTML(name)}</span>
            <span class="day-subj-hours">${slot.hours.toFixed(1)}h</span>
          </div>`;
        }).join('');

        return `<div class="day-card${isToday ? ' day-card-today' : ''}">
          <div class="day-card-header">
            <span class="day-name-abbr">${plan.short}</span>
            ${isToday ? '<span class="today-badge">HOJE</span>' : ''}
            <span class="day-h-total">${plan.dayH.toFixed(1)}h</span>
          </div>
          <div class="day-subjects-list">
            ${slotsHTML || '<span class="day-rest">Descanso</span>'}
          </div>
        </div>`;
      }).join('');
    }


    // ==========================================================================
    // GOALS & MILESTONES CONTROLLER
    // ==========================================================================
    function updateGoalsView() {
      // 1. STREAK CALCULATION
      const datesStudied = new Set(state.logs.map(l => l.date));
      let streak = 0;
      const checkDate = new Date();
      checkDate.setHours(0,0,0,0);
      
      const todayStr = checkDate.toISOString().split('T')[0];
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      
      let startCheckingFrom = null;
      if (datesStudied.has(todayStr)) {
        startCheckingFrom = new Date();
      } else if (datesStudied.has(yesterdayStr)) {
        startCheckingFrom = new Date();
        startCheckingFrom.setDate(startCheckingFrom.getDate() - 1);
      }
      
      if (startCheckingFrom) {
        let currentCheck = startCheckingFrom;
        currentCheck.setHours(0,0,0,0);
        while (datesStudied.has(currentCheck.toISOString().split('T')[0])) {
          streak++;
          currentCheck.setDate(currentCheck.getDate() - 1);
        }
      }
      
      const streakCountEl = document.getElementById('goals-streak-count');
      if (streakCountEl) streakCountEl.textContent = `${streak} ${streak === 1 ? 'Dia' : 'Dias'}`;
      
      const streakTipEl = document.getElementById('goals-streak-tip');
      if (streakTipEl) {
        if (streak > 0) {
          streakTipEl.textContent = `🔥 Sensacional! Sua sequência de estudos está ativa.`;
        } else {
          streakTipEl.textContent = `Comece a estudar hoje para iniciar uma sequência!`;
        }
      }

      // 2. WEEKLY GOAL CALCULATION
      let weeklyHours = 0;
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      
      state.logs.forEach(log => {
        if (log.type === 'estudo') {
          const logDate = new Date(log.date + 'T12:00:00');
          if (logDate >= sevenDaysAgo && logDate <= today) {
            weeklyHours += log.value;
          }
        }
      });
      
      const weeklyHoursEl = document.getElementById('goals-weekly-hours');
      if (weeklyHoursEl) weeklyHoursEl.textContent = `${weeklyHours.toFixed(1)}h`;
      
      const targetHours = 21.0; 
      const progressPct = Math.min(100, Math.round((weeklyHours / targetHours) * 100));
      
      const percentEl = document.getElementById('goals-weekly-percent');
      if (percentEl) percentEl.textContent = `${progressPct}% Concluído`;
      
      const ringEl = document.getElementById('goals-weekly-progress');
      if (ringEl) {
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - progressPct / 100);
        ringEl.style.strokeDasharray = circumference;
        ringEl.style.strokeDashoffset = offset;
      }

      // 3. MILESTONE BADGES CALCULATION
      let totalHours = 0;
      let totalQuestions = 0;
      let totalPomodoros = state.logs.filter(l => l.details && l.details.toLowerCase().includes('pomodoro')).length;
      let perfectQuizzes = 0;
      
      state.subjects.forEach(sub => {
        totalHours += sub.horas;
        totalQuestions += sub.totalQuestoes;
      });

      state.logs.forEach(l => {
        if (l.type === 'nota' && l.value >= 90) {
          perfectQuizzes++;
        }
      });

      const badges = [
        {
          id: 'badge_iniciante',
          name: 'Calouro de Elétrica',
          desc: 'Estude pelo menos 5 horas no total.',
          icon: '🎓',
          unlocked: totalHours >= 5
        },
        {
          id: 'badge_maratonista',
          name: 'Foco de Aço',
          desc: 'Estude pelo menos 20 horas no total.',
          icon: '🏃‍♂️',
          unlocked: totalHours >= 20
        },
        {
          id: 'badge_resoluto',
          name: 'Máquina de Questões',
          desc: 'Resolva pelo menos 50 questões.',
          icon: '🎯',
          unlocked: totalQuestions >= 50
        },
        {
          id: 'badge_gabarito',
          name: 'Gabaritador',
          desc: 'Consiga nota >= 90% em pelo menos 1 quiz.',
          icon: '🏆',
          unlocked: perfectQuizzes >= 1
        },
        {
          id: 'badge_pomodoro_master',
          name: 'Lord do Pomodoro',
          desc: 'Complete 5 sessões de foco.',
          icon: '⏱',
          unlocked: totalPomodoros >= 5
        },
        {
          id: 'badge_constancia',
          name: 'Hábito Inabalável',
          desc: 'Alcance uma sequência de 3 dias de estudo.',
          icon: '💎',
          unlocked: streak >= 3
        }
      ];

      const container = document.getElementById('milestones-badges-container');
      if (container) {
        container.innerHTML = badges.map(b => {
          return `
            <div class="glass-panel text-center animated" style="padding: 1rem; border: 1px solid ${b.unlocked ? 'var(--color-b1)' : 'var(--glass-border)'}; opacity: ${b.unlocked ? 1 : 0.45}; transition: var(--transition-smooth); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; text-align:center;">
              <div style="font-size:2.5rem; filter: ${b.unlocked ? 'none' : 'grayscale(1)'};">${b.icon}</div>
              <h4 style="font-size:0.95rem; font-weight:700; margin:0; color: ${b.unlocked ? 'var(--color-b1)' : 'var(--text-secondary)'};">${b.name}</h4>
              <p style="font-size:0.72rem; color:var(--text-muted); margin:0; line-height:1.3;">${b.desc}</p>
              <span style="font-size:0.65rem; font-family:'JetBrains Mono', monospace; font-weight:700; color:${b.unlocked ? 'var(--color-success)' : 'var(--text-muted)'}; margin-top:2px;">
                ${b.unlocked ? '✓ DESBLOQUEADA' : '🔒 BLOQUEADA'}
              </span>
            </div>
          `;
        }).join('');
      }
    }
    // ==========================================================================
    // EXPORT PDF UTILITY
    // ==========================================================================
    function exportToPDF() {
      window.print(); // Simple, beautiful browser print template style
    }
