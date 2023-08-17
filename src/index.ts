import { ThreeAInvoiceExtractor } from "./extractor/3AInvoiceExtractor";
import { BKAV2Extractor } from "./extractor/BKAV2Extractor";
import { BKAV3Extractor } from "./extractor/BKAV3Extractor";
import { BKAV4Extractor } from "./extractor/BKAV4Extractor";
import { BKAVExtractor } from "./extractor/BKAVExtractor";
import { CYBERLOTUSExtractor } from "./extractor/CYBERLOTUSExtractor";
import { EFYInvoiceExtractor } from "./extractor/EFYInvoiceExtrator";
import { EInvoice2Extractor } from "./extractor/EInvoice2Extractor";
import { EInvoice3Extractor } from "./extractor/EInvoice3Extractor";
import { EInvoice4Extractor } from "./extractor/EInvoice4Extractor";
import { EInvoice5Extractor } from "./extractor/EInvoice5Extractor";
import { EInvoiceExtractor } from "./extractor/EInvoiceExtractor";
import { FPTExtractor } from "./extractor/FPTExtractor";
import { FastInvoiceExtractor } from "./extractor/FastInvoiceExtractor";
import { LOGISALInvoiceExtractor } from "./extractor/LogisallExtractor";
import { MInvoice2Extractor } from "./extractor/MInvoice2Extractor";
import { MInvoiceExtractor } from "./extractor/MInvoiceExtractor";
import { MSTInvoiceExtractor } from "./extractor/MSTInvoiceExtractor";
import { MeInvoice5Extractor } from "./extractor/MeInvoice5Extractor";
import { MeInvoice6Extractor } from "./extractor/MeInvoice6Extractor";
import { MeInvoice7Extractor } from "./extractor/MeInvoice7Extractor";
import { MeInvoiceDBExtractor } from "./extractor/MeInvoiceDBExtractor";
import { PdfExtractor } from "./extractor/PDFExtractor";
import { SEOJINAUTOInvoiceExtractor } from "./extractor/SEOJINAUTOInvoiceExtractor";
import { SoftDreamsInvoiceExtractor } from "./extractor/SoftDreamInvoceExtractor";
import { Test } from "./extractor/Test";
import { VNPT3Extractor } from "./extractor/VNPT3Extractor";
import { VNPT4Extractor } from "./extractor/VNPT4Extractor";
import { VNPInvoiceExtractor } from "./extractor/VNPTInvoiceExtractor";
import { Viettel2Extractor } from "./extractor/Viettel2Extractor";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceExtractor";
import { WinTechExtractor } from "./extractor/WinTechExtractor";
import { meInvoice2Extractor } from "./extractor/meInvoice2Extractor";
import { MeInvoice4Extractor } from "./extractor/meInvoice4Extractor";
import { meInvoiceExtractor } from "./extractor/meInvoiceExtractor";

<<<<<<< HEAD
<<<<<<< HEAD
let extractor = new Test(
  "src/pdf/8-Aug, 11 Aug to 22 Aug.pdf"
);

extractor.saveRawText("Shindengen");
=======
let extractor = new VNPT4Extractor("src/pdf/POSCO_349.pdf");

// extractor.saveRawText("vnpt4");
>>>>>>> a6dc2da0a5a5a3233ea68ba736554fbda060af0e
=======
// let extractor = new MeInvoice6Extractor("src/pdf/00000092 - Dương Quang.pdf");
let extractor = new MeInvoice6Extractor("src/pdf/01GTKT0_0000842.pdf");

// extractor.saveRawText("meinvoice6-0");
// extractor.saveRawText("meinvoice6");
>>>>>>> 08468c92e8828ac7edc6388915bd7411b98e4cf3

// extractor.getResult().then((res) => console.log(res));
