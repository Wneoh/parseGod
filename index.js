import 'dotenv/config';
import express from 'express';
import { parsePdf } from './controllers/pdfController.js';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.headers['bst-auth-token'] === process.env.APIKEYAUTH) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.post('/parse-pdf', parsePdf);
// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
