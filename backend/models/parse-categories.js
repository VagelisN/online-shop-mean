var parser = require('xml2json');
fs = require('fs');
const mongoose = require('mongoose');
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





function parseFile(name, jsonCategories) {
  return new Promise(resolve => {
    jsonItems = fs.readFile(name ,function(err, data) {
      let json = parser.toJson(data);
      jsonItems = JSON.parse(json);
      console.log(jsonItems);
      console.log(jsonItems.Items.Item);

        for (let i=0; i < jsonItems.Items.Item.length; i++) {
          currCategory = jsonCategories["categories"];
          for (let j = 0; j < jsonItems.Items.Item[i].Category.length; j++ ) {
            if (!currCategory[jsonItems.Items.Item[i].Category[j]]) {
              currCategory[jsonItems.Items.Item[i].Category[j]] = {};
            }
            currCategory=currCategory[jsonItems.Items.Item[i].Category[j]];
          }
        }
        resolve(jsonCategories);
    });
  });
}

async function run() {
  let jsonCategories = {
    "categories": {
    }
  };
  for(let m =0 ; m< 40; m++) {

    name = './ebay-data/items-'+m+'.xml';

    await parseFile(name,jsonCategories);
  }
  newjson = JSON.stringify(jsonCategories);
  fs.writeFile('categories.json',newjson , err => {
    console.log(err);
  });
}

run();
