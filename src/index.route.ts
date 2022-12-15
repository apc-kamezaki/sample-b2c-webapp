import express from 'express';

import { home } from './home.controller.js';

export default express.Router()
  .get('/', home)
