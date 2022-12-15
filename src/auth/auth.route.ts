import express from 'express';

import { signIn, signOut, redirect } from './auth.controller.js';

export default express.Router()
  .get('/signin', signIn)
  .get('/signout',signOut)
  .get('/redirect', redirect);
