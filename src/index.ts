import 'dotenv/config.js';

import express from 'express';
import handlebars from 'express-handlebars';
import session from 'express-session';
import morgan from 'morgan';

import slides from './slides/index.js';
import auth from './auth/index.js';
import root from './index.route.js';
import { sessionGuard } from './middlewares/index.js';

const app = express();

app.engine('hbs', handlebars.engine({
  extname: 'hbs',
  layoutsDir: './views//layouts'
}));
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(session({
  secret: process.env.SESSON_SECRET || '',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false // set this to true on production
  }
}));
app.use(morgan('tiny'));
app.use('/slides', sessionGuard, slides);
app.use('/auth', auth);
app.get('/', root);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`up and running on port : ${port}`);
});
