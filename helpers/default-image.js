const mongoose = require('mongoose');
Αuction = require('./auctions');

function connectToDb () {
  return new Promise(resolve => {
    mongoose
    .connect(
      "mongodb://127.0.0.1:27017/online-shop",
      {useNewUrlParser: true})
    .then(() =>{
      console.log('Connected to database');
      resolve();
    })
    .catch(() =>{
      console.log('Connection to database failed');
      resolve();
    });
  })
}
async function run () {
  await connectToDb();
  console.log('About to add the default image to all auctions that havent got one');
  const url = 'https://localhost:3000/images/default-image.jpg';
  // This function updates the null image to a default image.
  Auction.find().then(documents => {
    console.log('Documents size: ', documents.length);
    for (let index = 0; index < documents.length; index++) {
      if (documents[index].image === null) {
        documents[index].image = url + '/images/default-image.jpg';
        documents[index].save();
        console.log('Auction %', index, ' saved.');
      }
    }
  });
  console.log('Finished updating null images.');
}

run();



