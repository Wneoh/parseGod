import axios from "axios";
import {PDFExtract} from 'pdf.js-extract';

export const parsePdf = (req, res) => {
    const { url : pdfUrl , firstName, lastName, gender, birthday, profileMustMatch } = req.body;
    const pdfExtract = new PDFExtract();

    // Load the PDF from the URL
    axios.get(pdfUrl, { responseType: "arraybuffer" })
    .then(response => {
        const pdfBuffer = Buffer.from(response.data, "binary");
        pdfExtract.extractBuffer(pdfBuffer)
        .then(data => { 
            const result = generateResponse({
                validatingFirstname: firstName, validatingLastname: lastName, validatingGender: gender, validatingDOB: birthday
            }, profileMustMatch, data);
            if (result.status) {
                res.status(200).send(result.data) 
            } else {
                res.status(500).send({ error : result.msg}) 
            }
        })
        .catch(err=> console.log(err));
    })
    .catch(error => {
        console.error("Error fetching PDF from URL:", error);
        res.status(500).send({ error: "Error fetching PDF from URL" });
    });
};

const generateResponse = ({validatingFirstname, validatingLastname, validatingGender, validatingDOB}, profileMustMatch, jsonData) => {
    const result = [];
    try {
        const pages = jsonData.pages;

        const aventusTests = [
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
            'PSA, Total - DXI',
            'Testosterone - DXI M/F SUPP',
            'Vitamin B12 - DXI',
        ];

        const labcorpCommonTests = [
            'eGFR If NonAfricn Am',
            'eGFR If Africn Am',
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

        let collectionDate = '';
        let labType = '';
        let firstName = '';
        let lastName = '';
        let testo;
        let album;
        let shbg;
        let firstPush = true;

        // Iterate over pages
        pages.forEach(page => {
            const content = page.content;
            const isDecimalOrNumberWithRange = /^-?\d+(\.\d+)?|<[0-9]+|>[0-9]+|< [0-9]+|>[0-9]+$/;
            for (const text of content) {
                const targetText = text.str;                    
                if (targetText.includes('Laboratory Corporation of America')) {
                    labType = 'Labcorp';
                    break;
                }
                if (targetText.includes('ABL MEDICAL CARE, LLC')) {
                    labType = 'Aventus';
                    break;
                }
            }
            if (labType === 'Aventus') {
                content.forEach((text,idx) => {
                    const targetText = text.str;                    
                    if (targetText.trim() === 'Patient:') {
                        const name = content[idx + 2].str;
                        const nameParts = name.split(',');
                        firstName = nameParts[1].trim();
                        lastName = nameParts[0].trim();
                        if (profileMustMatch) {
                            if (firstName !== validatingFirstname || lastName !== validatingLastname) {
                                throw new Error('First Name and Last Name not match.');
                            }
                        }
                    }

                    if (collectionDate === '' && targetText.includes("Collection Date:")) {
                        collectionDate = content[idx + 2].str;
                    }

                    if (aventusTests.includes(targetText.trim())) {
                        let point = content[idx + 2].str
                        if (targetText.trim() == "Estrone-MSS" || targetText.trim() == "Pregnenolone- MSS" ) {
                            point = content[idx + 5].str
                        }
                        if (isDecimalOrNumberWithRange.test(point) && !result.find(r => r.test === targetText)){
                            result.push({
                                test: targetText,
                                value: point
                            })
                        }
                    }
    
                })
            } else if (labType === 'Labcorp') {
                content.forEach((text,idx) => {
                    const targetText = text.str;                    
                    if (targetText.trim() === 'Patient Details') {
                        const name = content[idx + 2].str;
                        const nameParts = name.split(',');
                        firstName = nameParts[1].trim();
                        lastName = nameParts[0].trim();
                        if (profileMustMatch) {
                            if (firstName !== validatingFirstname || lastName !== validatingLastname) {
                                throw new Error('First Name and Last Name not match.');
                            }
                        }
                    }

                    if (collectionDate === '' && targetText.includes("Date Collected:")) {
                        collectionDate = content[idx + 2].str;
                    }

                    if (labcorpCommonTests.includes(targetText.trim())) {
                        let point = content[idx + 4].str

                        if (targetText.trim() === "LDL Chol Calc (NIH)" || targetText.trim() === "eGFR If NonAfricn Am" || targetText.trim() === "eGFR If Africn Am") {
                            point = content[idx + 2].str
                        }
                        if (targetText.trim() === "Testosterone") {
                            testo = point;
                        }
                        if (targetText.trim() === "Albumin") {
                            album = point;
                        }
                        if (targetText.trim() === "Serum" && isDecimalOrNumberWithRange.test(point)) {
                            shbg = point;
                        }  

                        if (isDecimalOrNumberWithRange.test(point) && !result.find(r => r.test === targetText)){
                            result.push({
                                test: targetText === 'Serum' ? 'Sex Horm Binding Glob, Serum' : targetText,
                                value: point
                            })
                        }
                    }
    
                })
                if ((shbg && album && testo) && firstPush) {
                    const bioavailableTesto = calculateBioavailableTestosterone(album, shbg, testo);
                    result.push({
                        test: "Bioavailable Testosterone",
                        value: bioavailableTesto
                    })
                    firstPush = false;
                }
            } else {
                throw new Error('no matching lab report type found.');
            }
        });        
        return { status : true, data : { labType, collectionDate: collectionDate.trim(), result} };

    } catch (err) {
        return { status : false, msg : err.message };
    }
}

function calculateBioavailableTestosterone(album, shbg, testo) {
    // g/dL,nmol/L,ng/dL
    var kt=1000000000
    var wortel=0
    var ftesto=0

    const testo2 = testo / 2.8 * 1e-10
    shbg=shbg/10
    const shbg2=shbg * 1e-8
    const fa=((36000*album*(1.45 * .0001))+1) *kt
    const fa1= ((36000*album*(1.45 * .0001))+1)
    const fb=kt*(shbg2-testo2)+fa1
    const fc=-testo2
    wortel=Math.sqrt(fb*fb -4 * fa *fc)
    ftesto= (-fb +wortel)/(2*fa)
    const ftestop=(ftesto * 100)/testo2
    const ftc=(ftestop/100) * testo
    const biot = ftc * fa1
   
    return biot ? roundoff(biot) + " ng/dL" : '0';
}


function roundoff(value)
{
      var value4= "" + Math.round(value)
      var bonus2=value4.length + 1
      var bonus=0
      if (value <100) {bonus=bonus+1}
      if (value <10) {bonus=bonus+1}
      if (value <1) {bonus=bonus+1}
      if (value <0.1) {bonus=bonus+1}
      if (value <0.01) {bonus=bonus+1}
      if (value <0.001) {bonus=bonus+1}
      if (value <0.0001) {bonus=bonus+1}
      bonus2=bonus2+bonus

      var whole= Math.round(value * Math.pow(10, bonus));
      var whole2= ""+ whole * Math.pow(10, -1*bonus);
      var whole2= whole2.substr(0,bonus2)
      return whole2;
}