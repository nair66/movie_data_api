const mongoose = require('mongoose');

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.u1to9.mongodb.net/movie?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log('Successfully connected to DB');
  })
  .catch((err) => {
    console.log('Unable to connect to DB', err.message);
  });

module.exports = mongoose;
