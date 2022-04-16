import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken,
} from "firebase/messaging";
import { socket } from "../socket";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: "fcmass-9f597.firebaseapp.com",
  projectId: "fcmass-9f597",
  storageBucket: "fcmass-9f597.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: "G-X1D2DE64D7",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const publicKey = process.env.REACT_APP_FIREBASE_MESSAGING_PKEY;

export const deleteOldToken = async () => {
  await deleteToken(messaging);
};
export function sendNotiToken() {
  getToken(messaging, { vapidKey: publicKey })
    .then((currentToken) => {
      if (currentToken) {
        socket.emit("BE_subscribe_user_topic_noti", currentToken);
      } else {
        // Show permission request UI
        console.log(
          "No registration token available. Request permission to generate one.",
        );
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
      // ...
    });
  onMessage(messaging, (payload) => {
    // console.log("Message received. ", JSON.stringify(payload));
  });
}
export default app;
