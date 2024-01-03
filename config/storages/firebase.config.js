//firebase storage config
const { Storage } = require("@google-cloud/storage");

//new instance of the Firebase Storage client
const firebaseStorage = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

module.exports = {
  firebaseStorage,
};
