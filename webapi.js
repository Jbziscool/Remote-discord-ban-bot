const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const uri = process.env.apiurl;



mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  userid: String,
  reason: String
});

const User = mongoose.model('User', userSchema);

app.get('/checkUser', async (req, res) => {
  const userid = req.query.userid;
  try {
    const user = await User.findOne({ userid: userid });
    if (user) {
      return res.json({ Error: false, banned: true, reason: user.reason });
    } else {
      return res.json({ Error: false, banned: false, reason: null });
    }
  } catch (err) {
    return res.json({ Error: err.message, banned: 'ERROR', reason: null });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
