'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require("body-parser");
const dns = require('dns')
mongoose.connect(process.env.MONGO_URI);



var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

var urlSchema = mongoose.Schema({
  originalUrl: {
    type: String,
    unique: true,
    required: true
  },
  newUrl: Number
})

var Url = mongoose.model('Url', urlSchema);

var originalUrl = "";
var shortCount = 0;
var error = false;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({extended: true}));

app.post("/api/shorturl/new", function(req, res){
  originalUrl = req.body.url;
  console.log(req.body.url);
  console.log(req.body);
  dns.lookup(originalUrl, function(err, address){
    if (err){
      error = true;
    }
  });
  var newUrl = new Url({'originalUrl': originalUrl, 'shortUrl': shortCount++});
  res.redirect("/api/shorturl/new");
});


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/shorturl/new", function (req, res) {
  if (error === true){
    res.json({"error": "Invalid URL"}) 
  } else {
    Url.findOne({'originalUrl': originalUrl}, function(err, data){
      res.json({original_url: data.originalUrl, short_url: data.shortUrl});
    });
  }
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});