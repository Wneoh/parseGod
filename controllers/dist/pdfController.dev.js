"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parsePdf = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _pdf = require("pdf.js-extract");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var parsePdf = function parsePdf(req, res) {
  var _req$body = req.body,
      pdfUrl = _req$body.url,
      firstName = _req$body.firstName,
      lastName = _req$body.lastName,
      gender = _req$body.gender,
      birthday = _req$body.birthday,
      profileMustMatch = _req$body.profileMustMatch;
  var pdfExtract = new _pdf.PDFExtract(); // Load the PDF from the URL

  _axios["default"].get(pdfUrl, {
    responseType: "arraybuffer"
  }).then(function (response) {
    var pdfBuffer = Buffer.from(response.data, "binary");
    pdfExtract.extractBuffer(pdfBuffer).then(function (data) {
      var result = generateResponse({
        validatingFirstname: firstName,
        validatingLastname: lastName,
        validatingGender: gender,
        validatingDOB: birthday
      }, profileMustMatch, data);

      if (result.status) {
        res.status(200).send(result.data);
      } else {
        res.status(500).send({
          error: result.msg
        });
      }
    })["catch"](function (err) {
      return console.log(err);
    });
  })["catch"](function (error) {
    console.error("Error fetching PDF from URL:", error);
    res.status(500).send({
      error: "Error fetching PDF from URL"
    });
  });
};

exports.parsePdf = parsePdf;

