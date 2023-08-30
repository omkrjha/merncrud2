// imports
const express = require('express'); // Express web server framework.
const app = express();
const PORT = process.env.PORT || 5009;

const session = require('express-session');
require('dotenv').config();

// database connection
const dbConfig = require('./config/dbConfig');

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static('uploads'));

// setting template engine
app.set('view engine', 'ejs');

// route prefix
app.use('', require('./routes/routes'));

app.get('/', (req, res) => {
  res.send('hello world');
});

app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});
