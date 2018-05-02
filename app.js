// init
const express = require('express');
var app = module.exports = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Bing = require('node-bing-api')({
  accKey: "a8d9182486264297844e71cb342513dc"
});
const searchTerm = require('./models/searchTerm');

app.use(bodyParser.json());
app.use(cors());

// Connecting to MONGODB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:8090/searchTerms')

// Get All Search terms from the database
app.get('/api/searches', (req, res, next) => {
  searchTerm.find({}, (err, data) => {
    res.json(data);
  });
});

// Get call for image search with params that are required and not required
app.get("/api/imagesearch/:searchVal*", (req, res, next) => {
  var {
    searchVal
  } = req.params;
  var {
    offset
  } = req.query;

  var data = new searchTerm({
    searchVal,
    searchDate: new Date()
  });

  // Save to searchTerm collection
  data.save(err => {
    if (err) {
      res.send('Error Occurred while saving to database');
    }
    // return res.json(data);
  });



  var searchOffset=1;

  //Does offset Exist
  if(offset){
    if(offset === 1){
      offset=0;
      searchOffset = 1;
    }
    else if (offset>1) {
      searchOffset = offset+1;
    }
  }

  Bing.images(searchVal, {
    top: (10 * searchOffset),
    skip: (10 * offset)
  }, (err, rez, body) => {

    var bingData = [];
    for (var i = 0; i < 10; i++) {
      console.log(body.value[i].webSearchUrl);
      bingData.push({
        url: body.value[i].webSearchUrl,
        snippet: body.value[i].name,
        thumbnail: body.value[i].thumbnailUrl,
        context: body.value[i].hostPageDisplayUrl
      });
    }
    res.json(bingData);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Everything works fine !!");
})
