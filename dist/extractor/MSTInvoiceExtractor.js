"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSTInvoiceExtractor = void 0;
const PDFExtractor_1 = require("./PDFExtractor");
var Part;
(function (Part) {
    Part[Part["NONE"] = 0] = "NONE";
    Part[Part["DATE"] = 1] = "DATE";
    Part[Part["SERIAL"] = 2] = "SERIAL";
    Part[Part["NO"] = 3] = "NO";
    Part[Part["SELLER"] = 4] = "SELLER";
    Part[Part["BUYER"] = 5] = "BUYER";
    Part[Part["TABLE"] = 6] = "TABLE";
})(Part || (Part = {}));
class MSTInvoiceExtractor extends PDFExtractor_1.PdfExtractor {
    constructor(fileName) {
        super(fileName);
        this.docLines = this.getDocLines();
        this.pos = 0;
    }
    processLine(pageLines) {
        while (true) {
        }
    }
    getResult() {
        throw new Error("Method not implemented.");
    }
    extractInfo() {
        return __awaiter(this, void 0, void 0, function* () {
        });
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
