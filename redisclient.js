   
    
/*
use:  localhost:3000/api/search?query=Nigeria

responseTime:  middleware.


*/

const express = require('express');
const responseTime = require('response-time')
const axios = require('axios');
const redis = require('redis');

const app = express();
const port = 3000 ;

const client = redis.createClient();

client.on('error', (err) => {
  console.log("Error " + err);
});


app.use(responseTime());


// create an api/search route
app.get('/api/search', (req, res) => {

  const query = (req.query.query).trim();
  console.log("query param: ", query);

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${query}`;
  
  return client.get(`wikipedia:${query}`, (err, result) => {
    // If that key exist in Redis store
    if (result) {
      const resultJSON = JSON.parse(result);
      return res.status(200).json(resultJSON);
    } else { 
      return axios.get(searchUrl)
        .then(response => {
          const responseJSON = response.data;
          console.log('responseJSON: ', responseJSON) ;
          
          client.setex(`wikipedia:${query}`, 3600, JSON.stringify({ source: 'Redis Cache', ...responseJSON, }));
          return res.status(200).json({ source: 'Wikipedia API', ...responseJSON, });
        })
        .catch(err => {
          return res.json(err);
        });
    }
  });
});

app.listen(port, () => {
  console.log('Server listening on port: ', port);
});