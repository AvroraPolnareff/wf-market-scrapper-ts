import express from 'express';

const httpServer = express()

httpServer.get<{secret: string}, any, any, {lal: string}>('/api/v1/:secret', (req, res) => {
  res.send(req.query);
})


export {httpServer}