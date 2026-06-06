/**
 * Ponte entre os módulos Firebase (ESM) e o app.js (script clássico).
 * Expõe operações de Firestore em window._db para uso no app.js.
 */

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  increment,
  collection,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  onSnapshot,
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

import { db } from './firebase-config.js';

const PERMISSOES_USUARIO = {
  perfil:    { read: true, write: true, delete: true },
  historico: { read: true, write: true, delete: true },
  agenda:    { read: true, write: true, delete: true },
  admin:     { read: false, write: false, delete: false, manage: false },
};

const PERMISSOES_ADMIN = {
  perfil:    { read: true, write: true, delete: true },
  historico: { read: true, write: true, delete: true },
  agenda:    { read: true, write: true, delete: true },
  admin:     { read: true, write: true, delete: true, manage: true },
};

window._db = {

  /* ---------- Perfil do bebê ---------- */

  async carregarPerfil(profileId) {
    const snap = await getDoc(doc(db, 'profiles', profileId));
    if (!snap.exists()) return null;
    return snap.data().babyProfile || null;
  },

  async gravarPerfil(profileId, babyProfile, uid) {
    const ref  = doc(db, 'profiles', profileId);
    const snap = await getDoc(ref);
    const agora = serverTimestamp();

    if (snap.exists()) {
      await setDoc(ref, { ...snap.data(), babyProfile, updatedAt: agora });
    } else {
      await setDoc(ref, {
        babyProfile,
        eventCount:        0,
        consultationCount: 0,
        createdBy:         uid || null,
        createdAt:         agora,
        updatedAt:         agora,
      });
    }
  },

  /* ---------- Eventos de saúde ---------- */

  async listarEventos(profileId) {
    const snap = await getDocs(collection(db, 'profiles', profileId, 'events'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async listarEventosPaginados(profileId, cursor, dataInicio, dataFim) {
    const col = collection(db, 'profiles', profileId, 'events');
    const constraints = [orderBy('data', 'desc'), limit(20)];
    if (dataInicio) constraints.push(where('data', '>=', dataInicio));
    if (dataFim)    constraints.push(where('data', '<=', dataFim));
    if (cursor)     constraints.push(startAfter(cursor));
    const snap = await getDocs(query(col, ...constraints));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { docs, cursor: snap.docs[snap.docs.length - 1] || null };
  },

  async carregarEvento(profileId, eventoId) {
    const snap = await getDoc(doc(db, 'profiles', profileId, 'events', eventoId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async salvarEvento(profileId, evento, ehNovo) {
    const { id, ...dados } = evento;
    await setDoc(doc(db, 'profiles', profileId, 'events', id), {
      ...dados,
      updatedAt: serverTimestamp(),
    });
    if (ehNovo) {
      await updateDoc(doc(db, 'profiles', profileId), { eventCount: increment(1), updatedAt: serverTimestamp() });
    }
  },

  async excluirEvento(profileId, eventoId) {
    await deleteDoc(doc(db, 'profiles', profileId, 'events', eventoId));
    await updateDoc(doc(db, 'profiles', profileId), { eventCount: increment(-1), updatedAt: serverTimestamp() });
  },

  /* ---------- Consultas médicas ---------- */

  async listarConsultas(profileId) {
    const snap = await getDocs(collection(db, 'profiles', profileId, 'consultations'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async listarConsultasPaginadas(profileId, cursor, dataInicio, dataFim) {
    const col = collection(db, 'profiles', profileId, 'consultations');
    const constraints = [orderBy('data', 'desc'), limit(20)];
    if (dataInicio) constraints.push(where('data', '>=', dataInicio));
    if (dataFim)    constraints.push(where('data', '<=', dataFim));
    if (cursor)     constraints.push(startAfter(cursor));
    const snap = await getDocs(query(col, ...constraints));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { docs, cursor: snap.docs[snap.docs.length - 1] || null };
  },

  async carregarConsulta(profileId, consultaId) {
    const snap = await getDoc(doc(db, 'profiles', profileId, 'consultations', consultaId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async salvarConsulta(profileId, consulta, ehNova) {
    const { id, ...dados } = consulta;
    await setDoc(doc(db, 'profiles', profileId, 'consultations', id), {
      ...dados,
      updatedAt: serverTimestamp(),
    });
    if (ehNova) {
      await updateDoc(doc(db, 'profiles', profileId), { consultationCount: increment(1), updatedAt: serverTimestamp() });
    }
  },

  async excluirConsulta(profileId, consultaId) {
    await deleteDoc(doc(db, 'profiles', profileId, 'consultations', consultaId));
    await updateDoc(doc(db, 'profiles', profileId), { consultationCount: increment(-1), updatedAt: serverTimestamp() });
  },

  /* ---------- Multi-perfil ---------- */

  async criarNovoPerfil(email, novoProfileId, uid) {
    const agora = serverTimestamp();
    // Adiciona o novo profileId ao array do usuário no accessIndex
    await updateDoc(doc(db, 'accessIndex', email), {
      profileIds: arrayUnion(novoProfileId),
      updatedAt:  agora,
    });
    // Cria o documento de perfil vazio
    await setDoc(doc(db, 'profiles', novoProfileId), {
      babyProfile:       {},
      eventCount:        0,
      consultationCount: 0,
      createdBy:         uid || null,
      createdAt:         agora,
      updatedAt:         agora,
    });
  },

  async carregarResumosPerfis(profileIds) {
    if (!profileIds?.length) return [];
    const snaps = await Promise.all(
      profileIds.map(id => getDoc(doc(db, 'profiles', id)))
    );
    return snaps
      .filter(s => s.exists())
      .map(s => ({
        profileId:         s.id,
        nomeCompleto:      s.data().babyProfile?.nomeCompleto || null,
        eventCount:        s.data().eventCount        || 0,
        consultationCount: s.data().consultationCount || 0,
      }));
  },

  /* ---------- Painel administrativo ---------- */

  async listarAcessos() {
    const snap = await getDocs(collection(db, 'accessIndex'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async criarAcesso(email, role, criadoPorUid) {
    const emailNorm  = email.trim().toLowerCase();
    const profileId  = 'profile-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const agora      = serverTimestamp();
    const permissoes = role === 'admin' ? PERMISSOES_ADMIN : PERMISSOES_USUARIO;

    // Cria o documento de acesso
    await setDoc(doc(db, 'accessIndex', emailNorm), {
      email:      emailNorm,
      profileId,
      profileIds: [profileId],
      role,
      active:     true,
      permissions: permissoes,
      createdAt:   agora,
      updatedAt:   agora,
    });

    // Cria o documento de perfil vazio para o convidado
    await setDoc(doc(db, 'profiles', profileId), {
      babyProfile: {},
      createdBy:   criadoPorUid || null,
      createdAt:   agora,
      updatedAt:   agora,
    });

    return profileId;
  },

  async alternarAtivo(email, ativo) {
    await updateDoc(doc(db, 'accessIndex', email), {
      active:    ativo,
      updatedAt: serverTimestamp(),
    });
  },

  async alterarRole(email, role) {
    const permissoes = role === 'admin' ? PERMISSOES_ADMIN : PERMISSOES_USUARIO;
    await updateDoc(doc(db, 'accessIndex', email), {
      role,
      permissions: permissoes,
      updatedAt:   serverTimestamp(),
    });
  },

  async removerAcesso(email) {
    await deleteDoc(doc(db, 'accessIndex', email));
  },

  /* ---------- Listeners em tempo real ---------- */

  subscribePerfil(profileId, onChange) {
    return onSnapshot(doc(db, 'profiles', profileId), snap => {
      onChange(snap.exists() ? (snap.data().babyProfile || null) : null);
    });
  },

  subscribeEventos(profileId, onChange) {
    return onSnapshot(collection(db, 'profiles', profileId, 'events'), snap => {
      onChange(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  subscribeConsultas(profileId, onChange) {
    return onSnapshot(collection(db, 'profiles', profileId, 'consultations'), snap => {
      onChange(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },
};
