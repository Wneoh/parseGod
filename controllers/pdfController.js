import fs from "fs";
import PDFParser from "pdf2json";
import axios from "axios";

export const parsePdf = (req, res) => {
    const pdfParser = new PDFParser();
    const { url : pdfUrl } = req.body;
    pdfParser.on('pdfParser_dataReady',  pdfData => {
        fs.writeFile("./pdf_trans.json", JSON.stringify(pdfData), {}, ()=>{});
        res.status(200).send(JSON.stringify(pdfData)); // Move the response here
    });

    pdfParser.on('pdfParser_dataError',  errData => {
        console.error(errData.parserError);
        res.status(500).send({ error: "Error parsing PDF" });
    });

    // Load the PDF from the URL
    axios.get(pdfUrl, { responseType: "arraybuffer" })
    .then(response => {
        const pdfBuffer = Buffer.from(response.data, "binary");
        pdfParser.parseBuffer(pdfBuffer);
    })
    .catch(error => {
        console.error("Error fetching PDF from URL:", error);
        res.status(500).send({ error: "Error fetching PDF from URL" });
    });

/*
    // Specify the file path
const filePath = './pdf_trans.json';

// Read the file content
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    // Parse the file content into a JSON object
    const jsonData = JSON.parse(data);


    // Regex patterns for extracting test name and result
    const testNameRegex = /T":"([^"]+)/;
    const resultRegex = /"S":(\d+)/;

    const jsonArray = jsonData.Pages;

    // Iterate over the JSON data
    for (const obj of jsonArray) {
        console.log(obj);
    const testNameMatch = obj.Texts.R[0].T.match(testNameRegex);
    const resultMatch = obj.Texts.R[0].S.toString().match(resultRegex);

    // Extracted test name and result
    const testName = testNameMatch ? testNameMatch[1] : '';
    const result = resultMatch ? resultMatch[1] : '';

    console.log('Test Name:', testName);
    console.log('Result:', result);
    }

  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});*/

};