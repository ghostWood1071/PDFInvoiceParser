import * as fs from "fs";
import PdfParse from "pdf-parse";
import { ThreeAInvoiceExtractor } from "./extractor/3AInvoiceExtractor";
import { EFYInvoiceExtractor } from "./extractor/EFYInvoiceExtrator";
import { EInvoice2Extractor } from "./extractor/EInvoice2Extractor";
import { EInvoice3Extractor } from "./extractor/EInvoice3Extractor";
import { LOGISALInvoiceExtractor } from "./extractor/LogisallExtractor";
import { MInvoice2Extractor } from "./extractor/MInvoice2Extractor";
import { MInvoiceExtractor } from "./extractor/MInvoiceExtractor";
import { MSTInvoiceExtractor } from "./extractor/MSTInvoiceExtractor";
import { PdfExtractor } from "./extractor/PDFExtractor";
import { SEOJINAUTOInvoiceExtractor } from "./extractor/SEOJINAUTOInvoiceExtractor";
import { SoftDreamsInvoiceExtractor } from "./extractor/SoftDreamInvoceExtractor";
import { VNPInvoiceExtractor } from "./extractor/VNPTInvoiceExtractor";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceExtractor";
import { meInvoice2Extractor } from "./extractor/meInvoice2Extractor";
import { meInvoiceExtractor } from "./extractor/meInvoiceExtractor";
import { EInvoiceExtractor } from "./extractor/EInvoiceExtractor";

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
let extractor = new EInvoice3Extractor("./src/pdf/uil.pdf");
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

// extractor.getMetadata().then((res)=>{
//     console.log(res);
// });

// extractor.saveRawText("uil").then((res)=>{
//     console.log(res);
// });
