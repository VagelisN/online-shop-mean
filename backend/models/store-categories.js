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

counter = 0;
function run(name) {
  return new Promise(resolve => {
    jsonItems = fs.readFile( name, async function(err, data) {
      jsonItems = JSON.parse(data);
      for (let parent in jsonItems["categories"]) {
        newCategory = new Category({name: parent});
        category = await saveInDb(newCategory);
        counter ++;
        currCategory = jsonItems["categories"][parent];
         await storeChildren(currCategory, category._id);
      }
      console.log("FINISHED");
      resolve();
    });
  });
}

async function storeChildren(children, parentId) {
  return new Promise(async resolve =>{
    if(!children) {
      resolve();
      return;
    }
    for( child in children) {
      newCategory = new Category({name: child, parentId: parentId});
      counter++;
      console.log(counter);
      category = await saveInDb(newCategory);
      await storeChildren (children[child],category._id);
    }
    resolve();
  });
}

async function fillCategories() {
  await connectToDb();
  await run('categories.json');

}

fillCategories();
