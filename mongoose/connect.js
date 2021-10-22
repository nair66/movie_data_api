const { logger } = require('../Logger/logger');
const mongoose = require('mongoose');

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log('Successfully connected to DB');
  })
  .catch((err) => {
    logger.log({ level: 'error', message: `Unable to connect to DB ${err.message}` });
    process.exit();
  });

module.exports = mongoose;
