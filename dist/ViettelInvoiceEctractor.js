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
        this.no = "";
        this.seller = {
            companyName: "",
            taxCode: "",
        };
        this.buyer = {
            companyName: "",
            taxCode: "",
        };
        this.table = [];
    }
}
class TableContent {
    constructor() {
        this.description = "";
        this.unit = "";
        this.quanity = 0;
        this.unitPrice = 0;
        this.amount = 0;
    }
}
var PagePart;
(function (PagePart) {
    PagePart[PagePart["NONE"] = 0] = "NONE";
    PagePart[PagePart["DATE"] = 1] = "DATE";
    PagePart[PagePart["SERIAL"] = 2] = "SERIAL";
    PagePart[PagePart["NO"] = 3] = "NO";
    PagePart[PagePart["SELLER_COMPANY_NAME"] = 4] = "SELLER_COMPANY_NAME";
    PagePart[PagePart["SELLER_TAX_CODE"] = 5] = "SELLER_TAX_CODE";
    PagePart[PagePart["BUYER_COMPANY_NAME"] = 6] = "BUYER_COMPANY_NAME";
    PagePart[PagePart["BUYER_TAX_CODE"] = 7] = "BUYER_TAX_CODE";
    PagePart[PagePart["TABLE"] = 8] = "TABLE";
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
            let indexLine = 0;
            let l = pageLines.length;
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Ngày") {
                    parts = PagePart.DATE;
                }
                if (pageLines[indexLine] == "Ký hiệu")
                    break;
                else if (parts == PagePart.DATE) {
                    result.date = result.date + pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Ký hiệu") {
                    parts = PagePart.SERIAL;
                }
                if (pageLines[indexLine] == "Số")
                    break;
                else if (parts == PagePart.SERIAL) {
                    result.serial = result.serial + pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Số") {
                    parts = PagePart.NO;
                }
                if (pageLines[indexLine] == "Đơn vị bán hàng")
                    break;
                else if (parts == PagePart.NO) {
                    result.no = result.no + pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Đơn vị bán hàng") {
                    parts = PagePart.SELLER_COMPANY_NAME;
                }
                if (pageLines[indexLine] == "Mã số thuế")
                    break;
                else if (parts == PagePart.SELLER_COMPANY_NAME) {
                    result.seller.companyName += pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Mã số thuế") {
                    parts = PagePart.SELLER_TAX_CODE;
                }
                if (pageLines[indexLine] == "Địa chỉ")
                    break;
                else if (parts == PagePart.SELLER_TAX_CODE) {
                    result.seller.taxCode += pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Tên đơn vị") {
                    parts = PagePart.SELLER_COMPANY_NAME;
                }
                if (pageLines[indexLine] == "Mã số thuế")
                    break;
                else if (parts == PagePart.SELLER_COMPANY_NAME) {
                    result.buyer.companyName += pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Mã số thuế") {
                    parts = PagePart.SELLER_TAX_CODE;
                }
                if (pageLines[indexLine] == "Địa chỉ")
                    break;
                else if (parts == PagePart.SELLER_TAX_CODE) {
                    result.buyer.taxCode += pageLines[indexLine];
                }
                indexLine++;
            }
            let indexRow = 0;
            while (indexLine <= l) {
                if (pageLines[indexLine] == "STT") {
                    parts = PagePart.TABLE;
                    indexLine += 13;
                    indexRow = 1;
                    break;
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (parts == PagePart.TABLE && /^[0-9]$/.test(pageLines[indexLine])) {
                    let no = +pageLines[indexLine];
                    if (no == indexRow) {
                        let newTableContent = new TableContent();
                        newTableContent.description =
                            pageLines[indexLine + 1] + " " + pageLines[indexLine + 2];
                        let extractedAmount = yield this.extractAmount(pageLines[indexLine + 3]);
                        newTableContent.unit = extractedAmount.unit;
                        newTableContent.quanity = extractedAmount.quanity;
                        newTableContent.unitPrice = extractedAmount.unitPrice;
                        newTableContent.amount = extractedAmount.amount;
                        result.table.push(newTableContent);
                        indexRow++;
                        indexLine += 4;
                    }
                    else
                        break;
                }
                else
                    break;
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
exports.ViettelInvoiceExtractor = ViettelInvoiceExtractor;
