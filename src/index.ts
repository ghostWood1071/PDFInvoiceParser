import * as fs from "fs";
import PdfParse from "pdf-parse";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceEctractor";
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

let extractor = new ViettelInvoiceExtractor(
  "../src/pdf/4601194212-C23TVN113.pdf"
);

extractor.getResult().then((res) => {
  console.log(res);
});
