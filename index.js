const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.poyqe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri)

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log('Connected to database');

        const database = client.db('event-management');
        const eventsCollection = database.collection('events');
        const usersCollection = database.collection('users');
        const invitesCollection = database.collection('invites');

        // GET API
        app.get('/events', async (req, res) => {
            const cursor = eventsCollection.find({});

            const page = req.query.page;
            const size = parseInt(req.query.size);
            let events;
            const count = await eventsCollection.countDocuments();

            if (page) {
                events = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                events = await cursor.toArray();
            }

            res.send({
                count,
                events
            });

        })
        // get one event 
        app.get('/singleEvent', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) }
            const cursor = await eventsCollection.findOne(query);
            res.json(cursor)
        })
        app.get('/userDetails', async (req, res) => {
            const email = req.query.email;

            const query = { email: email }
            const cursor = await usersCollection.findOne(query);

            res.json(cursor)

        })
        app.get('/myevent', async (req, res) => {
            const email = req.query.email;

            const query = { email: email }
            const cursor = await eventsCollection.find(query);
            const result = await cursor.toArray()
            res.json(result)


        })

        app.get('/invite', async (req, res) => {
            const email = req.query.email;

            const query = { email: email }
            const cursor = await invitesCollection.find(query);
            const result = await cursor.toArray()
            res.json(result)

        })
        app.get('/eventsWithAction', async (req, res) => {
            const email = req.query.email;
            const action = req.query.action;
            const query = { email: email }
            const cursor = await eventsCollection.find(query);
            const result = await cursor.toArray()
            if (action === 'sortA') {
                result.sort((a, b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
                res.json(result)
            } else if (action === 'sortD') {
                result.sort((a, b) => (a.title < b.title) ? 1 : ((b.title < a.title) ? -1 : 0));
                res.json(result)
            }

            else {
                res.json({})
            }
        })

        // POST API 
        // insert one
        app.post('/user', async (req, res) => {
            const loginData = req.body;
            const result = await usersCollection.findOne({ email: loginData.email });
            if (result.password === loginData.password) {
                res.json({ message: 'success' })
            } else {
                res.json({ message: 'failed' })

            }
        })
        app.post('/adduser', async (req, res) => {
            const loginData = req.body;
            let result = await usersCollection.findOne({ email: loginData.email });
            if (result) {
                res.json({ message: 'already have account' })
            } else {

                result = await usersCollection.insertOne(loginData);
                res.json(result)
            }
        })
        app.post('/addevent', async (req, res) => {
            const eventData = req.body;
            result = await eventsCollection.insertOne(eventData);
            res.json(result)

        })
        app.post('/invite', async (req, res) => {
            const inviteData = req.body;
            result = await invitesCollection.insertOne(inviteData);
            res.json(result)

        })

        // PUT api
        app.put('/editevent', async (req, res) => {
            const eventD = req.body;
            const filter = { _id: ObjectId(eventD._id) };
            // const options = { upsert: true };
            const { _id, ...rest } = eventD
            const updateDoc = { $set: { ...rest } };
            const result = await eventsCollection.updateOne(filter, updateDoc);
            res.json(result);

        })
        app.put('/changePassword', async (req, res) => {
            const userD = req.body;
            const filter = { _id: ObjectId(userD._id) };
            // const options = { upsert: true };
            const result = await usersCollection.findOne(filter);
            if (result.password === userD.password) {
                const updateDoc = { $set: { password: userD.npassword } };
                const updated = await usersCollection.updateOne(filter, updateDoc);
                res.json(updated);
            } else {
                res.json({ massage: 'failed' })
            }

        })
        app.put('/esssditEvent', async (req, res) => {
            const eventDetails = req.body;
            // console.log(eventDetails)
            const filter = { _id: ObjectId(eventDetails._id) };
            // const options = { upsert: true };
            const { _id, title, description, img } = eventDetails
            const updateDoc = { $set: { title: title, description: description, img: img } };
            const result = await eventsCollection.updateOne(filter, updateDoc);

            console.log(result)
            res.json(result);

        })
        // Delete Api
        // delete one


    } finally {
        // await client.close();
    }
}

run().catch(console.dir);




app.listen(port, () => {
    console.log('your facking is running ', port)

})
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
