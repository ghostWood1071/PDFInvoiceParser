import * as fs from "fs";
import PdfParse from "pdf-parse";
import { MSTInvoiceExtractor } from "./extractor/MSTInvoiceExtractor";
import { PdfExtractor } from "./extractor/PDFExtractor";
import { SEOJINAUTOInvoiceExtractor } from "./extractor/SEOJINAUTOInvoiceExtractor";
import { VNPInvoiceExtractor } from "./extractor/VNPTInvoiceExtractor";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceExtractor";
// async function test(fileName:string){
//     let buff = await fs.readFileSync(fileName);
//     let data = await PdfParse(buff);
//     return {info: data.info, other: data.metadata}
// }

// async function main(){
//     let out1 = await test('../src/NANOTECH_00000573_29.05.2023.pdf');
//     console.log(out1);

//     let out2 = await test('../src/4601194212-C23TVN113.pdf');
//     console.log(out2);

//     let out3 = await test('../src/1C23TSS-599 SHINSUNG.pdf');
//     console.log(out3);
// }

// main()

// let extractor = new ViettelInvoiceExtractor(
//   "./src/pdf/4601194212-C23TVN113.pdf"
// );

// extractor.getResult().then((res) => {
//   console.log(res);
// });

// let extractor = new MSTInvoiceExtractor(
//   "./src/pdf/1C23TGT-281.pdf"
// );

// extractor.getResult().then((res) => {
//   console.log(res);
// });

// let extractor = new VNPInvoiceExtractor("./src/pdf/vnpt.pdf");
// // extractor.saveRawText("vnpt");
// extractor.getResult().then((res) => {
//   console.log(res.exchange_rate);
//   console.log(res.vat_rate);
//   console.log(res.table.length);
// });

let extractor = new PdfExtractor(
  "./src/pdf/1C23TGT-281.pdf"
);

// extractor.getResult().then((res) => {
//   console.log(res);
// });
extractor.getDocInfo().then((res)=>{
  console.log(res);
})

extractor.saveRawText("fast").then((res) => {
  console.log(res);
});