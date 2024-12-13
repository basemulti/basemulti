import { Hono } from 'hono';
import files from './routes/files';
import records from './routes/records';

export const app = new Hono()
  .basePath('/api')
  .get('/hello', (c) => {
    return c.json({
      message: 'Hello Basemulti!',
    })
  })
  .route('/files', files)
  .route('/', records);