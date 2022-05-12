const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const fileUpload = require('express-fileupload');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f1hps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('userInfo');
        const usersCollection = database.collection('users');

        // PUT API FOR GOOGLE LOGIN
        app.put('/user', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // POST API FOR SIGN UP
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // POST API FOR PRODUCT
        app.put('/users', async (req, res) => {
            
            const name = req.body.name;
            const email = req.body.email;
            const phone = req.body.phone;
            const address = req.body.address;
            const img = req.files.image;
            const imgData = img.data;
            const encodedImg = imgData.toString('base64');
            const imageBuffer = Buffer.from(encodedImg, 'base64');

            const user = {
                name,
                email,
                phone,
                address,
                img: imageBuffer
            }
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = { $set: user };

            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // GET USER API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send(user);
        });
        
    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("User Info Server in running");
});

app.listen(port, () => {
    console.log("User Info server port", port);
});