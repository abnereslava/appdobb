/**
 * ================================================
 * LINHA DO TEMPO DO BEBÊ — app.js
 * Para editar no VSCode: modifique este arquivo
 * ================================================
 */


/* ================================================
   1. CONSTANTES
   ================================================ */

// localStorage não é mais usado como armazenamento principal (migrado para Firestore)

/* ================================================
   1. CONSTANTES DE ÍCONES (SVG)
   ================================================ */
// Ícones ilustrativos → imagens PNG
const IMG_BRINQUEDO    = `<img src="img/brinquedo.png"    class="img-icon-ilustracao" alt="" />`;
const IMG_URSINHOBEM   = `<img src="img/ursinhobem.png"   class="img-icon-ilustracao" alt="" />`;
const IMG_AGENDA       = `<img src="img/agenda.png"       class="img-icon-ilustracao" alt="" />`;

// Ícones de categoria → PNG onde há correspondência, SVG nos demais
const IMG_DOENCA   = `<img src="img/ursinhodoente.png" class="category-icon-img" alt="" />`;
const IMG_ACIDENTE = `<img src="img/curativo.png"      class="category-icon-img" alt="" />`;
const IMG_CONSULTA = `<img src="img/calendario.png"    class="category-icon-img" alt="" />`;
const IMG_CIRURGIA = `<img src="img/cirurgia.png"      class="category-icon-img" alt="" />`;
const IMG_REMEDIOS = `<img src="img/remedios.png"      class="category-icon-img" alt="" />`;

