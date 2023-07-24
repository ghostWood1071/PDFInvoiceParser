import * as fs from "fs";
import test from "node:test";
import PdfParse from "pdf-parse";
import { ThreeAInvoiceExtractor } from "./extractor/3AInvoiceExtractor";
import { BKAVExtractor } from "./extractor/BKAVExtractor";
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
import { VNPInvoiceExtractor } from "./extractor/VNPTInvoiceExtractor";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceExtractor";
import { WinTechExtractor } from "./extractor/WinTechExtractor";
import { meInvoice2Extractor } from "./extractor/meInvoice2Extractor";
import { meInvoiceExtractor } from "./extractor/meInvoiceExtractor";

// let extractor = new SEOJINAUTOInvoiceExtractor("src/pdf/2C23TAT_00000214.pdf");
// let extractor = new SEOJINAUTOInvoiceExtractor("src/pdf/2C23TAT_00000215.pdf");
// let extractor = new SEOJINAUTOInvoiceExtractor("src/pdf/meInvoice2.pdf");

// let extractor = new SEOJINAUTOInvoiceExtractor(
//   "src/pdf/10/LOGISALL_00000064_30.05.2023.pdf"
// );

let extractor = new BKAVExtractor(
  "src/pdf/C22TSU-00001662-T5R4CL037U6-DPH.pdf"
);

// extractor.saveRawText("bkav");
extractor.getResult().then((res) => console.log(res));
