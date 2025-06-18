const fs = require('fs');
const path = require('path');
const qr = require('qrcode');
const { PDFDocument } = require('pdf-lib');
const libre = require('libreoffice-convert');

// Convert Office files to PDF using libreoffice-convert
async function convertToPdf(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ext = '.pdf';
    const fileBuffer = fs.readFileSync(inputPath);

    libre.convert(fileBuffer, ext, undefined, (err, done) => {
      if (err) {
        console.error('convertToPdf error:', err);
        return reject(err);
      }
      fs.writeFileSync(outputPath, done);
      resolve();
    });
  });
}

// Convert image files to PDF
async function imageToPdf(inputPath, outputPath) {
  const imageBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.create();
  const ext = path.extname(inputPath).toLowerCase();

  const image = ext === '.png'
    ? await pdfDoc.embedPng(imageBytes)
    : await pdfDoc.embedJpg(imageBytes);

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

// Generate QR code as data URL
async function generateQRCode(url) {
  return new Promise((resolve, reject) => {
    qr.toDataURL(url, (err, dataUrl) => {
      if (err) reject(err);
      else resolve(dataUrl);
    });
  });
}

// Embed QR Code image in last page of PDF
async function embedQRCodeInPdf(inputPdfPath, qrCodeDataUrl, outputPdfPath) {
  const pdfBytes = fs.readFileSync(inputPdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);

  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width, height } = lastPage.getSize();
  const qrSize = 80;

  const x = (width - qrSize) / 2;
  const y = height - 720;

  lastPage.drawImage(qrImage, {
    x,
    y,
    width: qrSize,
    height: qrSize,
  });

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, modifiedPdfBytes);
}

module.exports = {
  convertToPdf,
  imageToPdf,
  generateQRCode,
  embedQRCodeInPdf,
};
