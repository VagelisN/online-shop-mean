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

fs.readFile( './items-0.xml', function(err, data) {
    var json = parser.toJson(data);
    let mew = JSON.parse(json);

    var i ;
    for (i=0; i < mew.Items.Item.length; i++)
    {
      let j;
      parentId = undefined;
      for (j = 0; j < mew.Items.Item[i].Category.length; j++ )
      {
        console.log(mew.Items.Item[i].Category[j]);
        let currCategory = mew.Items.Item[i].Category[j];
        Category.findOne({ name: currCategory})
          .then(category => {
            console.log(category);
            // if category was not found insert it with parent id the id of the previously found cat
            let newCategory;
            if (!category) {
              if(parentId === undefined) {
                newCategory = new Category({name: currCategory});
              } else {
                 newCategory = new Category({name: currCategory, parentId: parentId});
              }
              newCategory.save()
                .then(result => {
                  console.log(result);
                })
                .catch(err => {
                  console.log(err);
                });
            } else { //category already in just save the id to be used as a parent
              parentId = category.parentId;
            }
          });
      }
    }
 });
