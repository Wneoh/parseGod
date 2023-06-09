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

    const oriTests = [
        'WBC',
        'RBC',
        'Hemoglobin',
        'Hematocrit',
        'MCV',
        'MCH', 
        'MCHC',  
        'RDW - CV',  
        'Platelet',  
        'Neutrophils', 
        'Lymphocytes',  
        'Monocytes',  
        'Eosinophils',  
        'Basophils - %',  
        'Absolute Neutrophils',  
        'Absolute Lymphocytes',  
        'Absolute Monocytes',  
        'Absolute Eosinophils',  
        'Basophils',
        'Glucose',
        'BUN',
        'Creatinine',
        'eGFR (Non-African American)',
        'eGFR (African American)',
        'BUN/Creatinine Ratio',
        'Sodium',
        'Potassium',
        'Chloride',
        'Bicarbonate',
        'Calcium',
        'Total Protein',
        'Albumin',
        'Globulin',
        'Albumin/Globulin Ratio',
        'Total Bilirubin',
        'Direct Bilirubin',
        'AST (Aspartate aminotransferase)',
        'ALT (Alanine aminotransferase)',
        'ALP (Alkaline Phosphatase)',
        'GGT',
        'HbA1c, Glycosylated Hemoglobin',
        'Insulin',
        'Uric Acid',
        'Cholesterol, Total',
        'Triglycerides',
        'HDL, Cholesterol',
        'LDL Calculated',
        'Cholesterol/HDL Ratio',
        'Lipoprotein (a)',
        'Homocysteine',
        'C-Reactive Protein, Quant',
        'TSH-DXI',
        'Free T4 - DXI',
        'Free T3 - DXI',
        'Thyroglobulin Antibodies',
        'Thyroid Peroxidase (TPO) Ab - DXI',
        'Prolactin - DXI',
        'LH - DXI',
        'FSH - DXI',
        'DHEA-Sulfate - DXI',
        'Testosterone - DXI',
        'Free Testosterone',
        'Bioavailable Testosterone',
        'SHBG',
        'Estrone-MSS',
        'Pregnenolone- MSS',
        'Progesterone - DXI',
        'IGF-1',
        'Cortisol - DXI',
        'Estradiol - DXI',
        'Vitamin D - DXI',
        'Ferritin',
        'Vitamin B12, Diluted - DXI',
        'Folate, Serum - DXI',
    ];
    // Iterate over the JSON data
    for (const obj of jsonArray) {
        const tests = obj.Texts;

        const isDecimalOrNumberWithRange = /^-?\d+(\.\d+)?|<[0-9]+|>[0-9]+$/;
        tests.forEach((test,idx,array) => {
            const testName = decodeURIComponent(test.R[0].T);
            const next = array[idx + 1] || null;

            if ((/Result/).test(testName)) {
                console.log("---------");
            }
            //console.log(testName);
            if (oriTests.includes(testName)) {
                const point = next.R[0].T;

                if (isDecimalOrNumberWithRange.test(point)){
                    console.log(`${testName} : ${point}`);
                }

            }
        });

  
    }

  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});

};