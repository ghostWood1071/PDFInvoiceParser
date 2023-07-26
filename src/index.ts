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
import { MeInvoiceDBExtractor } from "./extractor/MeInvoiceDBExtractor";
import { PdfExtractor } from "./extractor/PDFExtractor";
import { SEOJINAUTOInvoiceExtractor } from "./extractor/SEOJINAUTOInvoiceExtractor";
import { SoftDreamsInvoiceExtractor } from "./extractor/SoftDreamInvoceExtractor";
import { VNPT2Extractor } from "./extractor/VNPT2Extractor";
import { VNPInvoiceExtractor } from "./extractor/VNPTInvoiceExtractor";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceExtractor";
import { WinTechExtractor } from "./extractor/WinTechExtractor";
import { meInvoice2Extractor } from "./extractor/meInvoice2Extractor";
import { meInvoiceExtractor } from "./extractor/meInvoiceExtractor";

// let extractor = new EInvoice2Extractor("src/pdf/1_C23TKH_260.pdf");
// let extractor = new EInvoice2Extractor(
//   "src/pdf/luxshare/2C23TLX5-305269815230.pdf"
// );
// let extractor = new EInvoice2Extractor("src/pdf/DOOWON_712_27.12.2022.pdf");

// extractor.getDocInfo().then((res) => console.log(res));

// extractor.saveRawText("einvoice2-1");
// extractor.saveRawText("einvoice2-2");
// extractor.saveRawText("einvoice2-3");
let extractor = new EInvoice2Extractor("src/pdf/1_C23TST_942 SEOWON-01.pdf");

// extractor.getDocInfo().then((res) => console.log(res));
//
// extractor.saveRawText("einvoice2-4");

extractor.getResult().then((res) => console.log(res));
