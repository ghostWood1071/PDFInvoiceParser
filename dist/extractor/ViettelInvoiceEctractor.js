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
const model_1 = require("../model/model");
const PDFExtractor_1 = require("./PDFExtractor");
class ViettelInvoiceExtractor extends PDFExtractor_1.PdfExtractor {
    constructor(fileName) {
        super(fileName);
        this.docLines = this.getDocLines();
    }
    processLines(pageLines) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = new model_1.PageContent();
            let parts = model_1.PagePart.NONE;
            let indexLine = 0;
            let l = pageLines.length;
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Ngày") {
                    parts = model_1.PagePart.DATE;
                }
                if (pageLines[indexLine] == "Ký hiệu")
                    break;
                else if (parts == model_1.PagePart.DATE) {
                    result.date = result.date + pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Ký hiệu") {
                    parts = model_1.PagePart.SERIAL;
                }
                if (pageLines[indexLine] == "Số")
                    break;
                else if (parts == model_1.PagePart.SERIAL) {
                    result.serial = result.serial + pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Số") {
                    parts = model_1.PagePart.NO;
                }
                if (pageLines[indexLine] == "Đơn vị bán hàng")
                    break;
                else if (parts == model_1.PagePart.NO) {
                    result.no = result.no + pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Đơn vị bán hàng") {
                    parts = model_1.PagePart.SELLER_COMPANY_NAME;
                }
                if (pageLines[indexLine] == "Mã số thuế")
                    break;
                else if (parts == model_1.PagePart.SELLER_COMPANY_NAME) {
                    result.seller.companyName += pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Mã số thuế") {
                    parts = model_1.PagePart.SELLER_TAX_CODE;
                }
                if (pageLines[indexLine] == "Địa chỉ")
                    break;
                else if (parts == model_1.PagePart.SELLER_TAX_CODE) {
                    result.seller.taxCode += pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Tên đơn vị") {
                    parts = model_1.PagePart.SELLER_COMPANY_NAME;
                }
                if (pageLines[indexLine] == "Mã số thuế")
                    break;
                else if (parts == model_1.PagePart.SELLER_COMPANY_NAME) {
                    result.buyer.companyName += pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Mã số thuế") {
                    parts = model_1.PagePart.SELLER_TAX_CODE;
                }
                if (pageLines[indexLine] == "Địa chỉ")
                    break;
                else if (parts == model_1.PagePart.SELLER_TAX_CODE) {
                    result.buyer.taxCode += pageLines[indexLine];
                }
                indexLine++;
            }
            let indexRow = 0;
            while (indexLine <= l) {
                if (pageLines[indexLine] == "STT") {
                    parts = model_1.PagePart.TABLE;
                    indexLine += 13;
                    indexRow = 1;
                    break;
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (parts == model_1.PagePart.TABLE && /^[0-9]$/.test(pageLines[indexLine])) {
                    let no = +pageLines[indexLine];
                    if (no == indexRow) {
                        let newTableContent = new model_1.TableContent();
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
