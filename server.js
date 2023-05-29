import express from 'express';
import indexRoute from './routes/index';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(indexRoute);
app.listen(PORT);