var generateResponse = function generateResponse(_ref, profileMustMatch, jsonData) {
  var validatingFirstname = _ref.validatingFirstname,
      validatingLastname = _ref.validatingLastname,
      validatingGender = _ref.validatingGender,
      validatingDOB = _ref.validatingDOB;
  var result = [];

  try {
    var pages = jsonData.pages;
    var aventusTests = ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'MCV', 'MCH', 'MCHC', 'RDW - CV', 'Platelet', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils - %', 'Absolute Neutrophils', 'Absolute Lymphocytes', 'Absolute Monocytes', 'Absolute Eosinophils', 'Basophils', 'Glucose', 'BUN', 'Creatinine', 'eGFR (Non-African American)', 'eGFR (African American)', 'BUN/Creatinine Ratio', 'Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'Calcium', 'Total Protein', 'Albumin', 'Globulin', 'Albumin/Globulin Ratio', 'Total Bilirubin', 'Direct Bilirubin', 'AST (Aspartate aminotransferase)', 'ALT (Alanine aminotransferase)', 'ALP (Alkaline Phosphatase)', 'GGT', 'HbA1c, Glycosylated Hemoglobin', 'Insulin', 'Uric Acid', 'Cholesterol, Total', 'Triglycerides', 'HDL, Cholesterol', 'LDL Calculated', 'Cholesterol/HDL Ratio', 'Lipoprotein (a)', 'Homocysteine', 'C-Reactive Protein, Quant', 'TSH-DXI', 'Free T4 - DXI', 'Free T3 - DXI', 'Thyroglobulin Antibodies', 'Thyroid Peroxidase (TPO) Ab - DXI', 'Prolactin - DXI', 'LH - DXI', 'FSH - DXI', 'DHEA-Sulfate - DXI', 'Testosterone - DXI', 'Free Testosterone', 'Bioavailable Testosterone', 'SHBG', 'Estrone-MSS', 'Pregnenolone- MSS', 'Progesterone - DXI', 'IGF-1', 'Cortisol - DXI', 'Estradiol - DXI', 'Vitamin D - DXI', 'Ferritin', 'Vitamin B12, Diluted - DXI', 'Folate, Serum - DXI', 'PSA, Total - DXI', 'Testosterone - DXI M/F SUPP', 'Vitamin B12 - DXI'];
    var labcorpCommonTests = ['eGFR If NonAfricn Am', 'eGFR If Africn Am', 'WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'MCV', 'MCH', 'MCHC', 'RDW', 'Platelets', 'Neutrophils', 'Lymphs', 'Monocytes', 'Eos', 'Basos', 'Neutrophils (Absolute)', 'Lymphs (Absolute)', 'Monocytes(Absolute)', 'Eos (Absolute)', 'Baso (Absolute)', 'Immature Granulocytes', 'Immature Grans (Abs)', 'Glucose', 'BUN', 'Creatinine', 'eGFR', 'BUN/Creatinine Ratio', 'Sodium', 'Potassium', 'Chloride', 'Carbon Dioxide, Total', 'Calcium', 'Protein, Total', 'Albumin', 'Globulin, Total', 'A/G Ratio', 'Bilirubin, Total', 'Alkaline Phosphatase', 'AST (SGOT)', 'ALT (SGPT)', 'Cholesterol, Total', 'Triglycerides', 'HDL Cholesterol', 'VLDL Cholesterol Cal', 'LDL Chol Calc (NIH)', 'LDL/HDL Ratio', 'TSH', 'Triiodothyronine (T3), Free', 'T4,Free(Direct)', 'LH', 'FSH', 'Testosterone', 'Free Testosterone(Direct)', 'Pregnenolone, MS', 'Prostate Specific Ag', 'Reflex Criteria', 'Estrone, Serum, MS', 'Ferritin', 'Hemoglobin A1c', 'Folate (Folic Acid), Serum', 'DHEA-Sulfate', 'Cortisol', 'Prolactin', 'Estradiol', 'Insulin-Like Growth Factor I', 'Vitamin D, 25-Hydroxy', 'Lipoprotein (a)', 'Homocyst(e)ine', 'Uric Acid', 'Insulin', 'C-Reactive Protein, Cardiac', 'Thyroglobulin Antibody', 'Vitamin B12', 'Progesterone', 'Thyroid Peroxidase (TPO) Ab', 'Serum'];
    var collectionDate = '';
    var labType = '';
    var firstName = '';
    var lastName = '';
    var testo;
    var album;
    var shbg;
    var firstPush = true; // Iterate over pages

    pages.forEach(function (page) {
      var content = page.content;
      var isDecimalOrNumberWithRange = /^-?\d+(\.\d+)?|<[0-9]+|>[0-9]+$/;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = content[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var text = _step.value;
          var targetText = text.str;

          if (targetText.includes('Laboratory Corporation of America')) {
            labType = 'Labcorp';
            break;
          }

          if (targetText.includes('ABL MEDICAL CARE, LLC')) {
            labType = 'Aventus';
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (labType === 'Aventus') {
        content.forEach(function (text, idx) {
          var targetText = text.str;

          if (targetText.trim() === 'Patient:') {
            var name = content[idx + 2].str;
            var nameParts = name.split(',');
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
            var point = content[idx + 2].str;

            if (isDecimalOrNumberWithRange.test(point) && !result.find(function (r) {
              return r.test === targetText;
            })) {
              result.push({
                test: targetText,
                value: point
              });
            }
          }
        });
      } else if (labType === 'Labcorp') {
        content.forEach(function (text, idx) {
          var targetText = text.str;

          if (targetText.trim() === 'Patient Details') {
            var name = content[idx + 2].str;
            var nameParts = name.split(',');
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
            var point = content[idx + 4].str;

            if (targetText.trim() === "Testosterone") {
              testo = point;
            }

            if (targetText.trim() === "Albumin") {
              album = point;
            }

            if (targetText.trim() === "Serum" && isDecimalOrNumberWithRange.test(point)) {
              shbg = point;
            }

            if (isDecimalOrNumberWithRange.test(point) && !result.find(function (r) {
              return r.test === targetText;
            })) {
              result.push({
                test: targetText === 'Serum' ? 'Sex Horm Binding Glob, Serum' : targetText,
                value: point
              });
            }
          }
        });

        if (shbg && album && testo && firstPush) {
          var bioavailableTesto = calculateBioavailableTestosterone(album, shbg, testo);
          result.push({
            test: "Bioavailable Testosterone",
            value: bioavailableTesto
          });
          firstPush = false;
        }
      } else {
        throw new Error('no matching lab report type found.');
      }
    });
    return {
      status: true,
      data: {
        labType: labType,
        collectionDate: collectionDate.trim(),
        result: result
      }
    };
  } catch (err) {
    return {
      status: false,
      msg: err.message
    };
  }
};

function calculateBioavailableTestosterone(album, shbg, testo) {
  // g/dL,nmol/L,ng/dL
  var kt = 1000000000;
  var wortel = 0;
  var ftesto = 0;
  var testo2 = testo / 2.8 * 1e-10;
  shbg = shbg / 10;
  var shbg2 = shbg * 1e-8;
  var fa = (36000 * album * (1.45 * .0001) + 1) * kt;
  var fa1 = 36000 * album * (1.45 * .0001) + 1;
  var fb = kt * (shbg2 - testo2) + fa1;
  var fc = -testo2;
  wortel = Math.sqrt(fb * fb - 4 * fa * fc);
  ftesto = (-fb + wortel) / (2 * fa);
  var ftestop = ftesto * 100 / testo2;
  var ftc = ftestop / 100 * testo;
  var biot = ftc * fa1;
  return biot ? roundoff(biot) + " ng/dL" : '0';
}

function roundoff(value) {
  var value4 = "" + Math.round(value);
  var bonus2 = value4.length + 1;
  var bonus = 0;

  if (value < 100) {
    bonus = bonus + 1;
  }

  if (value < 10) {
    bonus = bonus + 1;
  }

  if (value < 1) {
    bonus = bonus + 1;
  }

  if (value < 0.1) {
    bonus = bonus + 1;
  }

  if (value < 0.01) {
    bonus = bonus + 1;
  }

  if (value < 0.001) {
    bonus = bonus + 1;
  }

  if (value < 0.0001) {
    bonus = bonus + 1;
  }

  bonus2 = bonus2 + bonus;
  var whole = Math.round(value * Math.pow(10, bonus));
  var whole2 = "" + whole * Math.pow(10, -1 * bonus);
  var whole2 = whole2.substr(0, bonus2);
  return whole2;
}