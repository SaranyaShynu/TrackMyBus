
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyApbJoZc4S4XsfxqMypEEJwTVQxBmrhMn0",
  projectId: "trackmybus-19a7d",
  messagingSenderId: "157184049092",
  appId: "1:157184049092:web:4a107c1f5328e83b74ee91"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png' 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});