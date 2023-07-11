import * as fs from "fs";
import PdfParse from "pdf-parse";
import { ThreeAInvoiceExtractor } from "./extractor/3AInvoiceExtractor";
import { EFYInvoiceExtractor } from "./extractor/EFYInvoiceExtrator";
import { LOGISALInvoiceExtractor } from "./extractor/LogisallExtractor";
import { MSTInvoiceExtractor } from "./extractor/MSTInvoiceExtractor";
import { PdfExtractor } from "./extractor/PDFExtractor";
// import { SEOJINAUTOInvoiceExtractor } from "./extractor/SEOJINAUTOInvoiceExtractor";
import { SEOJINAUTOInvoiceExtractor } from "./extractor/SEOJINAUTOInvoiceExtractor";
import { SoftDreamsInvoiceExtractor } from "./extractor/SoftDreamInvoceExtractor";
import { VNPInvoiceExtractor } from "./extractor/VNPTInvoiceExtractor";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceExtractor";
import { meInvoiceExtractor } from "./extractor/meInvoiceExtractor";
import { MInvoiceExtractor } from "./extractor/MInvoiceExtractor";
import { MInvoice2Extractor } from "./extractor/MInvoice2Extractor";
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

// ********** VIETTEL **********
// let extractor = new ViettelInvoiceExtractor(
//   "./src/pdf/4601194212-C23TVN113.pdf"
// );
// extractor.saveRawText("viettel");
// extractor.getProducer();
// extractor.getResult().then((res) => {
//   console.log(res);
// });

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "4601194212-C23TVN113.pdf",
//    Creater: obj.Creator ? obj.Creator : null,
// Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "Viettel",
//     MST: "0100109106",
//   };

//   fs.writeFileSync("viettel.json", JSON.stringify(json));
// });

// ********** SEOJIN AUTO **********
let extractor = new MInvoice2Extractor(
  "./src/pdf/HONK_88_30.09.2022.pdf"
);
extractor.getResult().then((res)=>{
  console.log(res);
})
// let extractor = new SEOJINAUTOInvoiceExtractor(
//   "./src/pdf/2C23TAT_00000215.pdf"
// );
// extractor.getDocInfo().then((res)=>{
//   console.log(res);
// })
// extractor.saveRawText("vnpt");

// extractor.saveRawText("minvoice").then((res: any)=> {
//   // console.log(res);
// });
// extractor.getResult().then((res) => {
//   console.log(res);
// });

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "2C23TAT_00000215.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
// Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "MeInvoice,
//     MST: "2300956022",
//   };

//   fs.writeFileSync("seojinauto.json", JSON.stringify(json));
// });

// ********** MST **********

// let extractor = new MSTInvoiceExtractor("./src/pdf/1C23TGT-281.pdf");

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "1C23TGT-281.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//      Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "Công ty Cổ phần Phần mềm Quản lý Doanh nghiệp",
//     MST: "0100727825",
//   };

//   fs.writeFileSync("hosiden.json", JSON.stringify(json));
// });

// extractor.getResult().then((res) => {
//   console.log(res);
// });

// ********** VNPT **********

// let extractor = new VNPInvoiceExtractor(
//   "./src/pdf/vnpt/1_001_C23TDS_568_18480 DOOSUN.pdf"
// );

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "1_001_C23TDS_568_18480 DOOSUN.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
// Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "VNPT",
//     MST: null,
//   };

//   fs.writeFileSync("./infoJson/vnpt.json", JSON.stringify(json));
// });

// ********** SOFTDREAMS **********

let extractor = new SoftDreamsInvoiceExtractor(
  "src/pdf/2/A-TECK_49_29.09.2022_TEM.pdf"
);

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "A-TECK_49_29.09.2022_TEM.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "SOFTDREAMS",
//     MST: "0105987432",
//   };
//   fs.writeFileSync("./infoJson/softdreams.json", JSON.stringify(json));
// });

// extractor.saveRawText("softdream");

extractor.getResult().then((res) => {
  console.log(res);
});

// ********** BL 1155302 **********

