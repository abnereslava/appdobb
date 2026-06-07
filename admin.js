/* ================================================
   PAINEL ADMINISTRATIVO — admin.js
   ================================================ */

let usuarioAtual = null;
let acessoAtual  = null;

/* ---------- Integração com auth.js ---------- */

window._onAuthStateChange = function ({ user, acesso }) {
  usuarioAtual = user;
  acessoAtual  = acesso;

  const telaCarregando = document.getElementById('tela-carregando');
  const telaAcessoNeg  = document.getElementById('tela-acesso-negado');
  const adminApp       = document.getElementById('admin-app');

  [telaCarregando, telaAcessoNeg, adminApp].forEach(el => {
    if (el) el.style.display = 'none';
  });

  if (!user) {
    // Não autenticado: volta para o login no index
    window.location.href = 'index.html';
    return;
  }

  const ehAdmin = acesso?.autorizado && acesso?.role === 'admin' && acesso?.permissions?.admin?.manage === true;

  if (!ehAdmin) {
    if (telaAcessoNeg) telaAcessoNeg.style.display = 'flex';
    return;
  }

  if (adminApp) adminApp.style.display = '';
  aplicarTemaInicial();
  renderizarInfoUsuario();
  renderizarAdmin();
};

window._onLoginErro = function (e) {
  console.error('Login error:', e);
};


/* ---------- Utilitários ---------- */

function esc(txt) {
  if (!txt) return '';
  return String(txt)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function abrirModal(id)  { const m = document.getElementById(id); if (m) m.classList.add('open');    document.body.style.overflow = 'hidden'; }
function fecharModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); document.body.style.overflow = ''; }

let _confirmarResolve = null;

function confirmar({ titulo, msg, txtOk = 'Confirmar', destrutivo = false }) {
  return new Promise(resolve => {
    _confirmarResolve = resolve;
    document.getElementById('confirmar-titulo').textContent = titulo;
    document.getElementById('confirmar-msg').textContent    = msg;
    document.getElementById('confirmar-icone').innerHTML    = '';
    const btnOk = document.getElementById('confirmar-btn-ok');
    btnOk.textContent = txtOk;
    btnOk.className   = destrutivo ? 'btn-danger' : 'btn-primary';
    abrirModal('modal-confirmar');
  });
}

function fecharConfirmar(resultado) {
  fecharModal('modal-confirmar');
  if (_confirmarResolve) { _confirmarResolve(resultado); _confirmarResolve = null; }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }
});

