import express from 'express';

import { slide } from './slide.controller.js';

export default express.Router().get('/:id', slide);
