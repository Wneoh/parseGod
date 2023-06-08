import express from 'express';
import { parsePdf } from './controllers/pdfController.js';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/parse-pdf',parsePdf);

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
