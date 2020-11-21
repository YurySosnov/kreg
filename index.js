const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const client = require('./db-client');
const app = express();


// using ENV files
dotenv.config();

// middleware
app.use(cors());
app.use(express.json());

app.options('*', cors());

// GET
app.get('/', (req, res) => {
    res.send('KREG');
});

// POST

app.post('/auth', async (req, res) => {
   try {
       const {login, password} = req.body;
       await client.auth({login, password}, req.headers)
           .then(token => {
               res.send({
                   code: 'token',
                   token
               });
           })
           .catch(err => {
               console.error(err);
           });
   } catch (err) {
       console.error(err.message);
   }
});

app.post('/register', async (req, res) => {
   try {
       const {login, email, password, confirmPassword} = req.body;
       if (password !== confirmPassword) {
           res.json({
               code: 'passwordConfirmationError',
               message: 'password confirm is wrong'
           });
       }
       const emailAlreadyExist = await client.checkEmail(email);
       const loginAlreadyExist = await client.checkLogin(login);

       if (!emailAlreadyExist && !loginAlreadyExist) {
           const registered = await client.register({login, password, email});
           if (registered) {
               res.json({
                   message: 'user registered'
               });
           } else {
               res.json({
                   message: 'register filed'
               });
           }
       } else {
           res.json({
               code: 'userAlreadyExist',
               message: 'user already exist',
               email: emailAlreadyExist,
               login: loginAlreadyExist
           });
       }
   } catch (err) {
       console.error(err.message);
       res.json({
           error: err.message
       });
   }
});

app.post('/request', async (req, res) => {
   try {
       const {token} = req.body;
       client.checkToken(token, req.headers)
           .then(result => {
               res.json({
                   result
               });
           });
   } catch (err) {
       console.error(err.message);
       res.json({
           error: err.message
       });
   }
});

const server = app.listen(process.env.PORT, () => {
    console.log('Server started, PORT: ' + process.env.PORT);
});
