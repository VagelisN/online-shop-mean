fs = require('fs');
var parser = require('xml2json');
const mongoose = require('mongoose');

Category = require('./categories');



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

fs.readFile( './items-temp.xml', function(err, data) {
    var json = parser.toJson(data);
    let mew = JSON.parse(json);

    var i ;
    console.log( mew.Items.Item.length);
    for (i=0; i < mew.Items.Item.length; i++)
    {
      let j;
      parentId = undefined;
      for (j = 0; j < mew.Items.Item[i].Category.length; j++ )
      {
        console.log(mew.Items.Item[i].Category[j]);
        let currCategory = mew.Items.Item[i].Category[j];
       wait1 = Category.findOne({ name: currCategory});

       wait1.then(category => {
            // if category was not found insert it with parent id the id of the previously found cat
            let newCategory;
            if (!category) {
              if(parentId === undefined) {
                newCategory = new Category({name: currCategory});
              } else {
                 newCategory = new Category({name: currCategory, parentId: parentId});
              }

              wait2 = newCategory.save();
              wait2.then(result => {
                console.log(result);
              })
              .catch(err => {
                console.log(err);
              });
            } else { //category already in just save the id to be used as a parent
              parentId = category.parentId;
            }
          })
      }
    }
 });