function mostrarToast(msg, tipo = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast show ${tipo}`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}


/* ---------- Cabeçalho ---------- */

function aplicarTemaInicial() {
  if (localStorage.getItem('tema-dark') === '1') {
    document.body.setAttribute('data-theme', 'dark');
  }
}

function alternarDarkMode() {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  document.body.setAttribute('data-theme', isDark ? 'beige' : 'dark');
  localStorage.setItem('tema-dark', isDark ? '0' : '1');
  renderizarInfoUsuario();
}

function renderizarInfoUsuario() {
  const el = document.getElementById('admin-user-info');
  if (!el || !usuarioAtual) return;
  const foto    = usuarioAtual.photoURL
    ? `<img src="${esc(usuarioAtual.photoURL)}" class="user-bar-avatar" alt="" />`
    : '';
  const isDark  = document.body.getAttribute('data-theme') === 'dark';
  el.innerHTML = `
    ${foto}
    <span class="user-bar-nome">${esc(usuarioAtual.displayName || usuarioAtual.email)}</span>
    <button class="btn-dark-mode" onclick="alternarDarkMode()" title="Alternar tema">${isDark ? '☀️' : '🌙'}</button>
    <button class="user-bar-sair" onclick="window.fazerLogout()">Sair</button>`;
}


/* ---------- Painel principal ---------- */

async function renderizarAdmin() {
  const container = document.getElementById('admin-conteudo');
  container.innerHTML = `<div class="carregando-view"><div class="login-spinner"></div></div>`;

  let acessos = [];
  try {
    acessos = await window._db.listarAcessos();
  } catch (e) {
    container.innerHTML = `<p style="color:var(--text-muted);padding:24px 0;">Erro ao carregar usuários. Verifique sua conexão.</p>`;
    return;
  }

  acessos.sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return  1;
    return a.email.localeCompare(b.email);
  });

  const emailAtual        = usuarioAtual?.email || '';
  const totalAdminsAtivos = acessos.filter(a => a.role === 'admin' && a.active).length;

  // Carrega resumos de perfis para todos os usuários
  const resumosPorEmail = {};
  await Promise.all(acessos.map(async a => {
    const ids = a.profileIds || (a.profileId ? [a.profileId] : []);
    if (!ids.length) { resumosPorEmail[a.email] = []; return; }
    try {
      resumosPorEmail[a.email] = await window._db.carregarResumosPerfis(ids);
    } catch { resumosPorEmail[a.email] = []; }
  }));

  const cardsHTML = acessos.map(a => {
    const ehEuMesmo  = a.email === emailAtual;
    const ultimoAdmin = a.role === 'admin' && a.active && totalAdminsAtivos === 1;

    const badgeRole  = a.role === 'admin'
      ? `<span class="badge-role-admin">Admin</span>`
      : `<span class="badge-role-user">Usuário</span>`;
    const badgeAtivo = a.active
      ? `<span class="badge-ativo">Ativo</span>`
      : `<span class="badge-inativo">Inativo</span>`;

    // Admin não pode desativar a si mesmo nem rebaixar seu próprio papel
    const bloqueadoPorSerEuAdmin = ehEuMesmo && a.role === 'admin';

    const btnToggle = a.active
      ? `<button class="btn-ghost btn-sm" onclick="adminAlternarAtivo('${a.email}', false)"
           ${ultimoAdmin || bloqueadoPorSerEuAdmin ? `disabled title="${bloqueadoPorSerEuAdmin ? 'Você não pode desativar a si mesmo' : 'Último administrador ativo'}"` : ''}>Desativar</button>`
      : `<button class="btn-ghost btn-sm" onclick="adminAlternarAtivo('${a.email}', true)">Reativar</button>`;

    const btnRole = a.role === 'user'
      ? `<button class="btn-ghost btn-sm" onclick="adminAlterarRole('${a.email}', 'admin')">Tornar Admin</button>`
      : `<button class="btn-ghost btn-sm" onclick="adminAlterarRole('${a.email}', 'user')"
           ${ultimoAdmin || bloqueadoPorSerEuAdmin ? `disabled title="${bloqueadoPorSerEuAdmin ? 'Você não pode rebaixar a si mesmo' : 'Último administrador ativo'}"` : ''}>Tornar Usuário</button>`;

    const btnRemover = !ehEuMesmo
      ? `<button class="btn-danger btn-sm" onclick="adminRemoverAcesso('${a.email}')" ${ultimoAdmin ? 'disabled title="Último administrador ativo"' : ''}>Remover</button>`
      : '';

    return `
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-email">
              ${esc(a.email)}
              ${ehEuMesmo ? '<span style="font-size:11px;color:var(--text-muted);"> (você)</span>' : ''}
            </div>
            <div style="display:flex;gap:6px;margin-top:4px;">${badgeRole}${badgeAtivo}</div>
          </div>
        </div>
        <div class="admin-card-actions">
          ${btnToggle}
          ${btnRole}
          ${btnRemover}
        </div>
        ${resumoCard(resumosPorEmail[a.email] || [])}
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="admin-header">
      <h1 class="page-title">Usuários</h1>
      <button class="btn-secondary btn-sm" onclick="abrirModalConvite()">+ Convidar</button>
    </div>
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
      ${acessos.length} usuário${acessos.length !== 1 ? 's' : ''} cadastrado${acessos.length !== 1 ? 's' : ''}
    </p>
    ${acessos.length === 0
      ? `<p style="color:var(--text-muted);font-size:14px;text-align:center;padding:32px 0;">Nenhum usuário cadastrado ainda.</p>`
      : cardsHTML
    }`;
}


/* ---------- Ações ---------- */

function resumoCard(resumos) {
  if (!resumos.length) return `<div class="admin-card-resumo">Nenhum perfil cadastrado.</div>`;
  const totalEventos   = resumos.reduce((s, r) => s + (r.eventCount || 0), 0);
  const totalConsultas = resumos.reduce((s, r) => s + (r.consultationCount || 0), 0);
  const nomes = resumos.map(r => r.nomeCompleto || 'Sem nome').join(', ');
  return `
    <div class="admin-card-resumo">
      <span class="admin-resumo-pill">👤 ${resumos.length} perfil${resumos.length !== 1 ? 's' : ''}</span>
      <span class="admin-resumo-pill">📋 ${totalEventos} evento${totalEventos !== 1 ? 's' : ''}</span>
      <span class="admin-resumo-pill">📅 ${totalConsultas} consulta${totalConsultas !== 1 ? 's' : ''}</span>
      <div class="admin-resumo-nomes">${esc(nomes)}</div>
    </div>`;
}

function abrirModalConvite() {
  document.getElementById('form-convite').reset();
  const r = document.querySelector('input[name="convite-role"][value="user"]');
  if (r) r.checked = true;
  abrirModal('modal-convite');
}

async function salvarConvite(event) {
  event.preventDefault();
  const email = document.getElementById('convite-email').value.trim().toLowerCase();
  const role  = document.querySelector('input[name="convite-role"]:checked')?.value || 'user';

  if (!email) { mostrarToast('Digite o e-mail.', 'error'); return; }

  try {
    await window._db.criarAcesso(email, role, usuarioAtual?.uid);
    fecharModal('modal-convite');
    mostrarToast(`Acesso criado para ${email}!`, 'success');
    renderizarAdmin();
  } catch (e) {
    console.error('Erro ao criar acesso:', e);
    mostrarToast(e.code === 'permission-denied' ? 'Permissão negada pelo Firestore.' : 'Erro ao criar acesso.', 'error');
  }
}

async function adminAlternarAtivo(email, ativo) {
  if (!ativo && email === usuarioAtual?.email) {
    mostrarToast('Você não pode desativar a si mesmo.', 'error');
    return;
  }
  try {
    await window._db.alternarAtivo(email, ativo);
    mostrarToast(ativo ? 'Acesso reativado.' : 'Acesso desativado.', 'success');
    renderizarAdmin();
  } catch (e) {
    console.error(e);
    mostrarToast('Erro ao atualizar acesso.', 'error');
  }
}

async function adminAlterarRole(email, role) {
  if (email === usuarioAtual?.email && role === 'user') {
    mostrarToast('Você não pode rebaixar a si mesmo.', 'error');
    return;
  }
  const label = role === 'admin' ? 'administrador' : 'usuário';
  const ok = await confirmar({ titulo: 'Alterar papel', msg: `Alterar o papel de "${email}" para ${label}?`, txtOk: 'Alterar' });
  if (!ok) return;
  try {
    await window._db.alterarRole(email, role);
    mostrarToast('Papel atualizado.', 'success');
    renderizarAdmin();
  } catch (e) {
    console.error(e);
    mostrarToast('Erro ao alterar papel.', 'error');
  }
}

async function adminRemoverAcesso(email) {
  const ok = await confirmar({ titulo: 'Remover acesso', msg: `Remover "${email}"? O perfil e os dados não serão excluídos.`, txtOk: 'Remover', destrutivo: true });
  if (!ok) return;
  try {
    await window._db.removerAcesso(email);
    mostrarToast('Acesso removido.', 'success');
    renderizarAdmin();
  } catch (e) {
    console.error(e);
    mostrarToast('Erro ao remover acesso.', 'error');
  }
}