// SVGs mantidos: ícones sem PNG correspondente e ícones inline funcionais
const SEARCH_SVG  = `<svg class="category-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
const CLOCK_SVG   = `<svg class="inline-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const WARNING_SVG = `<svg class="inline-icon" viewBox="0 0 24 24" style="color: #c0392b; margin-right: 4px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const MALE_SVG    = `<svg class="inline-icon" viewBox="0 0 24 24" style="margin-right: 4px; color: #2a62a0;"><circle cx="10" cy="14" r="5"/><path d="M14 10L19 5"/><path d="M14 5h5v5"/></svg>`;
const FEMALE_SVG  = `<svg class="inline-icon" viewBox="0 0 24 24" style="margin-right: 4px; color: #a03458;"><circle cx="12" cy="9" r="5"/><path d="M12 14v7"/><path d="M9 18h6"/></svg>`;
const ALERGIA_SVG = `<svg class="category-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v7M12 15v7M2 12h7M15 12h7M5.6 5.6l4.9 4.9M13.5 13.5l4.9 4.9M18.4 5.6l-4.9 4.9M10.5 13.5l-4.9 4.9"/></svg>`;
const VACINA_SVG  = `<svg class="category-icon" viewBox="0 0 24 24"><path d="m21 3-3 3M18 2l4 4M14 8l-8.5 8.5L3 19l2.5-2.5L14 8zM12 6l4 4M8.5 9.5l3 3M6 12l3 3M3 21l-1 1"/></svg>`;
const OUTRO_SVG   = `<svg class="category-icon" viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;

const CATEGORIAS = {
  doenca:   { label: 'Doença',   icone: IMG_DOENCA   },
  acidente: { label: 'Acidente', icone: IMG_ACIDENTE },
  alergia:  { label: 'Alergia',  icone: ALERGIA_SVG  },
  consulta: { label: 'Consulta', icone: IMG_CONSULTA },
  vacina:   { label: 'Vacina',   icone: VACINA_SVG   },
  cirurgia: { label: 'Cirurgia', icone: IMG_CIRURGIA },
  outro:    { label: 'Outro',    icone: OUTRO_SVG    },
};

const TIPOS_CONSULTA = {
  rotina:      'Consulta de Rotina',
  especialista:'Especialista',
  retorno:     'Retorno',
  exame:       'Exame',
  urgencia:    'Urgência',
  outro:       'Outro',
};

const TIPOS_ALERGIA = {
  alimentar:     'Alimentar',
  medicamentosa: 'Medicamentosa',
  respiratoria:  'Respiratória',
  outra:         'Outra',
};

const SEVERIDADES = {
  leve:     'Leve',
  moderada: 'Moderada',
  grave:    'Grave',
};

const LOCAIS_NASCIMENTO = {
  hospital: 'Hospital / Maternidade',
  casa:     'Em casa',
  percurso: 'No percurso / Ambulância',
};

const VIAS_NASCIMENTO = {
  normal:  'Parto Normal',
  cesarea: 'Cesárea',
};

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// Estado da timeline
let filtroAtivo  = 'todos';
let buscaAtiva   = '';

// Estado da agenda
let buscaAgendaAtiva = '';
let modoAgenda          = localStorage.getItem('modo-agenda') || 'lista';
let mesCalendarioAtivo  = { ano: new Date().getFullYear(), mes: new Date().getMonth() };
let diaCalendarioAberto = null;

// Filtro de data compartilhado entre Histórico e Agenda
let filtroDataInicio = '';
let filtroDataFim    = '';

// Paginação de eventos
let eventosCache    = [];
let eventosCursor   = null;
let eventosEsgotado = false;
let eventosCarregando = false;
let _observerTimeline = null;

// Paginação de consultas
let consultasCache    = [];
let consultasCursor   = null;
let consultasEsgotado = false;
let consultasCarregando = false;
let _observerAgenda   = null;

// Usuário autenticado e contexto de acesso (preenchidos pelo módulo auth.js)
let usuarioAtual    = null;
let acessoAtual     = null;   // { autorizado, profileId, profileIds, role, permissions }

// Multi-perfil
let profileIdAtivo  = null;   // profileId do bebê atualmente selecionado
let profileIds      = [];     // todos os profileIds do usuário

// true após confirmar que o perfil do bebê ativo existe no Firestore
let temPerfil = false;

// Estado dos formulários
let medicamentosTemp = [];
let alergiasTemp     = [];


/* ================================================
   2. DADOS
   ================================================ */

// Perfil — Firestore (assíncrono)
async function carregarPerfil() {
  if (!profileIdAtivo || !window._db) return null;
  try {
    return await window._db.carregarPerfil(profileIdAtivo);
  } catch (e) {
    console.error('Erro ao carregar perfil:', e);
    return null;
  }
}

async function gravarPerfil(p) {
  if (!profileIdAtivo || !window._db) return;
  await window._db.gravarPerfil(profileIdAtivo, p, usuarioAtual?.uid || null);
}

// Eventos — Firestore (assíncrono)
async function carregarEventos() {
  if (!profileIdAtivo || !window._db) return [];
  try {
    return await window._db.listarEventos(profileIdAtivo);
  } catch (e) {
    console.error('Erro ao carregar eventos:', e);
    return [];
  }
}

async function gravarEvento(ev, ehNovo) {
  if (!profileIdAtivo || !window._db) return;
  await window._db.salvarEvento(profileIdAtivo, ev, ehNovo);
}

async function excluirEvento(id) {
  if (!profileIdAtivo || !window._db) return;
  await window._db.excluirEvento(profileIdAtivo, id);
}

// Consultas — Firestore (assíncrono)
async function carregarConsultas() {
  if (!profileIdAtivo || !window._db) return [];
  try {
    return await window._db.listarConsultas(profileIdAtivo);
  } catch (e) {
    console.error('Erro ao carregar consultas:', e);
    return [];
  }
}

async function gravarConsulta(c, ehNova) {
  if (!profileIdAtivo || !window._db) return;
  await window._db.salvarConsulta(profileIdAtivo, c, ehNova);
}

async function excluirConsulta(id) {
  if (!profileIdAtivo || !window._db) return;
  await window._db.excluirConsulta(profileIdAtivo, id);
}

// Paginação de eventos
async function _carregarPaginaEventos() {
  if (!profileIdAtivo || !window._db || eventosEsgotado || eventosCarregando) return;
  eventosCarregando = true;
  try {
    const res = await window._db.listarEventosPaginados(profileIdAtivo, eventosCursor, filtroDataInicio, filtroDataFim);
    eventosCache  = [...eventosCache, ...res.docs];
    eventosCursor = res.cursor;
    if (res.docs.length < 20) eventosEsgotado = true;
  } catch (e) {
    console.error('Erro ao paginar eventos:', e);
  }
  eventosCarregando = false;
}

async function resetarERecarregarEventos() {
  if (_observerTimeline) { _observerTimeline.disconnect(); _observerTimeline = null; }
  eventosCache = []; eventosCursor = null; eventosEsgotado = false;
  await _carregarPaginaEventos();
  renderizarTimeline();
}

async function carregarMaisEventos() {
  await _carregarPaginaEventos();
  renderizarTimeline();
}

// Paginação de consultas
async function _carregarPaginaConsultas() {
  if (!profileIdAtivo || !window._db || consultasEsgotado || consultasCarregando) return;
  consultasCarregando = true;
  try {
    const res = await window._db.listarConsultasPaginadas(profileIdAtivo, consultasCursor, filtroDataInicio, filtroDataFim);
    consultasCache  = [...consultasCache, ...res.docs];
    consultasCursor = res.cursor;
    if (res.docs.length < 20) consultasEsgotado = true;
  } catch (e) {
    console.error('Erro ao paginar consultas:', e);
  }
  consultasCarregando = false;
}

async function resetarERecarregarConsultas() {
  if (_observerAgenda) { _observerAgenda.disconnect(); _observerAgenda = null; }
  consultasCache = []; consultasCursor = null; consultasEsgotado = false;
  await _carregarPaginaConsultas();
  renderizarAgenda();
}

async function carregarMaisConsultas() {
  await _carregarPaginaConsultas();
  renderizarAgenda();
}

function alterarFiltroData(inicio, fim) {
  filtroDataInicio = inicio;
  filtroDataFim    = fim;
  resetarERecarregarEventos();
  resetarERecarregarConsultas();
}

function gerarId() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }


/* ================================================
   3. TEMA
   ================================================ */

function aplicarTema(sexo) {
  const mapa = { menino: 'menino', menina: 'menina' };
  const tema = mapa[sexo] || 'beige';
  localStorage.setItem('tema-genero', tema);
  // Sempre atualiza o atributo de gênero (usado para cores primárias no dark mode)
  document.body.setAttribute('data-genero', tema);
  // Só aplica o tema de fundo se não estiver no dark mode
  if (document.body.getAttribute('data-theme') !== 'dark') {
    document.body.setAttribute('data-theme', tema);
  }
}


/* ================================================
   4. NAVEGAÇÃO
   ================================================ */

function saltarBotaoPerfil() {
  const btn = document.getElementById('nav-home');
  if (!btn) return;
  btn.classList.remove('nav-btn-bounce');
  void btn.offsetWidth; // força reflow para reiniciar animação
  btn.classList.add('nav-btn-bounce');
  btn.addEventListener('animationend', () => btn.classList.remove('nav-btn-bounce'), { once: true });
}

function showView(nome) {
  if (!temPerfil && (nome === 'timeline' || nome === 'agenda' || nome === 'calendario')) {
    mostrarToast('Crie o perfil do bebê primeiro.', 'error');
    saltarBotaoPerfil();
    return;
  }

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const vista  = document.getElementById('view-' + nome);
  const navBtn = document.getElementById('nav-' + nome);
  if (vista)  vista.classList.add('active');
  if (navBtn) navBtn.classList.add('active');

  if (nome === 'home')       renderizarHome();
  if (nome === 'timeline')   resetarERecarregarEventos();
  if (nome === 'agenda')     resetarERecarregarConsultas();
  if (nome === 'calendario') { diaCalendarioAberto = null; renderizarAbaCalendario(); }
}

function abrirModal(id)  { const m = document.getElementById(id); if (m) m.classList.add('open');    document.body.style.overflow = 'hidden'; }
function fecharModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); document.body.style.overflow = ''; }

// Modal de confirmação customizado — substitui confirm() nativo
let _confirmarResolve = null;

function confirmar({ titulo, msg, txtOk = 'Confirmar', destrutivo = false, icone = '' }) {
  return new Promise(resolve => {
    _confirmarResolve = resolve;
    document.getElementById('confirmar-titulo').textContent = titulo;
    document.getElementById('confirmar-msg').textContent    = msg;
    document.getElementById('confirmar-icone').innerHTML    = icone;
    const btnOk = document.getElementById('confirmar-btn-ok');
    btnOk.textContent  = txtOk;
    btnOk.className    = destrutivo ? 'btn-danger' : 'btn-primary';
    abrirModal('modal-confirmar');
  });
}

function fecharConfirmar(resultado) {
  fecharModal('modal-confirmar');
  if (_confirmarResolve) { _confirmarResolve(resultado); _confirmarResolve = null; }
}

function atualizarNavSemPerfil() {
  const btns = [
    document.getElementById('nav-timeline'),
    document.getElementById('nav-agenda'),
    document.getElementById('nav-calendario'),
    document.getElementById('nav-add'),
  ];
  btns.forEach(b => {
    if (!b) return;
    b.style.opacity = temPerfil ? '' : '0.35';
    b.title = temPerfil ? '' : 'Crie o perfil do bebê primeiro';
  });
}

function mostrarMenuAdicionar() {
  if (!temPerfil) {
    mostrarToast('Crie o perfil do bebê primeiro.', 'error');
    saltarBotaoPerfil();
    return;
  }
  const menu = document.getElementById('menu-adicionar');
  if (menu) { menu.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}
function fecharMenuAdicionar() {
  const menu = document.getElementById('menu-adicionar');
  if (menu) { menu.style.display = 'none'; document.body.style.overflow = ''; }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    fecharMenuAdicionar();
    document.body.style.overflow = '';
  }
});


/* ================================================
   5. TELA DE PERFIL (HOME)
   ================================================ */

async function renderizarHome() {
  const container = document.getElementById('view-home');
  container.innerHTML = `<div class="carregando-view"><div class="login-spinner"></div></div>`;

  const perfil  = await carregarPerfil();
  temPerfil = !!(perfil && perfil.nomeCompleto);
  atualizarNavSemPerfil();

  const eventos = await carregarEventos();

  if (!perfil || !perfil.nomeCompleto) {
    atualizarNomeBebe('');
    container.innerHTML = `
      <div class="welcome-screen">
        <div class="welcome-icon">${IMG_BRINQUEDO}</div>
        <h1 class="welcome-title">Bem-vindo(a)!</h1>
        <p class="welcome-text">Vamos criar o perfil do seu bebê para acompanhar toda a sua jornada de saúde com carinho e organização.</p>
        <button class="btn-primary" style="max-width:280px;" onclick="abrirFormPerfil()">Criar Perfil do Bebê</button>
      </div>`;
    return;
  }

  aplicarTema(perfil.sexo);

  const totalEventos = eventos.length;
  const totalGasto   = eventos.reduce((s, e) => s + (parseFloat(e.custo) || 0), 0);
  const contagens    = {};
  eventos.forEach(e => { contagens[e.categoria] = (contagens[e.categoria] || 0) + 1; });

  const avatarHTML = perfil.fotoUrl
    ? `<img src="${esc(perfil.fotoUrl)}" alt="${esc(perfil.nomeCompleto)}" onerror="this.style.display='none'" />`
    : `<img src="img/mamadeira.png" alt="" style="width:56px;height:56px;object-fit:contain;" />`;

  const generoBadge = perfil.sexo ? `<span class="profile-gender-badge">${perfil.sexo === 'menino' ? `${MALE_SVG} Menino` : `${FEMALE_SVG} Menina`}</span>` : '';
  const prematuro   = perfil.semanasGestacao && parseInt(perfil.semanasGestacao) < 37;
  const premHTML    = prematuro ? `<span class="badge-prematuro">Prematuro · ${perfil.semanasGestacao}sem</span>` : '';

  const statsHTML = [];
  if (perfil.peso)   statsHTML.push(`<div class="profile-stat"><div class="profile-stat-value">${perfil.peso}<span style="font-size:12px;"> kg</span></div><div class="profile-stat-label">Peso</div></div>`);
  if (perfil.altura) statsHTML.push(`<div class="profile-stat" style="${statsHTML.length?'border-left:1px solid var(--border);padding-left:20px;':''}"><div class="profile-stat-value">${perfil.altura}<span style="font-size:12px;"> cm</span></div><div class="profile-stat-label">Altura</div></div>`);

  const infoNasc = [];
  if (perfil.viaNascimento)   infoNasc.push({ label:'Via de parto',          value: VIAS_NASCIMENTO[perfil.viaNascimento] || perfil.viaNascimento });
  if (perfil.localNascimento) infoNasc.push({ label:'Local',                 value: LOCAIS_NASCIMENTO[perfil.localNascimento] || perfil.localNascimento });
  if (perfil.semanasGestacao) infoNasc.push({ label:'Gestação',              value: `${perfil.semanasGestacao} semanas` + (prematuro ? ' (prematuro)' : '') });
  if (perfil.tipoBebe)        infoNasc.push({ label:'Tipo sanguíneo (bebê)', value: perfil.tipoBebe });
  if (perfil.tipoMae)         infoNasc.push({ label:'Tipo sanguíneo (mãe)', value: perfil.tipoMae });
  if (perfil.amamentacao) {
    const amamLabel = perfil.amamentacao === 'sim' ? 'Sim, até os 6 meses'
      : perfil.amamentacao === 'nao' ? 'Não'
      : (perfil.amamentacaoOutro || 'Outro');
    infoNasc.push({ label:'Amamentação', value: amamLabel });
  }

  const recentes = [...eventos].sort((a,b) => new Date(b.data) - new Date(a.data)).slice(0,3);

  atualizarNomeBebe(perfil.nomeCompleto);
  container.innerHTML = `
    <div style="padding-bottom:8px;">

      <!-- Perfil -->
      <div class="profile-card">
        <button class="profile-edit-btn" onclick="abrirFormPerfil()" title="Editar perfil">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <div class="profile-avatar">${avatarHTML}</div>
        <div class="profile-name">${esc(perfil.nomeCompleto)}</div>
        <div class="profile-age">${calcularIdade(perfil.dataNascimento)}</div>
        ${generoBadge}${premHTML}
        <div class="profile-stats" style="margin-top:14px;">${statsHTML.join('')}</div>
      </div>

      ${infoNasc.length ? `
      <div class="info-card" style="margin-bottom:12px;">
        <div class="info-card-title">Informações de Nascimento</div>
        <div class="info-grid">${infoNasc.map(i => `<div class="info-item"><span class="info-label">${i.label}</span><span class="info-value">${esc(i.value)}</span></div>`).join('')}</div>
      </div>` : ''}

      <!-- Alergias -->
      <div class="alergias-section" style="margin-bottom:12px;">
        <div class="section-title" style="font-size:14px;margin-bottom:8px;display:flex;align-items:center;gap:4px;">${WARNING_SVG} Alergias</div>
        ${(perfil.alergias||[]).length === 0
          ? '<p class="no-allergies">Nenhuma alergia registrada</p>'
          : renderizarAlergiasAgrupadas(perfil.alergias)}
      </div>

      ${totalEventos > 0 ? `
      <div class="stats-grid" style="margin-bottom:12px;">
        <div class="stat-card accent"><div class="stat-value">${totalEventos}</div><div class="stat-label">Eventos</div></div>
        <div class="stat-card"><div class="stat-value" style="font-size:18px;">${formatarDinheiro(totalGasto)}</div><div class="stat-label">Total gasto</div></div>
      </div>` : ''}

      ${recentes.length ? `
      <div style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div class="section-title" style="margin:0">Últimos Eventos</div>
          <button onclick="showView('timeline')" style="font-size:13px;color:var(--primary);background:none;border:none;cursor:pointer;font-weight:500;">Ver todos →</button>
        </div>
        ${recentes.map(e => {
          const cat = CATEGORIAS[e.categoria] || CATEGORIAS.outro;
          return `<div onclick="abrirDetalheEvento('${e.id}')" style="display:flex;align-items:center;gap:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:12px 14px;margin-bottom:8px;cursor:pointer;box-shadow:var(--shadow-sm);">
            <span class="event-recent-icon icon-${e.categoria}">${cat.icone}</span>
            <div style="flex:1;min-width:0;">
              <div style="font-size:14px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(e.titulo)}</div>
              <div style="font-size:12px;color:var(--text-muted);">${formatarData(e.data)}</div>
            </div>
            <span class="event-category-badge badge-${e.categoria}">${cat.label}</span>
          </div>`;
        }).join('')}
      </div>` : ''}

    </div>`;
}

function renderizarAlergiasAgrupadas(alergias) {
  const grupos = {};
  alergias.forEach(a => { if (!grupos[a.tipo]) grupos[a.tipo]=[]; grupos[a.tipo].push(a); });
  return Object.entries(grupos).map(([tipo, lista]) => `
    <div>
      <div class="allergy-type-label">${TIPOS_ALERGIA[tipo] || tipo}</div>
      <div>${lista.map(a => `<span class="allergy-tag">${esc(a.descricao)}${a.severidade ? `<span class="allergy-severity">(${SEVERIDADES[a.severidade]||a.severidade})</span>` : ''}</span>`).join('')}</div>
    </div>`).join('');
}


/* ================================================
   6. FORMULÁRIO DE PERFIL
   ================================================ */

async function abrirFormPerfil() {
  const p = (await carregarPerfil()) || {};
  set('perfil-nome', p.nomeCompleto || '');
  set('perfil-nascimento', p.dataNascimento || '');
  set('perfil-semanas', p.semanasGestacao || '');
  set('perfil-local-nasc', p.localNascimento || '');
  set('perfil-tipo-bebe', p.tipoBebe || '');
  set('perfil-tipo-mae', p.tipoMae || '');
  set('perfil-peso', p.peso || '');
  set('perfil-altura', p.altura || '');
  set('perfil-foto', p.fotoUrl || '');
  set('perfil-sexo', p.sexo || '');
  set('perfil-amamentacao-outro', p.amamentacaoOutro || '');
  atualizarBotoesSexo(p.sexo);

  if (p.viaNascimento) {
    const r = document.querySelector(`input[name="via-nascimento"][value="${p.viaNascimento}"]`);
    if (r) r.checked = true;
  } else {
    document.querySelectorAll('input[name="via-nascimento"]').forEach(r => r.checked = false);
  }

  if (p.amamentacao) {
    const r = document.querySelector(`input[name="amamentacao"][value="${p.amamentacao}"]`);
    if (r) r.checked = true;
  } else {
    document.querySelectorAll('input[name="amamentacao"]').forEach(r => r.checked = false);
  }
  toggleAmamentacaoOutro();
  verificarPrematuridade();

  alergiasTemp = JSON.parse(JSON.stringify(p.alergias || []));
  renderizarAlergiasForm();
  abrirModal('modal-perfil');
}

function atualizarBotoesSexo(sexo) {
  const bm = document.getElementById('btn-menino');
  const bf = document.getElementById('btn-menina');
  if (bm) bm.className = 'gender-btn' + (sexo === 'menino' ? ' selected-menino' : '');
  if (bf) bf.className = 'gender-btn' + (sexo === 'menina' ? ' selected-menina' : '');
}

function selecionarSexo(sexo) {
  set('perfil-sexo', sexo);
  atualizarBotoesSexo(sexo);
  aplicarTema(sexo);
}

function toggleAmamentacaoOutro() {
  const sel = document.querySelector('input[name="amamentacao"]:checked');
  const c = document.getElementById('campo-amamentacao-outro');
  if (c) c.style.display = (sel && sel.value === 'outro') ? 'block' : 'none';
}

function verificarPrematuridade() {
  const sem = parseInt(document.getElementById('perfil-semanas')?.value);
  const av  = document.getElementById('aviso-prematuro');
  if (av) av.style.display = (!isNaN(sem) && sem < 37) ? 'block' : 'none';
}

function renderizarAlergiasForm() {
  const c = document.getElementById('lista-alergias-form');
  if (!c) return;
  c.innerHTML = alergiasTemp.length === 0
    ? '<p style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">Nenhuma alergia cadastrada.</p>'
    : alergiasTemp.map((a, i) => `
      <div class="allergy-form-item">
        <button type="button" class="remove-btn" onclick="removerAlergia(${i})">&times;</button>
        <div class="form-row" style="margin-bottom:8px;">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Tipo</label>
            <select class="form-select" style="font-size:13px;" onchange="atualizarAlergia(${i},'tipo',this.value)">
              ${Object.entries(TIPOS_ALERGIA).map(([v,l]) => `<option value="${v}" ${a.tipo===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Severidade</label>
            <select class="form-select" style="font-size:13px;" onchange="atualizarAlergia(${i},'severidade',this.value)">
              <option value="">Não informada</option>
              ${Object.entries(SEVERIDADES).map(([v,l]) => `<option value="${v}" ${a.severidade===v?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Descrição</label>
          <input class="form-input" style="font-size:13px;" type="text" value="${esc(a.descricao||'')}" placeholder="Ex: Amendoim, Amoxicilina..." oninput="atualizarAlergia(${i},'descricao',this.value)" />
        </div>
      </div>`).join('');
}

function adicionarAlergia() {
  alergiasTemp.push({ id: gerarId(), tipo: 'alimentar', descricao: '', severidade: '' });
  renderizarAlergiasForm();
}
function removerAlergia(i)           { alergiasTemp.splice(i, 1); renderizarAlergiasForm(); }
function atualizarAlergia(i, k, v)   { if (alergiasTemp[i]) alergiasTemp[i][k] = v; }

async function salvarPerfil(event) {
  event.preventDefault();
  const nome  = document.getElementById('perfil-nome').value.trim();
  const nasc  = document.getElementById('perfil-nascimento').value;
  if (!nome) { mostrarToast('Digite o nome completo.', 'error'); return; }
  if (!nasc) { mostrarToast('Selecione a data de nascimento.', 'error'); return; }
  const rVia  = document.querySelector('input[name="via-nascimento"]:checked');
  const rAmam = document.querySelector('input[name="amamentacao"]:checked');
  const perfil = {
    nomeCompleto:     nome,
    dataNascimento:   nasc,
    sexo:             document.getElementById('perfil-sexo').value || null,
    viaNascimento:    rVia  ? rVia.value  : null,
    semanasGestacao:  document.getElementById('perfil-semanas').value || null,
    localNascimento:  document.getElementById('perfil-local-nasc').value || null,
    tipoBebe:         document.getElementById('perfil-tipo-bebe').value || null,
    tipoMae:          document.getElementById('perfil-tipo-mae').value || null,
    amamentacao:      rAmam ? rAmam.value : null,
    amamentacaoOutro: document.getElementById('perfil-amamentacao-outro').value.trim() || null,
    peso:             document.getElementById('perfil-peso').value || null,
    altura:           document.getElementById('perfil-altura').value || null,
    fotoUrl:          document.getElementById('perfil-foto').value.trim() || null,
    alergias:         alergiasTemp.filter(a => a.descricao.trim()),
  };
  try {
    await gravarPerfil(perfil);
    temPerfil = true;
    atualizarNavSemPerfil();
    atualizarNomeBebe(perfil.nomeCompleto);
    aplicarTema(perfil.sexo);
    fecharModal('modal-perfil');
    renderizarHome();
    mostrarToast('Perfil salvo!', 'success');
  } catch (e) {
    console.error('Erro ao salvar perfil:', e);
    mostrarToast('Erro ao salvar. Tente novamente.', 'error');
  }
}


/* ================================================
   7. LINHA DO TEMPO ILUSTRADA
   ================================================ */

async function renderizarTimeline() {
  const container = document.getElementById('view-timeline');
  if (_observerTimeline) { _observerTimeline.disconnect(); _observerTimeline = null; }

  const todos  = eventosCache;
  const perfil = await carregarPerfil();

  let lista = filtroAtivo === 'todos' ? todos : todos.filter(e => e.categoria === filtroAtivo);
  if (buscaAtiva.trim()) {
    const b = buscaAtiva.toLowerCase();
    lista = lista.filter(e =>
      e.titulo.toLowerCase().includes(b) ||
      (e.medico||'').toLowerCase().includes(b) ||
      (e.hospital||'').toLowerCase().includes(b) ||
      (e.observacoes||'').toLowerCase().includes(b));
  }

  const filtros = [
    { valor:'todos', label:`Todos (${todos.length}${!eventosEsgotado?'+':''})` },
    ...Object.entries(CATEGORIAS)
      .filter(([v]) => todos.some(e => e.categoria === v))
      .map(([v,c]) => ({ valor:v, label:`${c.icone} ${c.label} (${todos.filter(e=>e.categoria===v).length})` }))
  ];

  const itensHTML = lista.map((evento, idx) => {
    const cat  = CATEGORIAS[evento.categoria] || CATEGORIAS.outro;
    const lado = idx % 2 === 0 ? 'tl-esquerda' : 'tl-direita';
    const dataFmt = formatarDataCurta(evento.data);
    const meta    = [evento.medico, evento.hospital].filter(Boolean).join(' · ');
    const cartao  = `
      <div class="tl-card" onclick="abrirDetalheEvento('${evento.id}')">
        <span class="tl-card-category badge-${evento.categoria}">${cat.label}</span>
        <div class="tl-card-title">${esc(evento.titulo)}</div>
        ${meta ? `<div class="tl-card-meta">${esc(meta)}</div>` : ''}
      </div>`;
    const dataBolha = `
      <div class="tl-date-bubble tl-bubble-${evento.categoria}" onclick="abrirDetalheEvento('${evento.id}')">
        ${dataFmt}
      </div>`;
    return `
      <div class="tl-item ${lado}">
        <div class="tl-content">${cartao}</div>
        <div class="tl-center">
          <div class="tl-dot tl-dot-${evento.categoria}" onclick="abrirDetalheEvento('${evento.id}')" title="${esc(evento.titulo)}">
            ${cat.icone}
          </div>
        </div>
        <div class="tl-date-side">${dataBolha}</div>
      </div>`;
  }).join('');

  const nascLabel = perfil?.dataNascimento
    ? (perfil.sexo === 'menino' ? 'Nascido em' : perfil.sexo === 'menina' ? 'Nascida em' : 'Nascido(a) em')
    : null;
  const nascFmt = nascLabel
    ? (() => { const [a,m,d] = perfil.dataNascimento.split('-'); return `${d}/${m}/${a}`; })()
    : null;

  const filtroDataAtivo = filtroDataInicio || filtroDataFim;
  const fmtD = s => s ? s.split('-').reverse().join('/') : '';

  container.innerHTML = `
    <div>
      <div class="tl-header" style="margin-bottom:${nascFmt ? '4px' : '12px'};">
        <h1 class="page-title">Histórico de Saúde</h1>
        <button class="btn-secondary btn-sm" onclick="abrirFormEvento(null)">+ Novo</button>
      </div>
      ${nascFmt ? `<div class="historico-nascimento" onclick="showView('home')" title="Ver perfil">${nascLabel} ${nascFmt}</div>` : ''}

      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="search" placeholder="Buscar evento, médico, hospital..." value="${esc(buscaAtiva)}" oninput="buscarEventos(this.value)" />
      </div>

      <div class="filtro-datas">
        <input class="filtro-data-input" type="date" title="Data início" value="${filtroDataInicio}"
          onchange="alterarFiltroData(this.value, filtroDataFim)" />
        <span class="filtro-datas-sep">→</span>
        <input class="filtro-data-input" type="date" title="Data fim" value="${filtroDataFim}"
          onchange="alterarFiltroData(filtroDataInicio, this.value)" />
        ${filtroDataAtivo ? `<button class="filtro-datas-limpar" onclick="limparFiltroData()" title="Limpar filtro de datas">×</button>` : ''}
      </div>

      <div class="timeline-filters">
        ${filtros.map(f => `<button class="filter-btn ${filtroAtivo===f.valor?'active':''}" onclick="filtrarPorCategoria('${f.valor}')">${f.label}</button>`).join('')}
      </div>

      ${filtroDataAtivo ? `<div class="paginacao-info">Período: ${fmtD(filtroDataInicio)||'início'} → ${fmtD(filtroDataFim)||'hoje'}</div>` : ''}

      ${lista.length === 0
        ? `<div class="empty-state">
            <div class="empty-icon">${filtroAtivo==='todos'&&!buscaAtiva&&!filtroDataAtivo ? IMG_URSINHOBEM : SEARCH_SVG}</div>
            <div class="empty-title">${filtroAtivo==='todos'&&!buscaAtiva&&!filtroDataAtivo?'Nenhum evento ainda':'Nenhum resultado'}</div>
            <p class="empty-text">${filtroAtivo==='todos'&&!buscaAtiva&&!filtroDataAtivo?'Adicione o primeiro evento usando o botão + abaixo.':'Tente outro filtro ou termo de busca.'}</p>
            ${filtroAtivo==='todos'&&!buscaAtiva&&!filtroDataAtivo?`<button class="btn-primary" style="max-width:220px;margin-top:8px;" onclick="abrirFormEvento(null)">+ Adicionar Evento</button>`:''}
          </div>`
        : `<div class="tl-wrapper">
            <div class="tl-axis"></div>
            ${itensHTML}
          </div>`
      }

      ${!eventosEsgotado
        ? `<div id="sentinela-timeline" class="sentinela-paginacao">
            ${eventosCarregando ? '<div class="sentinela-spinner"><div class="login-spinner"></div></div>' : ''}
           </div>`
        : (todos.length > 0 ? `<div class="paginacao-fim">Fim do histórico · ${todos.length} evento${todos.length!==1?'s':''}</div>` : '')
      }
    </div>`;

  if (!eventosEsgotado) {
    const sentinela = document.getElementById('sentinela-timeline');
    if (sentinela) {
      _observerTimeline = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !eventosCarregando && !eventosEsgotado) {
          carregarMaisEventos();
        }
      }, { rootMargin: '200px' });
      _observerTimeline.observe(sentinela);
    }
  }
}

function filtrarPorCategoria(cat) { filtroAtivo = cat; renderizarTimeline(); }
function buscarEventos(txt)        { buscaAtiva  = txt; renderizarTimeline(); }
function buscarAgenda(txt)         { buscaAgendaAtiva = txt; renderizarAgenda(); }
function limparFiltroData()        { alterarFiltroData('', ''); }


/* ================================================
   8. FORMULÁRIO DE EVENTO
   ================================================ */

async function abrirFormEvento(id) {
  medicamentosTemp = [];
  document.getElementById('form-evento').reset();
  set('evento-id', '');
  set('evento-data', new Date().toISOString().split('T')[0]);
  document.getElementById('titulo-modal-evento').textContent = id ? 'Editar Evento' : 'Novo Evento';

  // Carrega a data mínima permitida com base na data de nascimento do perfil
  const _perfil = await carregarPerfil();
  const _dataMinEl = document.getElementById('evento-data-min');
  const _dataInputEl = document.getElementById('evento-data');
  if (_perfil?.dataNascimento) {
    const nascMs  = new Date(_perfil.dataNascimento + 'T00:00:00').getTime();
    const minDate = new Date(nascMs - 315 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (_dataMinEl)   _dataMinEl.value = minDate;
    if (_dataInputEl) _dataInputEl.min = minDate;
  } else {
    if (_dataMinEl)   _dataMinEl.value = '';
    if (_dataInputEl) _dataInputEl.removeAttribute('min');
  }

  if (id) {
    const ev = await window._db.carregarEvento(acessoAtual.profileId, id);
    if (!ev) { mostrarToast('Evento não encontrado.', 'error'); return; }
    set('evento-id', ev.id);
    set('evento-titulo', ev.titulo || '');
    set('evento-categoria', ev.categoria || '');
    set('evento-data', ev.data || '');
    set('evento-descricao', ev.descricao || '');
    set('evento-tratamento', ev.tratamento || '');
    set('evento-medico', ev.medico || '');
    set('evento-hospital', ev.hospital || '');
    set('evento-custo', ev.custo || '');
    set('evento-imagem', ev.imagemUrl || '');
    set('evento-obs', ev.observacoes || '');
    medicamentosTemp = [...(ev.medicamentos || [])];
  }
  renderizarMedicamentosForm();
  abrirModal('modal-evento-form');
}

function renderizarMedicamentosForm() {
  const c = document.getElementById('lista-medicamentos-form');
  if (!c) return;
  c.innerHTML = medicamentosTemp.length === 0 ? ''
    : `<div class="chips-container">${medicamentosTemp.map((m,i) => `<span class="chip">${esc(m)}<button type="button" class="chip-remove" onclick="removerMedicamento(${i})">&times;</button></span>`).join('')}</div>`;
}

function adicionarMedicamento() {
  const inp = document.getElementById('novo-medicamento');
  const v   = inp.value.trim();
  if (!v) return;
  if (medicamentosTemp.includes(v)) { mostrarToast('Já adicionado.','error'); return; }
  medicamentosTemp.push(v);
  inp.value = '';
  renderizarMedicamentosForm();
}
function removerMedicamento(i) { medicamentosTemp.splice(i,1); renderizarMedicamentosForm(); }

async function salvarEvento(event) {
  event.preventDefault();
  const titulo    = document.getElementById('evento-titulo').value.trim();
  const categoria = document.getElementById('evento-categoria').value;
  const data      = document.getElementById('evento-data').value;
  if (!titulo)    { mostrarToast('Digite o título.', 'error'); return; }
  if (!categoria) { mostrarToast('Selecione a categoria.', 'error'); return; }
  if (!data)      { mostrarToast('Selecione a data.', 'error'); return; }

  const dataMinStr = document.getElementById('evento-data-min')?.value;
  if (dataMinStr && data < dataMinStr) {
    const [a,m,d] = dataMinStr.split('-');
    mostrarToast(`Data inválida: anterior ao início da gestação viável (antes de ${d}/${m}/${a}).`, 'error');
    return;
  }

  const idExistente = document.getElementById('evento-id').value;

  const ev = {
    id:           idExistente || gerarId(),
    titulo, categoria, data,
    descricao:    document.getElementById('evento-descricao').value.trim() || null,
    tratamento:   document.getElementById('evento-tratamento').value.trim() || null,
    medico:       document.getElementById('evento-medico').value.trim() || null,
    hospital:     document.getElementById('evento-hospital').value.trim() || null,
    medicamentos: [...medicamentosTemp],
    custo:        document.getElementById('evento-custo').value || null,
    imagemUrl:    document.getElementById('evento-imagem').value.trim() || null,
    observacoes:  document.getElementById('evento-obs').value.trim() || null,
    criadoEm:     idExistente ? null : new Date().toISOString(),
  };

  try {
    await gravarEvento(ev, !idExistente);
    fecharModal('modal-evento-form');
    atualizarVistaAtiva();
    mostrarToast(idExistente ? 'Evento atualizado!' : 'Evento adicionado!', 'success');
  } catch (e) {
    console.error('Erro ao salvar evento:', e);
    mostrarToast('Erro ao salvar. Tente novamente.', 'error');
  }
}


/* ================================================
   9. DETALHE DO EVENTO
   ================================================ */

async function abrirDetalheEvento(id) {
  const ev = await window._db.carregarEvento(acessoAtual.profileId, id);
  if (!ev) { mostrarToast('Evento não encontrado.', 'error'); return; }
  const cat = CATEGORIAS[ev.categoria] || CATEGORIAS.outro;

  document.getElementById('titulo-modal-detalhe').textContent = ev.titulo;

  const campos = [
    { label:'Descrição',        valor: ev.descricao   },
    { label:'Tratamento',       valor: ev.tratamento  },
    { label:'Médico',           valor: ev.medico      },
    { label:'Hospital / Posto', valor: ev.hospital    },
    { label:'Observações',      valor: ev.observacoes },
  ].filter(c => c.valor);

  document.getElementById('conteudo-evento-detalhe').innerHTML = `
    ${ev.imagemUrl ? `<img class="event-detail-image" src="${esc(ev.imagemUrl)}" alt="Foto" onerror="this.style.display='none'" />` : ''}
    <div class="event-detail-header" style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <span class="event-recent-icon icon-${ev.categoria}" style="width:42px;height:42px;">${cat.icone}</span>
      <div style="flex:1;min-width:0;">
        <h3 class="event-detail-title" style="margin-bottom:4px;font-size:16px;">${esc(ev.titulo)}</h3>
        <div class="event-detail-meta" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="event-category-badge badge-${ev.categoria}">${cat.label}</span>
          <span class="event-date">${formatarData(ev.data)}</span>
        </div>
      </div>
    </div>
    ${campos.map(c => `<div class="detail-section"><div class="detail-label">${c.label}</div><div class="detail-value">${esc(c.valor)}</div></div>`).join('')}
    ${ev.medicamentos?.length ? `<div class="detail-section"><div class="detail-label">Medicamentos</div><div class="chips-container" style="margin-top:6px;">${ev.medicamentos.map(m=>`<span class="chip">${esc(m)}</span>`).join('')}</div></div>` : ''}
    ${ev.custo ? `<div class="detail-section" style="background:var(--primary-light);"><div class="detail-label">Gasto</div><div class="detail-value" style="font-size:20px;font-weight:700;color:var(--primary-dark);">${formatarDinheiro(parseFloat(ev.custo))}</div></div>` : ''}
    <div class="event-detail-actions">
      <button class="btn-secondary" onclick="fecharModal('modal-evento-detalhe');abrirFormEvento('${id}')">Editar</button>
      <button class="btn-danger" onclick="confirmarExclusaoEvento('${id}')">Excluir</button>
    </div>`;

  abrirModal('modal-evento-detalhe');
}

async function confirmarExclusaoEvento(id) {
  const ok = await confirmar({ titulo: 'Excluir evento', msg: 'Esta ação não pode ser desfeita.', txtOk: 'Excluir', destrutivo: true });
  if (!ok) return;
  try {
    await excluirEvento(id);
    fecharModal('modal-evento-detalhe');
    atualizarVistaAtiva();
    mostrarToast('Evento excluído.', 'success');
  } catch (e) {
    console.error('Erro ao excluir evento:', e);
    mostrarToast('Erro ao excluir. Tente novamente.', 'error');
  }
}


/* ================================================
   10. AGENDA DE CONSULTAS
   ================================================ */

async function renderizarAgenda() {
  await renderizarAgendaLista();
}

async function renderizarAgendaLista() {
  const container = document.getElementById('view-agenda');
  if (_observerAgenda) { _observerAgenda.disconnect(); _observerAgenda = null; }

  const consultas = consultasCache;
  const hoje      = new Date(); hoje.setHours(0,0,0,0);

  let proximas = consultas.filter(c => c.status !== 'cancelada' && new Date(c.data + 'T00:00:00') >= hoje).sort((a,b)=>new Date(a.data)-new Date(b.data));
  let passadas = consultas.filter(c => c.status === 'cancelada' || new Date(c.data + 'T00:00:00') < hoje).sort((a,b)=>new Date(b.data)-new Date(a.data));

  if (buscaAgendaAtiva.trim()) {
    const b = buscaAgendaAtiva.toLowerCase();
    const filtrar = lista => lista.filter(c =>
      (c.medico||'').toLowerCase().includes(b) ||
      (c.local||'').toLowerCase().includes(b) ||
      (TIPOS_CONSULTA[c.tipo]||c.tipo||'').toLowerCase().includes(b) ||
      (c.observacoes||'').toLowerCase().includes(b));
    proximas = filtrar(proximas);
    passadas = filtrar(passadas);
  }

  const filtroDataAtivo = filtroDataInicio || filtroDataFim;
  const fmtD = s => s ? s.split('-').reverse().join('/') : '';
  const semFiltros = !buscaAgendaAtiva && !filtroDataAtivo;

  container.innerHTML = `
    <div>
      <div class="tl-header" style="margin-bottom:12px;">
        <h1 class="page-title">Agenda de Consultas</h1>
        <button class="btn-secondary btn-sm" onclick="abrirFormConsulta(null)">+ Nova</button>
      </div>

      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="search" placeholder="Buscar médico, local, tipo..." value="${esc(buscaAgendaAtiva)}" oninput="buscarAgenda(this.value)" />
      </div>

      <div class="filtro-datas">
        <input class="filtro-data-input" type="date" title="Data início" value="${filtroDataInicio}"
          onchange="alterarFiltroData(this.value, filtroDataFim)" />
        <span class="filtro-datas-sep">→</span>
        <input class="filtro-data-input" type="date" title="Data fim" value="${filtroDataFim}"
          onchange="alterarFiltroData(filtroDataInicio, this.value)" />
        ${filtroDataAtivo ? `<button class="filtro-datas-limpar" onclick="limparFiltroData()" title="Limpar filtro de datas">×</button>` : ''}
      </div>

      ${filtroDataAtivo ? `<div class="paginacao-info">Período: ${fmtD(filtroDataInicio)||'início'} → ${fmtD(filtroDataFim)||'hoje'}</div>` : ''}

      <div class="agenda-secao">
        <div class="agenda-secao-titulo">Próximas (${proximas.length}${!consultasEsgotado&&!filtroDataAtivo?'+':''})</div>
        ${proximas.length === 0
          ? `<div class="empty-state" style="padding:24px;">
              <div class="empty-icon">${semFiltros ? IMG_AGENDA : SEARCH_SVG}</div>
              <div class="empty-title">${semFiltros ? 'Nenhuma consulta agendada' : 'Nenhum resultado'}</div>
              <p class="empty-text">${semFiltros ? 'Adicione a próxima consulta do bebê.' : 'Tente outro filtro ou termo de busca.'}</p>
              ${semFiltros ? `<button class="btn-primary" style="max-width:220px;margin-top:8px;" onclick="abrirFormConsulta(null)">+ Agendar Consulta</button>` : ''}
            </div>`
          : proximas.map((c, idx) => renderizarCardConsulta(c, idx === 0)).join('')
        }
      </div>

      ${passadas.length ? `
      <div class="agenda-secao">
        <div class="agenda-secao-titulo">Histórico (${passadas.length})</div>
        ${passadas.map(c => renderizarCardConsulta(c, false)).join('')}
      </div>` : ''}

      ${!consultasEsgotado
        ? `<div id="sentinela-agenda" class="sentinela-paginacao">
            ${consultasCarregando ? '<div class="sentinela-spinner"><div class="login-spinner"></div></div>' : ''}
           </div>`
        : (consultas.length > 0 ? `<div class="paginacao-fim">Fim da agenda · ${consultas.length} consulta${consultas.length!==1?'s':''}</div>` : '')
      }
    </div>`;

  if (!consultasEsgotado) {
    const sentinela = document.getElementById('sentinela-agenda');
    if (sentinela) {
      _observerAgenda = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !consultasCarregando && !consultasEsgotado) {
          carregarMaisConsultas();
        }
      }, { rootMargin: '200px' });
      _observerAgenda.observe(sentinela);
    }
  }
}

let seletorMesAberto = false;

async function renderizarAbaCalendario() {
  // Redireciona para a view correta e chama o calendário
  const container = document.getElementById('view-calendario');
  container.innerHTML = `<div class="carregando-view"><div class="login-spinner"></div></div>`;
  await renderizarCalendarioNaView(container);
}

function toggleSeletorMes() {
  seletorMesAberto = !seletorMesAberto;
  // Re-renderiza apenas o calendário na view ativa
  const container = document.getElementById('view-calendario');
  if (container?.classList.contains('active')) renderizarAbaCalendario();
  else renderizarAgendaCalendario();
}

function selecionarMesAno(mes, ano) {
  mesCalendarioAtivo = { ano, mes };
  diaCalendarioAberto = null;
  seletorMesAberto = false;
  const container = document.getElementById('view-calendario');
  if (container?.classList.contains('active')) renderizarAbaCalendario();
  else renderizarAgendaCalendario();
}

function _renderizarSeletorMes() {
  const { ano } = mesCalendarioAtivo;
  const mesesAbr = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `
    <div class="cal-seletor-mes" onclick="event.stopPropagation()">
      <div class="cal-seletor-ano">
        <button class="cal-nav-btn" onclick="selecionarMesAno(mesCalendarioAtivo.mes, ${ano-1})">&#8592;</button>
        <span class="cal-seletor-ano-num">${ano}</span>
        <button class="cal-nav-btn" onclick="selecionarMesAno(mesCalendarioAtivo.mes, ${ano+1})">&#8594;</button>
      </div>
      <div class="cal-seletor-grid">
        ${mesesAbr.map((m, i) => `
          <button class="cal-seletor-mes-btn ${i === mesCalendarioAtivo.mes && ano === mesCalendarioAtivo.ano ? 'ativo' : ''}"
                  onclick="selecionarMesAno(${i}, ${ano})">${m}</button>
        `).join('')}
      </div>
    </div>`;
}

async function _buildCalendarioHTML(container) {
  const { ano, mes } = mesCalendarioAtivo;
  const [todosEventos, todasConsultas] = await Promise.all([carregarEventos(), carregarConsultas()]);

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes   = new Date(ano, mes + 1, 0).getDate();
  const hoje        = new Date();
  const hojeStr     = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;

  const eventosPorDia   = {};
  const consultasPorDia = {};
  todosEventos.forEach(e => {
    if (!eventosPorDia[e.data]) eventosPorDia[e.data] = [];
    eventosPorDia[e.data].push(e);
  });
  todasConsultas.filter(c => c.status !== 'cancelada').forEach(c => {
    if (!consultasPorDia[c.data]) consultasPorDia[c.data] = [];
    consultasPorDia[c.data].push(c);
  });

  const nomeMes    = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][mes];
  const diasSemana = ['D','S','T','Q','Q','S','S'];

  let celulas = '';
  for (let i = 0; i < primeiroDia; i++) celulas += `<div class="cal-dia cal-dia-vazio"></div>`;
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dStr  = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    const temC  = !!consultasPorDia[dStr];
    const temE  = !!eventosPorDia[dStr];
    const isHoje = dStr === hojeStr;
    const aberto = diaCalendarioAberto === dia;
    celulas += `
      <div class="cal-dia ${isHoje?'cal-dia-hoje':''} ${temC||temE?'cal-dia-com-itens':''} ${aberto?'cal-dia-aberto':''}"
           onclick="abrirDiaCalendario(${dia})">
        <span class="cal-dia-num">${dia}</span>
        <div class="cal-marcadores">
          ${temC ? '<span class="cal-marcador cal-marcador-consulta"></span>' : ''}
          ${temE ? '<span class="cal-marcador cal-marcador-evento"></span>'   : ''}
        </div>
      </div>`;
  }

  let itensDiaHTML = '';
  if (diaCalendarioAberto) {
    const dStr = `${ano}-${String(mes+1).padStart(2,'0')}-${String(diaCalendarioAberto).padStart(2,'0')}`;
    const cs   = consultasPorDia[dStr] || [];
    const es   = eventosPorDia[dStr]   || [];
    if (cs.length || es.length) {
      itensDiaHTML = `
        <div class="cal-itens-dia">
          ${cs.map(c => {
            const tipo = TIPOS_CONSULTA[c.tipo] || c.tipo;
            return `<div class="cal-item-card cal-item-consulta" onclick="abrirDetalheConsulta('${c.id}')">
              <span class="cal-item-badge">Consulta</span>
              <span class="cal-item-titulo">${esc(c.medico || tipo)}</span>
              ${c.hora ? `<span class="cal-item-hora">${c.hora}</span>` : ''}
            </div>`;
          }).join('')}
          ${es.map(e => {
            const cat = CATEGORIAS[e.categoria] || CATEGORIAS.outro;
            return `<div class="cal-item-card cal-item-evento" onclick="abrirDetalheEvento('${e.id}')">
              <span class="cal-item-badge">${cat.label}</span>
              <span class="cal-item-titulo">${esc(e.titulo)}</span>
            </div>`;
          }).join('')}
        </div>`;
    }
  }

  const temItensNoMes = Object.keys({...eventosPorDia, ...consultasPorDia})
    .some(d => d.startsWith(`${ano}-${String(mes+1).padStart(2,'0')}`));

  return `
    <div>
      <div class="tl-header" style="margin-bottom:8px;">
        <h1 class="page-title">Calendário</h1>
        <button class="btn-exportar" onclick="exportarTodasConsultas()" title="Exportar consultas (.ics)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar
        </button>
      </div>

      <div class="cal-header">
        <button class="cal-nav-btn" onclick="navegarMesCalendario(-1)">&#8592;</button>
        <button class="cal-mes-titulo-btn" onclick="toggleSeletorMes()" title="Selecionar mês/ano">
          ${nomeMes} ${ano}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.5;margin-left:3px"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button class="cal-nav-btn" onclick="navegarMesCalendario(1)">&#8594;</button>
      </div>

      ${seletorMesAberto ? _renderizarSeletorMes() : ''}

      <div class="cal-grid">
        ${diasSemana.map(d => `<div class="cal-dia-semana">${d}</div>`).join('')}
        ${celulas}
      </div>

      ${itensDiaHTML}

      ${!temItensNoMes && !diaCalendarioAberto
        ? `<p style="text-align:center;font-size:13px;color:var(--text-muted);padding:16px 0;">Nenhum evento ou consulta neste mês.</p>`
        : ''}
    </div>`;
}

async function renderizarCalendarioNaView(container) {
  container.innerHTML = await _buildCalendarioHTML(container);
}

function abrirDiaCalendario(dia) {
  diaCalendarioAberto = diaCalendarioAberto === dia ? null : dia;
  renderizarAbaCalendario();
}

function navegarMesCalendario(delta) {
  diaCalendarioAberto = null;
  seletorMesAberto = false;
  let { ano, mes } = mesCalendarioAtivo;
  mes += delta;
  if (mes < 0)  { mes = 11; ano--; }
  if (mes > 11) { mes = 0;  ano++; }
  mesCalendarioAtivo = { ano, mes };
  renderizarAbaCalendario();
}

function renderizarCardConsulta(c, destaque) {
  const [ano, mes, dia] = c.data.split('-');
  const mesAbr = MESES[parseInt(mes)-1];
  const hoje   = new Date(); hoje.setHours(0,0,0,0);
  const dataC  = new Date(c.data + 'T00:00:00');
  const diasDiff = Math.round((dataC - hoje) / (1000*60*60*24));
  const futuro   = diasDiff >= 0;

  let diasFaltamHTML = '';
  if (futuro && c.status !== 'cancelada') {
    diasFaltamHTML = diasDiff === 0 ? '<span class="dias-faltam">Hoje!</span>'
      : diasDiff === 1              ? '<span class="dias-faltam">Amanhã</span>'
      : `<span class="dias-faltam">em ${diasDiff} dias</span>`;
  }

  const statusBadgeClass = { agendada:'badge-agendada', realizada:'badge-realizada', cancelada:'badge-cancelada' }[c.status] || 'badge-agendada';
  const statusLabel      = { agendada:'Agendada', realizada:'Realizada', cancelada:'Cancelada' }[c.status] || c.status;
  const tipoClass        = `tipo-${c.tipo}`;
  const tipoLabel        = TIPOS_CONSULTA[c.tipo] || c.tipo;

  const meta = [c.medico, c.local].filter(Boolean).join(' · ');

  return `
    <div class="consulta-card ${c.status==='realizada'?'status-realizada':''} ${c.status==='cancelada'?'status-cancelada':''} ${destaque?'consulta-prox':''}"
         onclick="abrirDetalheConsulta('${c.id}')">
      <div class="consulta-data-bloco">
        <div class="consulta-dia">${dia}</div>
        <div class="consulta-mes">${mesAbr}</div>
        <div class="consulta-ano">${ano}</div>
      </div>
      <div class="consulta-info">
        <span class="tipo-badge ${tipoClass}">${tipoLabel}</span>
        <div class="consulta-tipo">${c.medico ? esc(c.medico) : tipoLabel}</div>
        ${meta ? `<div class="consulta-meta">${esc(meta)}</div>` : ''}
        ${c.hora ? `<div class="consulta-hora">${CLOCK_SVG} ${c.hora}</div>` : ''}
        ${diasFaltamHTML}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
        <span class="consulta-status-badge ${statusBadgeClass}">${statusLabel}</span>
      </div>
    </div>`;
}

/* Abre o detalhe de uma consulta */
async function abrirDetalheConsulta(id) {
  const c = await window._db.carregarConsulta(acessoAtual.profileId, id);
  if (!c) { mostrarToast('Consulta não encontrada.', 'error'); return; }

  const opcoes = [
    { label:'Editar',    acao: () => { fecharMenuAdicionar(); abrirFormConsulta(id); } },
    { label:'Marcar como Realizada', acao: () => atualizarStatusConsulta(id,'realizada'), ocultar: c.status==='realizada' },
    { label:'Cancelar Consulta',     acao: () => atualizarStatusConsulta(id,'cancelada'), ocultar: c.status==='cancelada' },
    { label:'Excluir',  acao: () => confirmarExclusaoConsulta(id), estilo:'color:#dc3545' },
  ].filter(o => !o.ocultar);

  const [ano, mes, dia] = c.data.split('-');
  const mesNome = MESES[parseInt(mes)-1];
  const tipoLabel = TIPOS_CONSULTA[c.tipo] || c.tipo;

  // Usa um modal reutilizável inline
  const html = `
    <div style="padding:16px 0 0;">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="color:var(--primary);display:flex;justify-content:center;margin-bottom:12px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
        <div style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:4px;">${tipoLabel}</div>
        <div style="font-size:15px;color:var(--primary);font-weight:600;">${dia} de ${mesNome} de ${ano}${c.hora ? ` às ${c.hora}` : ''}</div>
      </div>
      ${c.medico   ? `<div class="detail-section"><div class="detail-label">Médico</div><div class="detail-value">${esc(c.medico)}</div></div>` : ''}
      ${c.local    ? `<div class="detail-section"><div class="detail-label">Local / Clínica</div><div class="detail-value">${esc(c.local)}</div></div>` : ''}
      ${c.observacoes ? `<div class="detail-section"><div class="detail-label">Observações</div><div class="detail-value">${esc(c.observacoes)}</div></div>` : ''}
      <div class="detail-section">
        <div class="detail-label">Status</div>
        <div class="detail-value" style="font-weight:600;">${{ agendada:'Agendada', realizada:'Realizada', cancelada:'Cancelada' }[c.status]||c.status}</div>
      </div>
      ${c.status !== 'cancelada' ? `
      <div style="display:flex;gap:8px;padding-top:12px;flex-wrap:wrap;">
        <button class="btn-exportar-detalhe" id="btn-ics-detalhe">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar .ics
        </button>
        <a class="btn-exportar-detalhe" href="${linkGoogleCalendar(c)}" target="_blank" rel="noopener">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Google Agenda
        </a>
      </div>` : ''}
      <div style="display:flex;flex-direction:column;gap:8px;padding-top:12px;border-top:1px solid var(--border);">
        ${opcoes.map(o => `<button class="btn-ghost" style="${o.estilo||''};" onclick="${o.acao.toString().replace(/"/g,"'")}">${o.label}</button>`).join('')}
        <button class="btn-ghost" onclick="fecharModal('modal-evento-detalhe')">Fechar</button>
      </div>
    </div>`;

  // Reutiliza o modal de detalhe de evento
  document.getElementById('titulo-modal-detalhe').textContent = 'Consulta Agendada';
  document.getElementById('conteudo-evento-detalhe').innerHTML = html;

  // Botão .ics individual
  const btnIcs = document.getElementById('btn-ics-detalhe');
  if (btnIcs) btnIcs.onclick = () => exportarConsultaICS(c);

  // Vincula as ações diretamente (já que inline onclick não funciona bem com funções complexas)
  const btns = document.querySelectorAll('#conteudo-evento-detalhe .btn-ghost');
  btns.forEach((btn, i) => {
    if (opcoes[i]) btn.onclick = opcoes[i].acao;
  });
  // Último botão: fechar
  const lastBtn = document.querySelector('#conteudo-evento-detalhe .btn-ghost:last-child');
  if (lastBtn) lastBtn.onclick = () => fecharModal('modal-evento-detalhe');

  abrirModal('modal-evento-detalhe');
}

async function atualizarStatusConsulta(id, status) {
  try {
    const c = await window._db.carregarConsulta(acessoAtual.profileId, id);
    if (!c) { mostrarToast('Consulta não encontrada.', 'error'); return; }
    await gravarConsulta({ ...c, status });
    fecharModal('modal-evento-detalhe');
    renderizarAgenda();
    mostrarToast(`Consulta marcada como ${status}.`, 'success');
  } catch (e) {
    console.error('Erro ao atualizar status:', e);
    mostrarToast('Erro ao atualizar. Tente novamente.', 'error');
  }
}

async function confirmarExclusaoConsulta(id) {
  const ok = await confirmar({ titulo: 'Excluir consulta', msg: 'Esta ação não pode ser desfeita.', txtOk: 'Excluir', destrutivo: true });
  if (!ok) return;
  try {
    await excluirConsulta(id);
    fecharModal('modal-evento-detalhe');
    renderizarAgenda();
    mostrarToast('Consulta excluída.', 'success');
  } catch (e) {
    console.error('Erro ao excluir consulta:', e);
    mostrarToast('Erro ao excluir. Tente novamente.', 'error');
  }
}


/* ================================================
   11. EXPORTAÇÃO DE CALENDÁRIO (.ics)
   ================================================ */

function _icsEscape(s) {
  return (s || '').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
}

function gerarICS(consultas) {
  const uid = () => Math.random().toString(36).substr(2,9) + '@linhatempobebeapp';
  const linhas = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Linha do Tempo do Bebê//PT','CALSCALE:GREGORIAN'];
  consultas.filter(c => c.status !== 'cancelada').forEach(c => {
    const tipo    = TIPOS_CONSULTA[c.tipo] || c.tipo || '';
    const resumo  = _icsEscape([tipo, c.medico].filter(Boolean).join(' - '));
    const local   = _icsEscape(c.local || '');
    const descr   = _icsEscape(c.observacoes || '');
    const dataStr = (c.data || '').replace(/-/g,'');
    linhas.push('BEGIN:VEVENT');
    linhas.push(`UID:${uid()}`);
    if (c.hora) {
      const horaStr = c.hora.replace(':','') + '00';
      linhas.push(`DTSTART:${dataStr}T${horaStr}`);
      linhas.push(`DTEND:${dataStr}T${horaStr}`);
    } else {
      linhas.push(`DTSTART;VALUE=DATE:${dataStr}`);
      linhas.push(`DTEND;VALUE=DATE:${dataStr}`);
    }
    linhas.push(`SUMMARY:${resumo}`);
    if (local)  linhas.push(`LOCATION:${local}`);
    if (descr)  linhas.push(`DESCRIPTION:${descr}`);
    linhas.push('END:VEVENT');
  });
  linhas.push('END:VCALENDAR');
  return linhas.join('\r\n');
}

function baixarArquivo(nome, conteudo, tipo) {
  const blob = new Blob([conteudo], { type: tipo });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], nome, { type: tipo })] })) {
    navigator.share({ files: [new File([blob], nome, { type: tipo })] }).catch(() => _baixarViaLink(blob, nome));
  } else {
    _baixarViaLink(blob, nome);
  }
}

function _baixarViaLink(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function linkGoogleCalendar(consulta) {
  const tipo  = TIPOS_CONSULTA[consulta.tipo] || consulta.tipo || '';
  const texto = [tipo, consulta.medico].filter(Boolean).join(' - ');
  const data  = (consulta.data || '').replace(/-/g,'');
  let dates   = data + '/' + data;
  if (consulta.hora) {
    const h = consulta.hora.replace(':','') + '00';
    dates   = `${data}T${h}/${data}T${h}`;
  }
  const p = new URLSearchParams({ action:'TEMPLATE', text:texto, dates, location:consulta.local||'', details:consulta.observacoes||'' });
  return `https://calendar.google.com/calendar/render?${p}`;
}

async function exportarTodasConsultas() {
  const todas = await carregarConsultas();
  const validas = todas.filter(c => c.status !== 'cancelada');
  if (!validas.length) { mostrarToast('Nenhuma consulta para exportar.', 'error'); return; }
  const ics = gerarICS(validas);
  baixarArquivo('agenda-consultas.ics', ics, 'text/calendar');
}

function exportarConsultaICS(consulta) {
  const ics = gerarICS([consulta]);
  const tipo = TIPOS_CONSULTA[consulta.tipo] || 'consulta';
  baixarArquivo(`${tipo.toLowerCase().replace(/\s+/g,'-')}.ics`, ics, 'text/calendar');
}

/* ================================================
   12. FORMULÁRIO DE CONSULTA
   ================================================ */

async function abrirFormConsulta(id) {
  document.getElementById('form-consulta').reset();
  set('consulta-id', '');
  set('consulta-data', new Date().toISOString().split('T')[0]);
  document.getElementById('titulo-modal-consulta').textContent = id ? 'Editar Consulta' : 'Nova Consulta';

  const rPad = document.querySelector('input[name="consulta-status"][value="agendada"]');
  if (rPad) rPad.checked = true;

  if (id) {
    const c = await window._db.carregarConsulta(acessoAtual.profileId, id);
    if (!c) { mostrarToast('Consulta não encontrada.', 'error'); return; }
    set('consulta-id', c.id);
    set('consulta-tipo', c.tipo || '');
    set('consulta-data', c.data || '');
    set('consulta-hora', c.hora || '');
    set('consulta-medico', c.medico || '');
    set('consulta-local', c.local || '');
    set('consulta-obs', c.observacoes || '');
    const r = document.querySelector(`input[name="consulta-status"][value="${c.status}"]`);
    if (r) r.checked = true;
  }

  fecharModal('modal-evento-detalhe');
  abrirModal('modal-consulta-form');
}

async function salvarConsulta(event) {
  event.preventDefault();
  const tipo = document.getElementById('consulta-tipo').value;
  const data = document.getElementById('consulta-data').value;
  if (!tipo) { mostrarToast('Selecione o tipo de consulta.', 'error'); return; }
  if (!data) { mostrarToast('Selecione a data.', 'error'); return; }

  const idEx = document.getElementById('consulta-id').value;
  const rSt  = document.querySelector('input[name="consulta-status"]:checked');

  const consulta = {
    id:          idEx || gerarId(),
    tipo, data,
    hora:        document.getElementById('consulta-hora').value || null,
    medico:      document.getElementById('consulta-medico').value.trim() || null,
    local:       document.getElementById('consulta-local').value.trim() || null,
    observacoes: document.getElementById('consulta-obs').value.trim() || null,
    status:      rSt ? rSt.value : 'agendada',
    criadoEm:    idEx ? null : new Date().toISOString(),
  };

  try {
    await gravarConsulta(consulta, !idEx);
    fecharModal('modal-consulta-form');
    renderizarAgenda();
    mostrarToast(idEx ? 'Consulta atualizada!' : 'Consulta adicionada!', 'success');
  } catch (e) {
    console.error('Erro ao salvar consulta:', e);
    mostrarToast('Erro ao salvar. Tente novamente.', 'error');
  }
}


/* ================================================
   12. UTILITÁRIOS
   ================================================ */

function esc(txt) {
  if (!txt) return '';
  return String(txt).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function primeiraLetra(nome) { return (nome||'?').charAt(0).toUpperCase(); }
function set(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

function formatarData(iso) {
  if (!iso) return '–';
  const [a,m,d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

function formatarDataCurta(iso) {
  if (!iso) return '–';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}<br><span style="font-size:10px">${MESES[parseInt(mes)-1]} ${ano}</span>`;
}

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return '';
  const [a,m,d] = dataNascimento.split('-').map(Number);
  const nasc = new Date(a, m-1, d);
  const hoje = new Date();
  let anos  = hoje.getFullYear() - nasc.getFullYear();
  let meses = hoje.getMonth() - nasc.getMonth();
  let dias  = hoje.getDate() - nasc.getDate();
  if (dias  < 0) meses--;
  if (meses < 0) { anos--; meses += 12; }
  const totalDias = Math.floor((hoje - nasc) / (1000*60*60*24));
  if (totalDias < 30) return `${totalDias} dia${totalDias!==1?'s':''}`;
  if (anos === 0)     return `${meses} mes${meses!==1?'es':''}`;
  if (anos < 2) {
    const p = [`${anos} ano${anos!==1?'s':''}`];
    if (meses > 0) p.push(`${meses} mes${meses!==1?'es':''}`);
    return p.join(' e ');
  }
  return `${anos} anos`;
}

function formatarDinheiro(v) {
  if (v==null||isNaN(v)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
}

function mostrarToast(msg, tipo='') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${tipo}`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

function atualizarVistaAtiva() {
  const v = document.querySelector('.view.active');
  if (!v) return;
  if (v.id === 'view-timeline')   resetarERecarregarEventos();
  else if (v.id === 'view-agenda') resetarERecarregarConsultas();
  else if (v.id === 'view-calendario') renderizarAbaCalendario();
  else renderizarHome();
}


/* ================================================
   13. SELETOR E CRIAÇÃO DE BEBÊS
   ================================================ */

async function abrirSeletorBebe() {
  const modal   = document.getElementById('modal-seletor-bebe');
  const lista   = document.getElementById('seletor-lista');
  if (!modal || !lista) return;

  lista.innerHTML = `<div class="carregando-view"><div class="login-spinner"></div></div>`;
  abrirModal('modal-seletor-bebe');

  const resumos = await window._db.carregarResumosPerfis(profileIds);

  lista.innerHTML = resumos.map(r => {
    const ativo    = r.profileId === profileIdAtivo;
    const primeiro = r.nomeCompleto ? r.nomeCompleto.trim().split(/\s+/)[0] : 'Sem nome';
    return `
      <button class="seletor-bebe-item ${ativo ? 'ativo' : ''}" onclick="selecionarPerfil('${r.profileId}')">
        <div class="seletor-bebe-avatar">${primeiro.charAt(0).toUpperCase()}</div>
        <div class="seletor-bebe-info">
          <div class="seletor-bebe-nome">${esc(r.nomeCompleto || 'Sem nome')}${ativo ? ' <span class="seletor-badge-ativo">ativo</span>' : ''}</div>
          <div class="seletor-bebe-meta">${r.eventCount} evento${r.eventCount !== 1 ? 's' : ''} · ${r.consultationCount} consulta${r.consultationCount !== 1 ? 's' : ''}</div>
        </div>
      </button>`;
  }).join('') + `
    <button class="seletor-bebe-novo" onclick="fecharModal('modal-seletor-bebe');abrirFormNovoBebe()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Novo bebê
    </button>`;
}

async function selecionarPerfil(novoProfileId) {
  if (novoProfileId === profileIdAtivo) { fecharModal('modal-seletor-bebe'); return; }
  profileIdAtivo = novoProfileId;
  fecharModal('modal-seletor-bebe');
  temPerfil      = false;
  showView('home');
}

function abrirFormNovoBebe() {
  document.getElementById('novo-bebe-nome').value = '';
  document.getElementById('novo-bebe-nasc').value = '';
  abrirModal('modal-novo-bebe');
}

async function salvarNovoBebe(event) {
  event.preventDefault();
  const nome = document.getElementById('novo-bebe-nome').value.trim();
  const nasc = document.getElementById('novo-bebe-nasc').value;
  if (!nome) { mostrarToast('Digite o nome do bebê.', 'error'); return; }
  if (!nasc) { mostrarToast('Selecione a data de nascimento.', 'error'); return; }

  const novoId = 'profile-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  try {
    await window._db.criarNovoPerfil(usuarioAtual.email, novoId, usuarioAtual.uid);
    // Salva os dados básicos no perfil recém-criado
    await window._db.gravarPerfil(novoId, { nomeCompleto: nome, dataNascimento: nasc }, usuarioAtual.uid);

    profileIds.push(novoId);
    profileIdAtivo = novoId;
    temPerfil      = true;

    fecharModal('modal-novo-bebe');
    atualizarNomeBebe(nome);
    atualizarNavSemPerfil();
    showView('home');
    mostrarToast(`Perfil de ${nome} criado!`, 'success');
  } catch (e) {
    console.error('Erro ao criar bebê:', e);
    mostrarToast('Erro ao criar perfil. Tente novamente.', 'error');
  }
}


/* ================================================
   14. SWIPE HORIZONTAL ENTRE VISTAS
   ================================================ */

const ORDEM_VISTAS = ['home', 'timeline', 'agenda', 'calendario'];

function animarTransicaoVista(viewAtual, proximoNome, direcao) {
  const entradaClass = direcao === 'esquerda' ? 'vista-entrando-direita' : 'vista-entrando-esquerda';

  // Adiciona a classe ANTES de showView tornar a view visível,
  // assim a animação começa exatamente no momento em que ela aparece.
  const novaView = document.getElementById('view-' + proximoNome);
  if (novaView) novaView.classList.add(entradaClass);

  showView(proximoNome);

  if (novaView) {
    novaView.addEventListener('animationend', () => novaView.classList.remove(entradaClass), { once: true });
  }
}

function iniciarSwipe() {
  const app = document.getElementById('app');
  if (!app) return;

  let xInicio = 0;
  let yInicio = 0;
  let arrastando = false;

  app.addEventListener('touchstart', e => {
    // Ignora swipe se houver modal aberto
    if (document.querySelector('.modal.open')) return;
    xInicio   = e.touches[0].clientX;
    yInicio   = e.touches[0].clientY;
    arrastando = true;
  }, { passive: true });

  app.addEventListener('touchend', e => {
    if (!arrastando) return;
    arrastando = false;

    const dx = e.changedTouches[0].clientX - xInicio;
    const dy = e.changedTouches[0].clientY - yInicio;

    // Ignora gestos predominantemente verticais (scroll)
    if (Math.abs(dy) > Math.abs(dx)) return;
    // Limiar mínimo de 50px para evitar ativação acidental
    if (Math.abs(dx) < 50) return;

    const vistaAtiva = document.querySelector('.view.active');
    if (!vistaAtiva) return;

    const nomeAtual = vistaAtiva.id.replace('view-', '');
    const idxAtual  = ORDEM_VISTAS.indexOf(nomeAtual);
    if (idxAtual === -1) return;

    const proxIdx = dx < 0 ? idxAtual + 1 : idxAtual - 1;
    if (proxIdx < 0 || proxIdx >= ORDEM_VISTAS.length) return;

    const direcao = dx < 0 ? 'esquerda' : 'direita';
    animarTransicaoVista(vistaAtiva, ORDEM_VISTAS[proxIdx], direcao);
  }, { passive: true });
}


/* ================================================
   14. AUTENTICAÇÃO (integração com auth.js)
   ================================================ */

window._onAuthStateChange = async function ({ user, acesso }) {
  usuarioAtual = user;
  acessoAtual  = acesso;

  const telaCarregando  = document.getElementById('tela-carregando');
  const telaLogin       = document.getElementById('tela-login');
  const telaAcessoNeg   = document.getElementById('tela-acesso-negado');
  const appEl           = document.getElementById('app');

  // Oculta tudo primeiro
  [telaCarregando, telaLogin, telaAcessoNeg, appEl].forEach(el => {
    if (el) el.style.display = 'none';
  });

  if (!user) {
    if (telaLogin) telaLogin.style.display = 'flex';
    return;
  }

  if (!acesso || !acesso.autorizado) {
    const msgEl = document.getElementById('msg-acesso-negado');
    if (msgEl) {
      if (acesso?.motivo === 'inativo') {
        msgEl.textContent = 'Seu acesso foi desativado. Entre em contato com o administrador.';
      } else if (acesso?.motivo === 'erro') {
        msgEl.textContent = 'Não foi possível verificar seu acesso. Verifique sua conexão e tente novamente.';
      } else {
        msgEl.textContent = 'Seu e-mail não está na lista de convidados. Solicite acesso ao administrador.';
      }
    }
    if (telaAcessoNeg) telaAcessoNeg.style.display = 'flex';
    return;
  }

  aplicarTemaInicial();

  // Admin vai para a página dedicada
  if (acesso.role === 'admin') {
    window.location.href = 'admin.html';
    return;
  }

  // Usuário comum — inicializa multi-perfil e exibe o app
  profileIds     = acesso.profileIds || (acesso.profileId ? [acesso.profileId] : []);
  profileIdAtivo = profileIds[0] || null;

  if (appEl) appEl.style.display = '';
  renderizarBarraTopo();
  iniciarSwipe();
  renderizarHome();
};

window._onLoginErro = function (e) {
  mostrarToast('Erro ao entrar. Tente novamente.', 'error');
  console.error('Login error:', e);
};

const SVG_LUA = `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const SVG_SOL = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

function renderizarBarraTopo() {
  const barra = document.getElementById('barra-topo');
  if (!barra || !usuarioAtual) return;

  const foto    = usuarioAtual.photoURL
    ? `<img src="${esc(usuarioAtual.photoURL)}" class="user-bar-avatar" alt="" />`
    : '';
  const isDark  = document.body.getAttribute('data-theme') === 'dark';

  barra.innerHTML = `
    <div class="barra-topo-esq">
      ${foto}
    </div>
    <div class="barra-topo-centro">
      <button class="bebe-chip" id="bebe-chip" onclick="abrirSeletorBebe()" title="Trocar bebê">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V5"/><path d="M8 9.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-10z"/></svg>
        <span id="bebe-chip-nome">…</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>
    <div class="barra-topo-dir">
      <button class="btn-dark-mode" onclick="alternarDarkMode()" title="Alternar tema" aria-label="Alternar modo escuro">
        ${isDark ? SVG_SOL : SVG_LUA}
      </button>
      <button class="user-bar-sair" onclick="window.fazerLogout()">Sair</button>
    </div>`;
}

function atualizarNomeBebe(nomeCompleto) {
  const chip = document.getElementById('bebe-chip-nome');
  if (!chip) return;
  const primeiro = nomeCompleto ? nomeCompleto.trim().split(/\s+/)[0] : '';
  chip.textContent = primeiro || 'Sem perfil';
}

function alternarDarkMode() {
  const atual   = document.body.getAttribute('data-theme');
  const isDark  = atual === 'dark';
  if (!isDark) {
    // Salva o tema de gênero atual antes de entrar no dark
    localStorage.setItem('tema-genero', atual || 'beige');
  }
  const proximo = isDark ? (localStorage.getItem('tema-genero') || 'beige') : 'dark';
  document.body.setAttribute('data-theme', proximo);
  localStorage.setItem('tema-dark', proximo === 'dark' ? '1' : '0');
  const btnTema = document.querySelector('.btn-dark-mode');
  if (btnTema) btnTema.innerHTML = proximo === 'dark' ? SVG_SOL : SVG_LUA;
}

function aplicarTemaInicial() {
  const genero = localStorage.getItem('tema-genero') || 'beige';
  document.body.setAttribute('data-genero', genero);
  if (localStorage.getItem('tema-dark') === '1') {
    document.body.setAttribute('data-theme', 'dark');
  } else {
    document.body.setAttribute('data-theme', genero);
  }
}


/* ================================================
   14. INICIALIZAÇÃO
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW:', e));
  }
});
