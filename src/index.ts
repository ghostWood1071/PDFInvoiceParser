import { ThreeAInvoiceExtractor } from "./extractor/3AInvoiceExtractor";
import { BKAV2Extractor } from "./extractor/BKAV2Extractor";
import { BKAVExtractor } from "./extractor/BKAVExtractor";
import { CYBERLOTUSExtractor } from "./extractor/CYBERLOTUSExtractor";
import { EFYInvoiceExtractor } from "./extractor/EFYInvoiceExtrator";
import { EInvoice2Extractor } from "./extractor/EInvoice2Extractor";
import { EInvoice3Extractor } from "./extractor/EInvoice3Extractor";
import { EInvoice4Extractor } from "./extractor/EInvoice4Extractor";
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
import { Test } from "./extractor/Test";
import { VNPT3Extractor } from "./extractor/VNPT3Extractor";
import { VNPInvoiceExtractor } from "./extractor/VNPTInvoiceExtractor";
import { Viettel2Extractor } from "./extractor/Viettel2Extractor";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceExtractor";
import { WinTechExtractor } from "./extractor/WinTechExtractor";
import { meInvoice2Extractor } from "./extractor/meInvoice2Extractor";
import { MeInvoice4Extractor } from "./extractor/meInvoice4Extractor";
import { meInvoiceExtractor } from "./extractor/meInvoiceExtractor";

let extractor = new PdfExtractor(
  "src/pdf/181.pdf"
);

extractor.saveRawText("fpt2");
