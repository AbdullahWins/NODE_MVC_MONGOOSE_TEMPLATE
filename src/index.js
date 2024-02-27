//imports
const express = require("express");
const fs = require("fs");
const admin = require("firebase-admin");
const multer = require("multer");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const { logger } = require("./services/loggers/Winston.js");

//middleware
// app.use(express.json());
app.use(cors());
// app.use(multer({ dest: "uploads/" }).single("file"));
// app.use(multer({ dest: "uploads/" }).array("files", 10));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the destination folder where you want to save the files
    const uploadFolder = "uploads/";

    // Ensure that the destination folder exists
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder);
    }

    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname;
    cb(null, originalname); // Use the original filename
  },
});

const upload = multer({ storage: storage, limits: { files: 10 } });

app.use(upload.array("files", 10));

dotenv.config();
const port = process.env.SERVER_PORT || 5000;

//initialize firebase
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

//import database connection and routes
const routes = require("./routes/main/routes.js");
const connectToDatabase = require("../config/databases/mongoose.config.js");
app.use(routes);

//starting the server
async function start() {
  try {
    // Connect to MongoDB using Mongoose
    await connectToDatabase();

    app.get("/", (req, res) => {
      logger.log("info", "welcome to the server!");
      res.send("welcome to the server!");
    });

    app.listen(port, () => {
      logger.log("info", `Server is running on port: ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
}

start();
