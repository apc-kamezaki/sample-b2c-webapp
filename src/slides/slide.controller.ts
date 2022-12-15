import { Request, Response } from 'express';
import got from 'got';

export const slide = async (req: Request, response: Response) => {
  await got(`${process.env.BACKEND_WEB_HOST}/${req.params.id}.html`)
    .then((gotRes) => response.send(gotRes.body).status(200))
    .catch((e) => {
      console.error(e.message);
      response.status(500).end();
    });
};
