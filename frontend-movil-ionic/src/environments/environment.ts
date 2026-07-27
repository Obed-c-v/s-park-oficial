// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  // Backend principal S-Park (Express con BD PostgreSQL completa)
  apiUrl: 'https://spark-backend-sk78.onrender.com/api',
  // Backend simple del proyecto (auth básica simulada)
  apiUrlSimple: 'https://spark-backend-sk78.onrender.com/api',

  // 🔥 CONFIG FIREBASE (sin uso activo por ahora)
  firebaseConfig: {
    apiKey: "AIzaSyBQhWIkSv40MNTpIwfYxTBYhS-UGix30S8",
    authDomain: "app-login-f7a8f.firebaseapp.com",
    projectId: "app-login-f7a8f",
    storageBucket: "app-login-f7a8f.firebasestorage.app",
    messagingSenderId: "517913483041",
    appId: "1:517913483041:web:30d15be20614358c69d060"
  },
  googleWebClientId: "517913483041-p9jndgd457mfc0tu81dofqe60d49js46.apps.googleusercontent.com"
};