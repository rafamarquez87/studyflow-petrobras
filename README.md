# StudyFlow Petrobras

Gestor inteligente e interativo de estudos para o concurso da Petrobras Elétrica (Equipamentos Júnior).

## 📋 Visão Geral

O StudyFlow Petrobras é uma aplicação web single-page (SPA) projetada para ajudar estudantes a gerenciar sua preparação para o concurso da Petrobras Elétrica. A aplicação oferece recomendações automáticas de foco baseadas no edital, acompanhamento de tempo de estudo, registro de desempenho em questões, e muito mais.

## ✨ Funcionalidades

### Dashboard Analítico
- Métricas gerais (horas estudadas, média de acertos, questões resolvidas)
- Recomendações inteligentes de foco (algoritmo INE)
- Gráficos interativos (Radar, Doughnut, Bar, Line)
- Evolução temporal de estudos
- Contagem regressiva para a prova

### Grade Curricular
- 25 matérias do edital Petrobras Elétrica
- Filtro por bloco e prioridade
- Busca por assunto
- Registro rápido de estudo/notas
- Indicador de urgência (INE)

### Timer/Pomodoro
- Presets (25min, 50min, 15min, cronômetro livre)
- Seleção de matéria
- Sintetizador de ruído branco (Web Audio API)
- Widget na sidebar

### Planejamento
- Definição de data da prova
- Carga horária diária
- Seleção de dias de estudo
- Plano semanal dinâmico
- Metas por matéria

### Metas e Conquistas
- Sequência de estudos (streak)
- Meta semanal com progresso circular
- Sistema de badges/milestones

### Histórico e Lançamentos
- Registro manual de tempo de estudo
- Registro de desempenho em questões
- Histórico detalhado
- Exportação/Importação de dados (JSON)

### Configurações
- Tema claro/escuro
- Perfil do usuário
- Notificações
- Reset de dados

## 🚀 Como Usar

### Instalação

1. Clone o repositório ou baixe os arquivos
2. Abra o arquivo `index.html` em um navegador moderno
3. A aplicação funciona completamente offline (apenas precisa de conexão para carregar Chart.js CDN)

### Primeiros Passos

1. Configure sua data da prova nas configurações
2. Defina sua carga horária diária
3. Selecione os dias da semana que você vai estudar
4. Comece a registrar suas sessões de estudo
5. Acompanhe as recomendações automáticas no dashboard

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
Web - gerenciamento de estudos/
├── index.html                          # HTML principal
├── app.js                              # Lógica da aplicação (modularizado)
├── styles.css                          # Estilos principais
├── dashboard_dark.css                  # Tema escuro alternativo
├── dashboard_petrobras_2014_completo_html.html  # Dashboard específico (legado)
├── dashboard_petrobras_cesgranrio.html  # Dashboard específico (legado)
└── README.md                           # Documentação
```

### Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos com variáveis CSS, glassmorphism, responsividade
- **JavaScript (Vanilla)** - Lógica sem frameworks
- **Chart.js** - Visualização de dados
- **LocalStorage** - Persistência de dados
- **Web Audio API** - Sintetizador de ruído branco

### Algoritmo INE (Índice de Necessidade de Estudo)

O algoritmo INE calcula a urgência de cada matéria baseado em:

- **Prioridade do edital** (Alta: 35, Média: 20, Baixa: 5)
- **Incidência em provas** (número de questões × 6.5)
- **Horas estudadas** (penalidade proporcional à meta)
- **Desempenho** (penalidade para notas baixas)
- **Bônus para matérias não estudadas** (15 pontos)

Resultado: 0-100% (quanto maior, mais urgente)

## 🔒 Segurança

### XSS Sanitization

A aplicação implementa sanitização XSS através da função `escapeHTML()` que é aplicada em todos os locais onde dados do usuário são inseridos no DOM via `innerHTML`.

### Validação de Entrada

Todos os formulários possuem validação robusta:
- Valores negativos não permitidos
- Limites máximos (24h por sessão, 1000 questões por registro)
- Validação de campos obrigatórios
- Limite de 500 caracteres para comentários

## 📊 Dados do Edital

O edital da Petrobras Elétrica está completamente implementado com:

### Bloco 1 (35% do foco)
- Teoria Eletromagnética
- Circuitos Elétricos (CC e CA)
- Máquinas Elétricas
- Análise de SEP

### Bloco 2 (25% do foco)
- Geração, Transmissão e Distribuição
- Acionamentos e Controles Elétricos
- Instalações Elétricas
- Aterramento de Sistemas
- Proteção de Sistemas
- Medidas Elétricas
- Eletrônica Analógica e Digital
- Eletrônica de Potência

### Bloco 3 (20% do foco)
- Cálculo Diferencial, Integral e Vetorial
- Equações Diferenciais Ordinárias
- Álgebra Linear
- Sistemas de Controle
- Probabilidade e Estatística
- Termodinâmica e Ciclos Térmicos
- Fenômenos de Transporte e Fluidos
- Máquinas de Fluxo

### Conhecimentos Básicos (20% do foco)
- Português (Interpretação, Semântica, Pontuação, Crase, Coesão, Relações, Colocação, Concordância, Regência)
- Inglês (Compreensão de texto, Itens gramaticais)

## 🎨 Design

### Tema

- **Glassmorphism** - Design moderno com efeitos de vidro fosco
- **Dark Mode** - Tema escuro padrão com opção de tema claro
- **Cores Neon** - Acentos vibrantes para diferentes blocos
  - Bloco 1: Ciano (#00f2fe)
  - Bloco 2: Amarelo (#e8c547)
  - Bloco 3: Laranja (#f7934c)
  - Básico: Roxo (#a78bfa)

### Responsividade

- Mobile-first approach
- Media queries para tablets e desktops
- Layout adaptativo

## 📝 Melhorias Recentes

### Refatoração (2025)
- ✅ Modularização do JavaScript (app.js separado)
- ✅ Adição de sanitização XSS
- ✅ Validação robusta de formulários
- ✅ Documentação completa (README)

## 🚧 Próximas Melhorias

- [ ] Separar CSS em módulos por componente
- [ ] Adicionar testes unitários
- [ ] Implementar sistema de build (Vite/Webpack)
- [ ] Adicionar PWA capabilities
- [ ] Implementar sincronização cloud
- [ ] Adicionar modo colaborativo

## 📄 Licença

Este projeto é para uso pessoal e educacional.

## 👤 Autor

Desenvolvido para preparação do concurso Petrobras Elétrica.

## 🤝 Contribuindo

Sugestões e melhorias são bem-vindas. Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
