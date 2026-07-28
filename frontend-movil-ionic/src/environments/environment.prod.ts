/**
 * Entorno de PRODUCCIÓN – App Móvil S-Park (Ionic)
 * Se usa automáticamente con `ionic build --prod` / `ng build --configuration production`
 */
export const environment = {
  production: true,
  // Backend principal S-Park (Express en Render)
  apiUrl: 'https://spark-backend-sk78.onrender.com/api',
  // Backend simple (sin uso en producción, apunta al mismo servidor)
  apiUrlSimple: 'https://spark-backend-sk78.onrender.com/api',
  // 🤖 Servicio de IA Flask (modelos de voz Parkinson)
  mlUrl: 'https://spark-ia.onrender.com',

  // 🔥 CONFIG FIREBASE
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