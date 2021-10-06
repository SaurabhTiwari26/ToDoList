const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://SaurabhTiwari26:Messi@10@cluster0.ee4pd.mongodb.net/todolistDB",{useNewUrlParser: true , useUnifiedTopology: true });

const itemSchema = {
    name:String
};
const Item = mongoose.model("Item",itemSchema);

const item1= new Item ({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name:"<-- Hit this to delete an item"
});

const defaultItems= [item1,item2,item3];

const listSchema = {
    name:String,
    items:[itemSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
    
    Item.find({},function(err,foundItems){

        if(foundItems.length ===0){
            Item.insertMany(defaultItems);
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle: "Today", newListItems: foundItems});
        }
  
    });
    
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundItem){
        if (!err){
            if(!foundItem){
                //Create a new list
                const list = new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+ customListName);
            }
            else{
                //show an existing list
                res.render("list",{listTitle: foundItem.name, newListItems: foundItem.items});
            }
            
        }
        else{
            console.log("found");

        }
    });
     
     
    
 
 });

app.post("/",function(req,res){

    const itemName = req.body.newItem;
    const listName= req.body.List;
    const item = new Item({
        name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }
   

});

app.post("/delete",function(req,res){
    const id = req.body.checkbox;
    const listName= req.body.listName;

    if (listName === "Today"){

        Item.findByIdAndRemove(id,function(err){
            if(!err){
                console.log("Successfully Deleted");
                res.redirect("/");
            }
        });
    }
    else {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,foundList){
            if(!err){
                res.redirect("/" + listName );
            }
        });
    }
        
});


let port = process.env.PORT;
if (port == null || port == ""){
    port = 3000;
}
app.listen( port ,function(){
    console.log("The server is running on 3000");
});
