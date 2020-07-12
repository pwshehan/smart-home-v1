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

// app.post("/fights", async (request, response) => {
//   try {
//     const { winner, loser, title } = request.body;
//     const data = {
//       winner,
//       loser,
//       title,
//     };
//     const fightRef = await db.collection("fights").add({ ...data });
//     const fight = await fightRef.get();

//     response.json({
//       id: fightRef.id,
//       data: fight.data(),
//     });
//   } catch (error) {
//     response.status(500).send(error);
//   }
// });

app.put("/lights/:id", async (request, response) => {
  try {
    const lightId = request.params.id;
    const execer = request.body.execer;

    if (!lightId) throw new Error("id is blank");

    if (!execer) throw new Error("Title is required");

    // const data = {
    //   title,
    // };
    // await db.collection("lights").doc(lightId).set(data, { merge: true });
    const cityRef = db.collection("lights").doc(lightId);
    const doc = await cityRef.get();
    if (!doc.exists) {
      console.log("No such document!");
      throw new Error("id not found");
    } else {
      console.log("Document data:", doc.data());
      response.json({
        id: lightId,
        data: doc.data,
      });
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

// app.delete("/fights/:id", async (request, response) => {
//   try {
//     const fightId = request.params.id;

//     if (!fightId) throw new Error("id is blank");

//     await db.collection("fights").doc(fightId).delete();

//     response.json({
//       id: fightId,
//     });
//   } catch (error) {
//     response.status(500).send(error);
//   }
// });
