import { ThreeAInvoiceExtractor } from "./extractor/3AInvoiceExtractor";
import { BKAVExtractor } from "./extractor/BKAVExtractor";
import { CYBERLOTUSExtractor } from "./extractor/CYBERLOTUSExtractor";
import { EFYInvoiceExtractor } from "./extractor/EFYInvoiceExtrator";
import { EInvoice2Extractor } from "./extractor/EInvoice2Extractor";
import { EInvoice3Extractor } from "./extractor/EInvoice3Extractor";
import { EInvoiceExtractor } from "./extractor/EInvoiceExtractor";
import { FPTExtractor } from "./extractor/FPTExtractor";
import { FastInvoiceExtractor } from "./extractor/FastInvoiceExtractor";
import { LOGISALInvoiceExtractor } from "./extractor/LogisallExtractor";
import { MInvoice2Extractor } from "./extractor/MInvoice2Extractor";
import { MInvoiceExtractor } from "./extractor/MInvoiceExtractor";
import { MSTInvoiceExtractor } from "./extractor/MSTInvoiceExtractor";
import { PdfExtractor } from "./extractor/PDFExtractor";
import { SEOJINAUTOInvoiceExtractor } from "./extractor/SEOJINAUTOInvoiceExtractor";
import { SoftDreamsInvoiceExtractor } from "./extractor/SoftDreamInvoceExtractor";
import { VNPT2Extractor } from "./extractor/VNPT2Extractor";
import { VNPInvoiceExtractor } from "./extractor/VNPTInvoiceExtractor";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceExtractor";
import { WinTechExtractor } from "./extractor/WinTechExtractor";
import { meInvoice2Extractor } from "./extractor/meInvoice2Extractor";
import { meInvoiceExtractor } from "./extractor/meInvoiceExtractor";

// let extractor = new BKAVExtractor(
//   "src/pdf/C22TSU-00001662-T5R4CL037U6-DPH.pdf"
// );
let extractor = new BKAVExtractor("src/pdf/SENA TECH_00000068_trung.pdf");

// extractor.getDocInfo().then((res) => console.log(res));

// extractor.saveRawText("bkav1");
// extractor.saveRawText("bkav2");

extractor.getResult().then((res) => console.log(res));
