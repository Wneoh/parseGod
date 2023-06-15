import fs from "fs";
import PDFParser from "pdf2json";
import axios from "axios";

export const parsePdf = (req, res) => {
    const pdfParser = new PDFParser();
    const { url : pdfUrl,labType } = req.body;
    
    pdfParser.on('pdfParser_dataReady',  pdfData => {
        res.status(200).send(generateResponse(labType,JSON.parse(JSON.stringify(pdfData)))); // Move the response here
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
};

const generateResponse = (labType,jsonData) => {
    const result = [];
    try {
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
            'Testosterone - DXI M/F SUPP',
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
            'Vitamin B12 - DXI',
            'Folate, Serum - DXI',
            'PSA, Total - DXI'
        ];

        const labcorpCommonTests = [
            'WBC',
            'RBC',
            'Hemoglobin',
            'Hematocrit',
            'MCV',
            'MCH',
            'MCHC',
            'RDW',
            'Platelets',
            'Neutrophils',
            'Lymphs',
            'Monocytes',
            'Eos',
            'Basos',
            'Neutrophils (Absolute)',
            'Lymphs (Absolute)',
            'Monocytes(Absolute)',
            'Eos (Absolute)',
            'Baso (Absolute)',
            'Immature Granulocytes',
            'Immature Grans (Abs)',
            'Glucose',
            'BUN',
            'Creatinine',
            'eGFR',
            'BUN/Creatinine Ratio',
            'Sodium',
            'Potassium',
            'Chloride',
            'Carbon Dioxide, Total',
            'Calcium',
            'Protein, Total',
            'Albumin',
            'Globulin, Total',
            'A/G Ratio',
            'Bilirubin, Total',
            'Alkaline Phosphatase',
            'AST (SGOT)',
            'ALT (SGPT)',
            'Cholesterol, Total',
            'Triglycerides',
            'HDL Cholesterol',
            'VLDL Cholesterol Cal',
            'LDL Chol Calc (NIH)',
            'LDL/HDL Ratio',
            'TSH',
            'Triiodothyronine (T3), Free',
            'T4,Free(Direct)',
            'LH',
            'FSH',
            'Testosterone',
            'Free Testosterone(Direct)',
            'Pregnenolone, MS',
            'Prostate Specific Ag',
            'Reflex Criteria',
            'Estrone, Serum, MS',
            'Ferritin',
            'Hemoglobin A1c',
            'Folate (Folic Acid), Serum',
            'DHEA-Sulfate',
            'Cortisol',
            'Prolactin',
            'Estradiol',
            'Insulin-Like Growth Factor I',
            'Vitamin D, 25-Hydroxy',
            'Lipoprotein (a)',
            'Homocyst(e)ine',
            'Uric Acid',
            'Insulin',
            'C-Reactive Protein, Cardiac',
            'Thyroglobulin Antibody',
            'Vitamin B12',
            'Progesterone',
            'Thyroid Peroxidase (TPO) Ab',
            'Serum',
        ];

        if (labType == 'labcorps') {

            // Iterate over the JSON data
            for (const obj of jsonArray) {
                const tests = obj.Texts;

                const isDecimalOrNumberWithRange = /^-?\d+(\.\d+)?|<[0-9]+|>[0-9]+$/;
                tests.forEach((test,idx,array) => {
                    const testName = decodeURIComponent(test.R[0].T);

                    if (labcorpCommonTests.includes(testName)) {
                        let next = array[idx + 1] || null;
                        let point = decodeURIComponent(next.R[0].T);

                        if (/^(0[0-9])/.test(point)) {
                            next = array[idx + 2] || null;
                            point = decodeURIComponent(next.R[0].T) || 'N/A';
                        }
                        if (isDecimalOrNumberWithRange.test(point) && !result.find(r => r.test === testName)){
                            result.push({
                                test: testName,
                                value: point
                            })
                        }
                    }
                });
            }
        } else {
            // Iterate over the JSON data
            for (const obj of jsonArray) {
                const tests = obj.Texts;

                const isDecimalOrNumberWithRange = /^-?\d+(\.\d+)?|<[0-9]+|>[0-9]+$/;
                tests.forEach((test,idx,array) => {
                    const testName = decodeURIComponent(test.R[0].T);
                    const next = array[idx + 1] || null;

                    if (oriTests.includes(testName)) {
                        const point = decodeURIComponent(next.R[0].T);
                        if (isDecimalOrNumberWithRange.test(point) && !result.find(r => r.test === testName)){
                            result.push({
                                test: testName,
                                value: point
                            })
                        }
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }

    return result;
}