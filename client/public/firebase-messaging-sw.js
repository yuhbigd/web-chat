// Scripts for firebase and firebase messaging
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
// eslint-disable-next-line no-undef
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js",
);

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyCUEffB0zNMYpINqUibPdrtwCJ3GwHPELE",
  authDomain: "fcmass-9f597.firebaseapp.com",
  projectId: "fcmass-9f597",
  storageBucket: "fcmass-9f597.appspot.com",
  messagingSenderId: "776223742738",
  appId: "1:776223742738:web:1d3df5603f55f14d9bb1cb",
  measurementId: "G-X1D2DE64D7",
};

// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  // Customize notification here
  const notificationTitle = "Background Message Title";
  const notificationOptions = {
    body: "Background Message body.",
    icon: "/logo192.png",
  };

  // self.registration.showNotification(notificationTitle, notificationOptions);
});
