import { Request, Response } from 'express';

export const home = (req: Request, resp: Response) => {
  console.log(req.session);
  resp.render('home', { isAuthenticated: req.session.isAuthenticated })
}
