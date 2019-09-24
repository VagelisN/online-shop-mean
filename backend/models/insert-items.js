var parser = require('xml2json');
fs = require('fs');
const mongoose = require('mongoose');
Αuction = require('./auctions');
Category = require('./categories');

function connectToDb () {
  return new Promise(resolve => {
    mongoose
    .connect(
      "mongodb+srv://VitaNi:VtjxLdYLy39okzgc@cluster0-3lmzb.mongodb.net/online-shop?w=majority",
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

function findinDb(currCategory, parentId) {

  return new Promise(resolve => {
    Category.findOne({ name: currCategory, parentId: parentId})
          .then( category => {
            resolve(category);
          })
          .catch(err => {
            console.log(err);
            resolve(err);
          });
  });

}

function saveinDb(auction) {
  return new Promise(resolve => {
    auction.save()
    .then(result => {
      resolve(result);
    })
    .catch(err => {
      console.log(err);
      resolve(err);
    });
    });
}

function parseFile(name) {
  return new Promise(resolve => {
    jsonItems = fs.readFile( name, async function(err, data) {
      counter = 0;
      let json = parser.toJson(data);
      jsonItems = JSON.parse(json);
      startsDate = new Date('2019-09-23');
      endsDate = new Date('2019-12-25');
      sellerId = '5d8a1d06fa6bd62e320f87fe'
      sellerUsername = 'lefor'
      sellerRating = 4.5;
      address = 'Θυμάτων Πολέμου 15, Βύρωνας 162 33, Ελλάδα'
      latitude = '37.94505939398392'
      longitude = '23.768195215869127'
      country =' Greece'
      categoryNames = [];
      categoryIds = '';
      description = '';
        for (let i=0; i < jsonItems.Items.Item.length; i++) {
          console.log(i);
          parentId = undefined;
          for (let j = 0; j < jsonItems.Items.Item[i].Category.length; j++ ) {
            category = await findinDb(jsonItems.Items.Item[i].Category[j], parentId);
            parentId = category._id;
            categoryNames.push(jsonItems.Items.Item[i].Category[j]);
            if (j < jsonItems.Items.Item.length -1 ) {
              categoryIds = categoryIds + category._id +'>';
            } else {
              categoryIds = categoryIds + category._id;
            }
          }
          currItem = jsonItems.Items.Item[i];
          // console.log(currItem);
          if(currItem.Description.length >0){
            description = currItem.Description
          }
          const auction = new Αuction({
            name: currItem.Name,
            description: description,
            categoryNames : categoryNames,
            categoriesId : categoryIds,
            country: country,
            buyPrice: null,
            bids: null,
            latitude: latitude,
            longitude: longitude,
            image:null,
            startDate: startsDate,
            endDate: endsDate,
            sellerId: sellerId,
            sellerUsername: sellerUsername,
            sellerRating: sellerRating,
            address: address
          });
          await saveinDb(auction);
          counter ++;
          categoryNames = [];
        }
        resolve();
    });
  });
}

async function run() {
  await connectToDb();
  for(let m =0 ; m< 40; m++) {
    console.log(m);
    name = './ebay-data/items-'+m+'.xml';

    await parseFile(name);
  }
}

run();
