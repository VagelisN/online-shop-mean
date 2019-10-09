var parser = require('xml2json');
fs = require('fs');
const mongoose = require('mongoose');
Αuction = require('./../backend/models/auctions');
Category = require('./../backend/models/categories');

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
      sellerId = '5d9dcf27fc79ea25a4d42e18'
      sellerUsername = 'test'
      sellerRating = 0;
      address = 'Leof. Al. Panagouli 60, Ilioupoli 163 43, Greece'
      latitude = '37.9365268'
      longitude = '23.7614008'
      country =' Greece'
      categoryNames = [];
      categoryIds = '';
      description = '';
        for (let i=0; i < jsonItems.Items.Item.length; i++) {
          //console.log(i);
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
            image: 'https://localhost:3000/images/default-image.jpg',
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
          categoryIds = '';
        }
        resolve();
    });
  });
}

async function run() {
  await connectToDb();
  for(let m =0 ; m< 40; m++) {
    console.log(m);
    name = './items-'+m+'.xml';

    await parseFile(name);
  }
}

run();
