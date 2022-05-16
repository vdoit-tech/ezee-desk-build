// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config

var firebaseConfig = {
  apiKey: "AIzaSyAmdIdKUAbgSgFoPGJMNNOxxvzlHpoxmgw",
  authDomain: "ezeelink-1c874.firebaseapp.com",
  projectId: "ezeelink-1c874",
  storageBucket: "ezeelink-1c874.appspot.com",
  messagingSenderId: "977061224445",
  appId: "1:977061224445:web:34be4d20981c21bae1c394",
  measurementId: "G-1G8J6T4XVD",
};
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBWD69Bxa-LOw7QRCv_x2TglylY6PKMdj0",
//   authDomain: "demolink-a25f7.firebaseapp.com",
//   projectId: "demolink-a25f7",
//   storageBucket: "demolink-a25f7.appspot.com",
//   messagingSenderId: "757515567307",
//   appId: "1:757515567307:web:4973176c7ecc785ae89b4e",
//   measurementId: "G-EY92BNX2CS",
// };

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
