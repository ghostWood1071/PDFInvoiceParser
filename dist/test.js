const fs = require('fs');
const PDFParser = require('pdf2json');

function extractDataFromPDF(inputPath) {
  const pdfParser = new PDFParser();

  pdfParser.on('pdfParser_dataReady', (pdfData) => {
    // Process the extracted data
    const textContent = pdfParser.getRawTextContent();
    console.log(textContent);
  });

  pdfParser.loadPDF(inputPath);
}

const inputPDFPath = 'dist/0.pdf'; // Replace with the path to your input PDF file

extractDataFromPDF(inputPDFPath);