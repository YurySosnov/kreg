const config = require('dotenv');

config.config();

module.exports.PROFILE = process.env.PROFILE || 'dev';

// DataDog HQ Required parameters.
module.exports.DD_ENV = process.env.PROFILE || 'dev';

module.exports.PORT = process.env.PORT || 3000;
module.exports.BASE_URI = process.env.BASE_URI || `http://localhost:${exports.PORT}`;
