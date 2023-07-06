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
exports.ViettelInvoiceExtractor = void 0;
const PDFExtractor_1 = require("./PDFExtractor");
class PageContent {
    constructor() {
        this.date = "";
        this.serial = "";
    }
}
var PagePart;
(function (PagePart) {
    PagePart[PagePart["NONE"] = 0] = "NONE";
    PagePart[PagePart["DATE"] = 1] = "DATE";
    PagePart[PagePart["SERIAL"] = 2] = "SERIAL";
    PagePart[PagePart["NO"] = 3] = "NO";
    PagePart[PagePart["SELLER"] = 4] = "SELLER";
    PagePart[PagePart["BUYER"] = 5] = "BUYER";
    PagePart[PagePart["TABLE"] = 6] = "TABLE";
})(PagePart || (PagePart = {}));
class ViettelInvoiceExtractor extends PDFExtractor_1.PdfExtractor {
    constructor(fileName) {
        super(fileName);
        this.docLines = this.getDocLines();
    }
    processLines(pageLines) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = new PageContent();
            let parts = PagePart.NONE;
            for (let line of pageLines) {
                if (line == "Ngày") {
                    result.date = result.date + line;
                    parts = PagePart.DATE;
                }
                else if (parts == PagePart.DATE && line != "Ký hiệu") {
                    result.date = result.date + line;
                }
                if (line == "Ký hiệu") {
                    result.serial = result.serial + line;
                    parts = PagePart.SERIAL;
                }
                else if (parts == PagePart.SERIAL && line != "Số") {
                    result.serial = result.serial + line;
                }
                if (line == "Số") {
                    break;
                }
            }
            return result;
        });
    }
    getResult() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.docLines;
            console.log(data ? data[0] : "");
            let result = data ? this.processLines(data[0]) : null;
            return result;
        });
    }
    extractInfo() {
        throw new Error('Method not implemented.');
    }
    extractBuyer() {
        throw new Error('Method not implemented.');
    }
    extractSeller() {
        throw new Error('Method not implemented.');
    }
    extractTable() {
        throw new Error('Method not implemented.');
    }
}
exports.ViettelInvoiceExtractor = ViettelInvoiceExtractor;
