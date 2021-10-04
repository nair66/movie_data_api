const path = require('path');
const express = require('express');
const validator = require('validator');
const { movie } = require('../mongoose/models');
const { application } = require('express');
require('../mongoose/connect');

const app = express();

const PORT = process.env.PORT || 8000;
publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));
app.use(express.json()); // for parsing application/json

// app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

const MovieInfo = (queryparam) => {
  movieData = {};

  if (queryparam.name) {
    movieData.name = queryparam.name;
  }
  if (queryparam.img) {
    movieData.img = queryparam.img;
  }
  if (queryparam.summary) {
    movieData.summary = queryparam.summary;
  }

  return movieData;
};

//*View all movies
app.get('/movies', async (req, res) => {
  await movie
    .find({})
    .then((movies) => {
      res.status(200).send(JSON.stringify(movies));
    })
    .catch((err) => {
      console.log('Error while fetching movies', err);
      res.status(500).send({ error: 'Could not fetch all movies' });
    });
});

//*Create movie
app.post('/movie', async (req, res) => {
  if (!req.query.name || !req.query.img || !req.query.summary) {
    res.status(400).send({ error: 'Please provide all necessary info : name, img, summary ' });
    return;
  }

  let movieData = MovieInfo(req.query);

  await movie
    .create(movieData)
    .then((doc) => {
      document = doc._doc;
      if (document) {
        res.send({ ...document, message: 'Successfully added new movie' });
      }
    })
    .catch((err) => {
      res.status(500).send({ error: 'Could not add new movie info' });
      console.log(err);
    });
});

//*Update movie
app.put('/movie', async (req, res) => {
  let movieData = MovieInfo(req.query);

  if (!req.query.id) {
    res.status(400).send({ message: 'Please provide movie id to update' });
    return;
  }

  if (!req.query.name && !req.query.img && !req.query.summary) {
    res.status(400).send({ error: 'Please provide some information to update : name, img, summary ' });
    return;
  }

  await movie
    .findByIdAndUpdate(req.query.id, movieData)
    .then((doc) => {
      if (!doc) {
        return res.status(400).send({ error: 'Cannot find any movie matching that ID' });
      }
      document = doc._doc;
      res.send({ message: 'Successfully updated movie info' });
    })
    .catch((err) => {
      res.status(500).send({ Error: 'Could not update movie data' });
      console.log(err);
    });
});

//*Delete movie
app.delete('/movie', async (req, res) => {
  if (!req.query.id) {
    res.status(400).send({ message: 'Please provide movie id to delete' });
    return;
  }

  await movie
    .findByIdAndDelete(req.query.id)
    .then((doc) => {
      if (!doc) {
        return res.status(400).send({ error: 'Cannot find any movie matching that ID' });
      }
      res.send({ message: 'Successfully deleted movie' });
    })
    .catch((err) => {
      res.status(500).send({ Error: 'Could not delete movie' });
      console.log(err);
    });
});

app.listen(PORT, () => {
  console.log(`Server runnning on port ${PORT}`);
});
