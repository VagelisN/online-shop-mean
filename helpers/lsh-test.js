const RandomWords = require('random-words')
const Lsh = require('@agtabesh/lsh')

const mongoose = require('mongoose').set('debug', true);
Auction = require('./auctions');

function connectToDb () {
  return new Promise(resolve => {
    mongoose
    .connect(
      "mongodb://127.0.0.1:27017/online-shop",
      {useNewUrlParser: true},
      { useUnifiedTopology: true }
      )
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

function getAuctions(ids, documents) {

  return new Promise(resolve => {
    Auction.find()
      .then(results => {
        for ( let i=0; i< results.length; i++) {
          ids.push(results[i]._id);
          text = '';
          text += results[i].name + ' ' + results[i].categoriesId;
          documents.push(text);
        }
        resolve();
      })
      .catch(err => {
        console.log(err);
        resolve();
      });
  });

}




async function run() {
  await connectToDb();
  const config = {
    storage: 'memory',
    shingleSize: 6,
    numberOfHashFunctions: 30
  }
  const lsh = Lsh.getInstance(config)

  const numberOfDocuments = 18000;
  const ids = []
  const documents = []

  // generate random documents containing 100 words each
  // for (let i = 0; i < numberOfDocuments; i += 1) {
  //   documents.push(RandomWords({ min: 100, max: 100 }).join(' '))
  // }

  await getAuctions(ids, documents);

  // add documents just created to LSH with their id
  for (let i = 0; i < numberOfDocuments; i += 1) {
    lsh.addDocument(i, documents[i]);
  }

  // search for a specific document with its id and custom bicketSize
  // you can also perform a query using a string by passing text instead of id
  // bucket size are dynamic. feel free to change it to find proper one
  const q = {
    //id: 1,
     text: "Wedding Bridal Gown Dress  VICTORIA'S SECRET Great silicone bra  Koret Green/Navy Plaid Casual Top  CLARKS TRAVELLER SHOES MEN BRN  NR NIKE ACG Mens Tennis Shoes BLACK BRWN ",
    bucketSize: 10
  }
  const result = lsh.query(q)

  // this will print out documents which are candidates to be similar to the one we are looking for
  console.log(result)
  console.log(documents[result[0]]);
}

run();
