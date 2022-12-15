import msal from '@azure/msal-node';
import { NextFunction, Request, Response } from 'express';

export const sessionGuard = (req: Request, resp: Response, next: NextFunction) => {
  console.log('authenticated', !!req.session.isAuthenticated);
  !req.session.isAuthenticated ? resp.redirect('/auth/signin') : next();
};
