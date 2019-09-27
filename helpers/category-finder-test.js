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
  });
}


function findPath(categoryId,path) {
  return new Promise(resolve =>{
    Category.findOne({ _id: categoryId}, function (err, item){
      if (err) {
        console.log(err);
        resolve();
        return
      }
      path.unshift(item._id, item.name);
      if(item.parentId != null) {
        findPath(item.parentId, path);
        resolve();
      }
      else {
        resolve();
      }
    });
  })
}

connectToDb();
setTimeout(()=> {console.log("finished")},2000);
let path = [];
findPath("5d7529a11b8d142f5b13dc14", path);
setTimeout(()=> {
console.log(path);
},2000);