// let extractor = new PdfExtractor("./src/pdf/3/BL 1155302.pdf");

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "BL 1155302.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "",
//     MST: "",
//   };

//   fs.writeFileSync("./infoJson/BL 1155302.json", JSON.stringify(json));
// });

// ********** M-Invoice-HCM **********

// let extractor = new PdfExtractor("./src/pdf/4/HONK_88_30.09.2022.pdf");

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "HONK_88_30.09.2022.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "M-Invoice - CN TP HCM",
//     MST: "0106026495-001",
//   };

//   fs.writeFileSync("./infoJson/M-Invoice-HCM.json", JSON.stringify(json));
// });

// ********** MISA **********

// let extractor = new PdfExtractor("./src/pdf/5/CHEONG LIM_00000017.pdf");

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "CHEONG LIM_00000017.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "meInvoice",
//     MST: "0101243150",
//   };

//   fs.writeFileSync("./infoJson/misa.json", JSON.stringify(json));
// });

// ********** NAGASE **********

// let extractor = new PdfExtractor(
//   "./src/pdf/6/NAGASE_3482_27.03.2023.pdf"
// );

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "NAGASE_3482_27.03.2023.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "EInvoice",
//     MST: "0102659320",
//   };

//   fs.writeFileSync("./infoJson/nagase.json", JSON.stringify(json));
// });
// extractor.saveRawText("EInvoice");

// ********** 3A **********

// let extractor = new ThreeAInvoiceExtractor(
//   "./src/pdf/7/DAI LOI_00000437_30.05.2023.pdf"
// );

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "DAI LOI_00000437_30.05.2023.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "Giải Pháp Phần mềm 3A",
//     MST: "0108516079",
//   };

//   fs.writeFileSync("./infoJson/3a.json", JSON.stringify(json));
// });
//
// extractor.saveRawText("3a");

// extractor.getResult().then((res) => {
//   console.log(res);
// });

// ********** ??? **********

// let extractor = new PdfExtractor("./src/pdf/8/INV T3.pdf");

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "INV T3.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "",
//     MST: "",
//   };

//   fs.writeFileSync("./infoJson/inv t3.json", JSON.stringify(json));
// });

// let extractor = new PdfExtractor("./src/pdf/8/INV.pdf");

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "INV.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "",
//     MST: "",
//   };

//   fs.writeFileSync("./infoJson/inv.json", JSON.stringify(json));
// });

// ********** EFY **********

// let extractor = new EFYInvoiceExtractor(
//   "./src/pdf/9/ihoadon.vn_2300755090_851_31052023 JW T5-02.pdf"
// );

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "ihoadon.vn_2300755090_851_31052023 JW T5-02.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "EFY",
//     MST: "0102519041",
//   };

//   fs.writeFileSync("./infoJson/EFY.json", JSON.stringify(json));
// });

// extractor.getResult().then((res) => {
//   console.log(res);
// });

// extractor.saveRawText("efy");

// ********** LOGISALL **********

// let extractor = new LOGISALInvoiceExtractor(
//   "./src/pdf/10/LOGISALL_00000064_30.05.2023.pdf"
// );

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "LOGISALL_00000064_30.05.2023.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "LOGISALL",
//     MST: "0107369689",
//   };

//   fs.writeFileSync("./infoJson/LOGISALL.json", JSON.stringify(json));
// });

// extractor.saveRawText("logisall");

// extractor.getResult().then((res) => {
//   console.log(res);
// });

// extractor.saveRawText("logisall");

// ********** M-invoice **********

// let extractor = new PdfExtractor("./src/pdf/11/MAGTRON__28_27.05.2023.pdf");

// extractor.getDocInfo().then((res) => {
//   let obj = JSON.parse(res);

//   let json = {
//     File_name: "MAGTRON__28_27.05.2023.pdf",
//     Creater: obj.Creator ? obj.Creator : null,
//     Producer: obj.Producer ? obj.Producer : null,
//     Fournisseur: "M-invoice",
//     MST: "0106026495",
//   };

//   fs.writeFileSync("./infoJson/M-Invoice.json", JSON.stringify(json));
// });
