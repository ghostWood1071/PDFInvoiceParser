import { ThreeAInvoiceExtractor } from "./extractor/3AInvoiceExtractor";
import { BKAV2Extractor } from "./extractor/BKAV2Extractor";
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
import { MeInvoice3Extractor } from "./extractor/MeInvoice3Extractor";
import { MeInvoiceDBExtractor } from "./extractor/MeInvoiceDBExtractor";
import { PdfExtractor } from "./extractor/PDFExtractor";
import { SEOJINAUTOInvoiceExtractor } from "./extractor/SEOJINAUTOInvoiceExtractor";
import { SoftDreamsInvoiceExtractor } from "./extractor/SoftDreamInvoceExtractor";
import { VNPT2Extractor } from "./extractor/VNPT2Extractor";
import { VNPInvoiceExtractor } from "./extractor/VNPTInvoiceExtractor";
import { Viettel2Extractor } from "./extractor/Viettel2Extractor";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceExtractor";
import { WinTechExtractor } from "./extractor/WinTechExtractor";
import { meInvoice2Extractor } from "./extractor/meInvoice2Extractor";
import { MeInvoice4Extractor } from "./extractor/meInvoice4Extractor";
import { meInvoiceExtractor } from "./extractor/meInvoiceExtractor";

let extractor = new MeInvoice4Extractor(
  "src/pdf/MeInvoice/1C23TYY_00000469.pdf"
);

// extractor.saveRawText("meinvoice3");

extractor.getResult().then((res) => console.log(res));
