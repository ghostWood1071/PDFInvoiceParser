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
import { EInvoiceExtractor } from "./extractor/EInvoiceExtractor";
import test from "node:test";

// vnpt - done
// a-tek - done
// cheonglim - done
// dailoi - done
// honk - done
// idoadon - done
// logisall - done
// magtron - done
// nagase - inprogress
//./src/pdf/4/HONK_88_30.09.2022.pdf
//./src/pdf/11/MAGTRON__28_27.05.2023.pdf
//./src/pdf/meInvoice1.pdf
let extractor = new EInvoiceExtractor("./src/pdf/luxshare.pdf");
// extractor.saveRawText("haha").then((res)=>{
//     console.log(res);
// });
// extractor.getResult().then((res)=>{
//     // fs.writeFileSync("lol.json", JSON.stringify(res));
//     console.log(res);
// })
extractor.getDocInfo().then((res)=>{
    console.log(res);
});

extractor.getMetadata().then((res)=>{
    console.log(res);
});

// extractor.saveRawText("luxshare").then((res)=>{
//     console.log(res);
// })