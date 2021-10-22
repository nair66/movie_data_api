const path = require('path');
const express = require('express');
const validator = require('validator');
const multer = require('multer');
require('../mongoose/connect');
const { movie } = require('../mongoose/models');
const { logger } = require('../Logger/logger');
const upload = multer();

const app = express();

const PORT = process.env.PORT || 8000;
publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));
app.use(express.json()); // for parsing application/json

app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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

const buildMovieInfo = (body, file) => {
  movieData = {};

  if (body.name) {
    movieData.name = body.name;
  }
  if (body.summary) {
    movieData.summary = body.summary;
  }
  if (file) {
    movieData.img = {
      name: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
    };
  }
  return movieData;
};

const fieldsToFetch = 'name summary img.name';

//View all movies
app.get('/movies', async (req, res) => {
  await movie
    .find({}, fieldsToFetch)
    .then((movies) => {
      res.status(200).send(JSON.stringify(movies));
    })
    .catch((err) => {
      logger.log({ level: 'error', message: `Error while fetching movies:  ${err} ` });
      res.status(500).send({ error: 'Could not fetch all movies' });
    });
});

//fetch a single movvie
app.get('/movie', async (req, res) => {
  if (!req.query.id) {
    res.status(400).send({ message: 'Please provide movie id to delete' });
    return;
  }

  await movie.findById(req.query.id, fieldsToFetch).then((doc) => {
    if (!doc) {
      return res.status(400).send({ error: 'Cannot find any movie matching that ID' });
    }
    const document = doc._doc;
    res.send({ ...document, message: 'Successfully fetched movie' });
    console.log(doc);
  });
});

// Create movie
app.post('/movie', upload.single('img'), async (req, res) => {
  if (!req.body.name.trim() || !req.file || !req.body.summary.trim()) {
    res.status(400).send({ error: 'Please provide all necessary info : name, img, summary ' });
    return;
  }

  let movieData = buildMovieInfo(req.body, req.file);
  console.log(movieData);

  await movie
    .create(movieData)
    .then((doc) => {
      document = doc._doc;
      if (document) {
        res.send({
          id: document._id,
          name: document.name,
          summary: document.summary,
          img: document.img.name,
          message: 'Successfully added new movie',
        });
      }
    })
    .catch((err) => {
      logger.log({ level: 'error', message: `Error while creating movie:  ${err} ` });
      res.status(500).send({ error: 'Could not add new movie info' });
    });
});

//Update movie
app.put('/movie', upload.single('img'), async (req, res) => {
  let movieData = buildMovieInfo(req.body, req.file);

  if (!req.body.id) {
    res.status(400).send({ message: 'Please provide movie id to update' });
    return;
  }

  if (!req.body.name.trim() && !req.body.img && !req.body.summary.trim()) {
    res.status(400).send({ error: 'Please provide some information to update : name, img, summary ' });
    return;
  }

  await movie
    .findByIdAndUpdate(req.body.id, movieData)
    .then((doc) => {
      if (!doc) {
        return res.status(400).send({ error: 'Cannot find any movie matching that ID' });
      }
      document = doc._doc;
      res.send({ message: 'Successfully updated movie info' });
    })
    .catch((err) => {
      logger.log({ level: 'error', message: `Error while updating movie:  ${err} ` });
      res.status(500).send({ error: 'Could not update movie data' });
    });
});

//Delete movie
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
      logger.log({ level: 'error', message: `Error while deleting movie:  ${err} ` });
      res.status(500).send({ error: 'Could not delete movie' });
    });
});

app.listen(PORT, () => {
  console.log(`Server runnning on port ${PORT}`);
});
