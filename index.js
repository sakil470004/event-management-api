const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
// for the access userData body data
app.use(express.json());

// mongodb+srv://<username>:<password>@cluster0.poyqe.mongodb.net/?retryWrites=true&w=majority
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.poyqe.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    client.connect();
    console.log("Connected to database");

    const database = client.db("event-management");
    const eventsCollection = database.collection("events");
    const usersCollection = database.collection("users");
    const invitesCollection = database.collection("invites");

    // GET API
    app.get("/", async (req, res) => {
      res.send(
        '<h1 style="color:red">your event management api is running</h1>'
      );
    });
    app.get("/events", async (req, res) => {
      const cursor = eventsCollection.find({});

      const page = req.query.page;
      const size = parseInt(req.query.size);
      let events;
      const count = await eventsCollection.countDocuments();

      if (page) {
        events = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        events = await cursor.toArray();
      }

      res.send({
        count,
        events,
      });
    });
    // get one event
    app.get("/singleEvent", async (req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) };
      const cursor = await eventsCollection.findOne(query);
      res.json(cursor);
    });
    app.get("/userDetails", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const cursor = await usersCollection.findOne(query);

      res.json(cursor);
    });
    app.get("/myevent", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const cursor = await eventsCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    app.get("/invite", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const cursor = await invitesCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });
    app.get("/eventsWithAction", async (req, res) => {
      const email = req.query.email;
      const action = req.query.action;
      const query = { email: email };
      const cursor = await eventsCollection.find(query);
      const result = await cursor.toArray();
      if (action === "sortA") {
        result.sort((a, b) =>
          a.title > b.title ? 1 : b.title > a.title ? -1 : 0
        );
        res.json(result);
      } else if (action === "sortD") {
        result.sort((a, b) =>
          a.title < b.title ? 1 : b.title < a.title ? -1 : 0
        );
        res.json(result);
      } else {
        res.json({});
      }
    });

    // POST API
    // insert one
    app.post("/user", async (req, res) => {
      const loginData = req.body;
      if (!loginData?.email && !loginData?.password) {
        res.send(200).json({ message: "Fill Data Correctly" });
      } else {
        const result = await usersCollection.findOne({
          email: loginData.email,
        });
        if (result?.password === loginData?.password) {
          res.json({ message: "success" });
        } else {
          res.json({ message: "failed" });
        }
      }
    });
    app.post("/adduser", async (req, res) => {
      const loginData = req.body;
      if (!loginData?.email || !loginData?.password) {
        res.json({ message: "Fill The data Correctly" });
      } else {
        let result = await usersCollection.findOne({ email: loginData.email });
        if (result) {
          res.json({ message: "already have account" });
        } else {
          result = await usersCollection.insertOne(loginData);
          res.json(result);
        }
      }
    });
    app.post("/addevent", async (req, res) => {
      const eventData = req.body;
      result = await eventsCollection.insertOne(eventData);
      res.json(result);
    });
    app.post("/invite", async (req, res) => {
      const inviteData = req.body;
      result = await invitesCollection.insertOne(inviteData);
      res.json(result);
    });

    // PUT api
    app.put("/editevent", async (req, res) => {
      const eventD = req.body;
      const filter = { _id: new ObjectId(eventD._id) };
      // const options = { upsert: true };
      const { _id, ...rest } = eventD;
      const updateDoc = { $set: { ...rest } };
      const result = await eventsCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    app.put("/changePassword", async (req, res) => {
      const userD = req.body;
      const filter = { _id: new ObjectId(userD._id) };
      // const options = { upsert: true };
      const result = await usersCollection.findOne(filter);
      if (result.password === userD.password) {
        const updateDoc = { $set: { password: userD.npassword } };
        const updated = await usersCollection.updateOne(filter, updateDoc);
        res.json(updated);
      } else {
        res.json({ massage: "failed" });
      }
    });
    app.put("/esssditEvent", async (req, res) => {
      const eventDetails = req.body;
      const filter = { _id: new ObjectId(eventDetails._id) };
      // const options = { upsert: true };
      const { _id, title, description, img } = eventDetails;
      const updateDoc = {
        $set: { title: title, description: description, img: img },
      };
      const result = await eventsCollection.updateOne(filter, updateDoc);

      res.json(result);
    });
    // Delete Api
    // delete one
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log("your event management api is running ", port);
});
/*
1.heroku account open
2.heroku software install

Every project
1.git init
2. .gitignore(node_module , .env)
3.push everything to git
4.make sure you have this script :   "start": "node index.js",
5.make sure :put process.env.PORT in front of your port number
6.heroku login
7.heroku create(only one time for a project)
8.command :git push heroku main

------
update:
1.save everything check locally
2.git add , git commit -m ,"" git push
3. git push heroku main
*/
