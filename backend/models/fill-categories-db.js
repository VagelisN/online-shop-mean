fs = require('fs');
var parser = require('xml2json');
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

function findinDb(currCategory) {

  return new Promise(resolve => {
    Category.findOne({ name: currCategory})
          .then( category => {
            resolve(category);
          });
  });

}

function saveInDb(newCategory) {
  return new Promise(resolve => {
  newCategory.save()
  .then(result => {
    resolve(result);
  })
  .catch(err => {
    console.log(result);
    resolve(result);
  });
  });
}

function run(name) {
  return new Promise(resolve => {
    jsonItems = fs.readFile( name, async function(err, data) {
      var json = parser.toJson(data);
      jsonItems = JSON.parse(json);
      var i;
      console.log(jsonItems.Items.Item.length)
      for (i=0; i < jsonItems.Items.Item.length; i++) {
        let j;
        parentId = undefined;

        for (j = 0; j < jsonItems.Items.Item[i].Category.length; j++ ) {
          let currCategory = jsonItems.Items.Item[i].Category[j];
          //console.log(currCategory);
          category = await findinDb(currCategory);
              // if category was not found insert it with parent id the id of the previously found cat
              let newCategory;
              if (!category) {
                if(parentId === undefined) {
                  newCategory = new Category({name: currCategory});
                } else {
                   newCategory = new Category({name: currCategory, parentId: parentId});
                }
                let result = await saveInDb(newCategory);
                parentId = result._id;
              } else { //category already in just save the id to be used as a parent
                parentId = category._id;
              }
        }
      }
      console.log("FINISHED");
      resolve();
    });
  });
}


async function fillCategories() {
  await connectToDb();
  var k;
  for(k = 1; k < 40; k++)
  {
    name = './items-' + k + '.xml';
    console.log(name);
    await run(name);
  }

}

fillCategories();
