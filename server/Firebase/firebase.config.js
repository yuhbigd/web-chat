var admin = require("firebase-admin");

var serviceAccount = require("./fcmass.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
