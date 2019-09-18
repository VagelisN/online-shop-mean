const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

// Backend routes
const userRoutes = require('./routes/users');
const auctionRoutes = require('./routes/auctions');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');

const app = express();

mongoose
  .connect(
    "mongodb+srv://VitaNi:VtjxLdYLy39okzgc@cluster0-3lmzb.mongodb.net/online-shop?w=majority",
    {useNewUrlParser: true})
  .then(() =>{
    console.log('Connected to database');
  })
  .catch(() =>{
    console.log('Connection to database failed');
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); // not needed

app.use("/images",express.static(path.join("backend/images"))); // any request targeting /slash images is allowed to continue

app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Headers',
   'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  res.setHeader('Access-Control-Allow-Methods',
   'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});

app.use('/users', userRoutes);
app.use('/auctions', auctionRoutes);
app.use('/admin', adminRoutes);
app.use('/messages', messageRoutes);

module.exports = app;
