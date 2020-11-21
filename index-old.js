const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

// using ENV files
dotenv.config();
app.use(cors());
app.options('*', cors());

// GET request
app.get('/', (req, res) => {
  res.send('KREG');
});

const server = app.listen(process.env.PORT, () => {
  console.log('Server started, PORT: ' + process.env.PORT);
});