import { initializeApp }  from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js';
import { initializeFirestore, persistentLocalCache } from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyANSLOTbr6nnSqfrZEaLJC-17YPImf8Ko4',
  authDomain: 'app-do-bb.firebaseapp.com',
  projectId: 'app-do-bb',
  storageBucket: 'app-do-bb.firebasestorage.app',
  messagingSenderId: '935972706865',
  appId: '1:935972706865:web:b2914420b60957cafe1310',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db          = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache(),
});
