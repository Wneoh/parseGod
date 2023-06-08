import fs from "fs";
import PDFParser from "pdf2json";
import { PDFExtract } from "pdf.js-extract";

const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataReady',  pdfData => {
    fs.writeFile("./pdf_trans.json", JSON.stringify(pdfData), {}, ()=>{});
    //console.log(pdfData)
});

pdfParser.on('pdfParser_dataError',  errData => {
    console.error(errData.parserError);
});

pdfParser.loadPDF('labcorp_sample.pdf');


const pdfExtract = new PDFExtract();
const options = {}; /* see below */
let pdfData;
pdfExtract.extract('labcorp_sample.pdf', options, (err, data) => {
  if (err) return console.log(err);
  pdfData = data.pages;

  pdfData.forEach(page => {
    console.log(page.content);
  });

  fs.writeFile("./pdf.txt", JSON.stringify(pdfData), {}, ()=>{});

});
