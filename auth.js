import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';

import {
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

import { firebaseApp, db } from './firebase-config.js';

const auth     = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

window.fazerLoginGoogle = async function () {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    const ignorar = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];
    if (!ignorar.includes(e.code) && window._onLoginErro) {
      window._onLoginErro(e);
    }
  }
};

window.fazerLogout = async function () {
  await signOut(auth);
};

async function verificarAcesso(user) {
  try {
    const snap = await getDoc(doc(db, 'accessIndex', user.email));

    if (!snap.exists()) {
      return { autorizado: false, motivo: 'sem-convite' };
    }

    const dados = snap.data();

    if (!dados.active) {
      return { autorizado: false, motivo: 'inativo' };
    }

    // profileIds: usa o array se existir, senão cria a partir do profileId legado
    const profileIds = dados.profileIds || (dados.profileId ? [dados.profileId] : []);

    return {
      autorizado:   true,
      profileId:    dados.profileId,
      profileIds,
      role:         dados.role,
      permissions:  dados.permissions,
    };
  } catch (e) {
    console.error('Erro ao verificar acesso:', e);
    return { autorizado: false, motivo: 'erro', erro: e };
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!window._onAuthStateChange) return;

  if (!user) {
    window._onAuthStateChange({ user: null, acesso: null });
    return;
  }

  const acesso = await verificarAcesso(user);
  window._onAuthStateChange({ user, acesso });
});
