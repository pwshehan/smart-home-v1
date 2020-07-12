import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";
// import * as serviceAccount from "../";

var serviceAccount = require("../keys/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smarthomev1-381ab.firebaseio.com",
});

// admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = express();
const main = express();

main.use("/api/v1", app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);

app.get("/warm", (req, res) => {
  res.send("Calentando para la pelea");
});

app.put("/lights/:id", async (request, response) => {
  try {
    const lightId = request.params.id;
    const state = request.body.state;
    const execer = request.body.execer;

    if (!lightId) throw new Error("id is blank");
    if (!state) throw new Error("State is blank");
    if (!execer) throw new Error("Title is required");

    const prv_doc = await db.collection("lights").doc(lightId).get();

    if (!prv_doc.exists) {
      throw new Error("id not found");
    } else {
      const data = { state };
      await db.collection("lights").doc(lightId).set(data, { merge: true });
      const new_doc = await db.collection("lights").doc(lightId).get();

      const prv_data = prv_doc.data();
      const new_data = new_doc.data();
      const event_log = {
        execer: execer,
        object: lightId,
        prv_data: prv_data,
        new_data: new_data,
        timestamp: Date.now,
      };

      await db.collection("event_logs").add(event_log);

      response.json({
        id: lightId,
        prv_doc: prv_doc.data(),
        new_doc: new_doc.data(),
        event_log: event_log,
      });
    }
  } catch (error) {
    response.status(500).send(error);
  }
});
