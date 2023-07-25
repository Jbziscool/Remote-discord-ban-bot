const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const axios = require('axios');
require('dotenv').config();



const uri = process.env.mongourl;
const dbName = process.env.dbname;
const collectionName = process.env.dbcollectionname;
const API_KEY = process.env.apikey;



const client = new MongoClient(uri);
client.connect((err) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
    return;
  }
  console.log('Connected to MongoDB');
});

const db = client.db(dbName);
const collection = db.collection(collectionName);



const validateAPIKey = (req, res, next) => {
  const apiKey = req.query.api_key;

  if (apiKey == API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Api key invalid' });
  }
};



app.get('/', async (req, res) => {
  res.json({ Error: false });
});



app.get('/checkuser', validateAPIKey, async (req, res) => {
  const requestedUserId = req.query.userid;

  try {
    const result = await collection.findOne({ userid: requestedUserId });

    if (result) {
      const { reason } = result;
      res.json({ Banned: true, reason });
    } else {
      res.json({ Banned: false, reason: null });
    }
  } catch (error) {
    console.error('Error while checking value:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/ban', validateAPIKey, async (req, res) => {
  const { userid, reason } = req.query;

  axios.get(`https://api.newstargeted.com/roblox/users/v2/user.php?userId=${userid}`)
    .then(async (response) => {
      console.log(response.data);
      const usernametoinsert = response.data.username;

      try {
        const result = await insertUserData(userid, usernametoinsert, reason);

        res.json({ success: true, insertedCount: result.insertedCount });
      } catch (error) {
        console.error('Error while inserting user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    });
});

async function insertUserData(userid, usernametoinsert, reason) {
  const result = await collection.insertOne({ userid, usernametoinsert, reason });
  return result;
}




app.get('/unban', validateAPIKey, async (req, res) => {
  const { userid } = req.query;

  try {
    const result = await collection.deleteOne({ userid });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not banned' });
    }


    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error while deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});








const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
