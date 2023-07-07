"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSTInvoiceExtractor = void 0;
const PDFExtractor_1 = require("./PDFExtractor");
class MSTInvoiceExtractor extends PDFExtractor_1.PdfExtractor {
    constructor(fileName) {
        super(fileName);
    }
    extractInfo() {
        throw new Error("Method not implemented.");
    }
    extractBuyer() {
        throw new Error("Method not implemented.");
    }
    extractSeller() {
        throw new Error("Method not implemented.");
    }
    extractTable() {
        throw new Error("Method not implemented.");
    }
}
exports.MSTInvoiceExtractor = MSTInvoiceExtractor;
let mst = new MSTInvoiceExtractor("../src/1C23TGT-256.pdf");
mst.saveRawText("abc.txt");
