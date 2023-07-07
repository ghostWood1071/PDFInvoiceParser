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
            let dateArr = [];
            while (indexLine <= l) {
                if (pageLines[indexLine] == "Ngày") {
                    parts = model_1.PagePart.DATE;
                }
                if (pageLines[indexLine] == "Ký hiệu") {
                    result.date = new Date(dateArr.reverse().join("/"));
                    break;
                }
                else if (parts == model_1.PagePart.DATE &&
                    pageLines[indexLine].trim().startsWith("(")) {
                    indexLine++;
                    dateArr.push(pageLines[indexLine].split(" ")[0]);
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == " (Serial):") {
                    parts = model_1.PagePart.SERIAL;
                    indexLine++;
                }
                if (pageLines[indexLine] == "Số")
                    break;
                else if (parts == model_1.PagePart.SERIAL) {
                    result.serial = result.serial + pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == " (No.):") {
                    parts = model_1.PagePart.NO;
                    indexLine++;
                }
                if (pageLines[indexLine] == "Đơn vị bán hàng")
                    break;
                else if (parts == model_1.PagePart.NO) {
                    result.no = result.no + pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == " (Company): ") {
                    parts = model_1.PagePart.SELLER_COMPANY_NAME;
                    indexLine++;
                }
                if (pageLines[indexLine] == "Mã số thuế")
                    break;
                else if (parts == model_1.PagePart.SELLER_COMPANY_NAME) {
                    result.seller.companyName += pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == " (Tax code): ") {
                    parts = model_1.PagePart.SELLER_TAX_CODE;
                    indexLine++;
                }
                if (pageLines[indexLine] == "Địa chỉ")
                    break;
                else if (parts == model_1.PagePart.SELLER_TAX_CODE) {
                    result.seller.taxCode += pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == " (Company's name): ") {
                    parts = model_1.PagePart.SELLER_COMPANY_NAME;
                    indexLine++;
                }
                if (pageLines[indexLine] == "Mã số thuế")
                    break;
                else if (parts == model_1.PagePart.SELLER_COMPANY_NAME) {
                    result.buyer.companyName += pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == " (Tax code): ") {
                    parts = model_1.PagePart.SELLER_TAX_CODE;
                    indexLine++;
                }
                if (pageLines[indexLine] == "Địa chỉ")
                    break;
                else if (parts == model_1.PagePart.SELLER_TAX_CODE) {
                    result.buyer.taxCode += pageLines[indexLine];
                }
                indexLine++;
            }
            while (indexLine <= l) {
                if (pageLines[indexLine] == "STT") {
                    parts = model_1.PagePart.TABLE;
                    indexLine += 13;
                    break;
                }
                indexLine++;
            }
            while (indexLine < l) {
                let no = +pageLines[indexLine];
                if (parts == model_1.PagePart.TABLE && !isNaN(no)) {
                    let newTableContent = new model_1.TableContent();
                    indexLine++;
                    let nextLine = "";
                    while (indexLine < l) {
                        nextLine = pageLines[indexLine + 1];
                        if (!isNaN(+nextLine) ||
                            nextLine.startsWith("Đơn vị cung cấp") ||
                            nextLine == "Cộng tiền hàng hóa, dịch vụ")
                            break;
                        else {
                            newTableContent.product_name += pageLines[indexLine];
                            indexLine++;
                        }
                    }
                    let extractedAmount = yield this.extractAmount(pageLines[indexLine]);
                    newTableContent.unit = extractedAmount.unit;
                    newTableContent.quanity = extractedAmount.quanity;
                    newTableContent.unit_price = extractedAmount.unitPrice;
                    newTableContent.total = extractedAmount.amount;
                    result.table.push(newTableContent);
                    indexLine++;
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
            // let result = await data?.map(
            //   async (x) => (x = JSON.stringify(await this.processLines(x)))
            // );
            let result = data ? yield this.processLines(data[0]) : null;
            return result;
        });
    }
}
exports.ViettelInvoiceExtractor = ViettelInvoiceExtractor;
