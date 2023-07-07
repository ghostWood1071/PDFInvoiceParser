"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExtractor = void 0;
const fs = __importStar(require("fs"));
const pdf_lib_1 = require("pdf-lib");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
class PdfExtractor {
    constructor(fileName) {
        this.fileName = fileName;
    }
    getDocInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let fileBuff = yield fs.readFileSync(this.fileName);
            let parser = yield (0, pdf_parse_1.default)(fileBuff);
            return JSON.stringify(parser.metadata);
        });
    }
    getDocLines() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = this.extracted ? this.extracted : yield this.extractPDF();
                let textPageArr = data.textPages;
                let result = [];
                for (let textPage of textPageArr) {
                    result.push(textPage.split("\n"));
                }
                return result;
            }
            catch (e) {
                console.log(e);
                return null;
            }
        });
    }
    getPageBuffer(document, pageNum) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let newDoc = yield pdf_lib_1.PDFDocument.create();
                let [page] = yield newDoc.copyPages(document, [pageNum]);
                newDoc.addPage(page);
                let buffArr = yield newDoc.save();
                let buff = Buffer.from(buffArr);
                return buff;
            }
            catch (err) {
                console.log(err);
                return null;
            }
        });
    }
    getTextInPages(document) {
        return __awaiter(this, void 0, void 0, function* () {
            let pageText = [];
            for (let pageNum = 0; pageNum < document.getPageCount(); pageNum++) {
                let pageBuff = yield this.getPageBuffer(document, pageNum);
                if (!pageBuff)
                    continue;
                let parser = yield (0, pdf_parse_1.default)(pageBuff);
                pageText.push(parser.text);
            }
            return pageText;
        });
    }
    extractPDF() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let fileContent = yield fs.readFileSync(this.fileName);
                let pdfDoc = yield pdf_lib_1.PDFDocument.load(fileContent);
                let pageTextArr = yield this.getTextInPages(pdfDoc);
                let docInfo = yield this.getDocInfo();
                this.extracted = {
                    textPages: pageTextArr,
                    supplier: docInfo,
                };
                return this.extracted;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    extractAmount(amountStr) {
        return __awaiter(this, void 0, void 0, function* () {
            let amountObj = {
                unit: "",
                quanity: 0,
                unitPrice: 0,
                amount: 0,
            };
            let splitString = amountStr.split(/(\d+)/);
            amountObj.unit = splitString[0];
            splitString = splitString.slice(1, splitString.length - 1);
            const countDot = splitString.reduce((count, x) => (count = x == "." ? count + 1 : count), 0);
            splitString = splitString.filter((x) => x != ".");
            const l = splitString.length;
            let amount = "";
            let unitPrice = "";
            while (splitString.length > 0) {
                let x = splitString.pop();
                if (x != null) {
                    if (x.length == 3) {
                        amount = x + amount;
                    }
                    else if (x.length > 3) {
                        unitPrice = x.slice(0, 3);
                        amount = x.slice(3) + amount;
                        amountObj.amount = +amount;
                        break;
                    }
                }
            }
            while (splitString.length > 0) {
                let x = splitString.pop();
                if (x != null) {
                    if (splitString.length >= 1) {
                        if (x.length == 3) {
                            unitPrice = x + unitPrice;
                        }
                        else if (x.length > 3) {
                            let quanity = x.slice(0, 3);
                            unitPrice = x.slice(3) + unitPrice;
                            amountObj.unitPrice = +unitPrice;
                            amountObj.quanity = +(splitString.join("") + quanity);
                            return amountObj;
                        }
                    }
                    else {
                        for (let i = 1; i <= 3; i++) {
                            let j = x.length - i;
                            if (j >= 1 && j <= 3) {
                                let quanity = +x.slice(0, i);
                                let unitPriceTmp = +(x.slice(i) + unitPrice);
                                if (quanity * unitPriceTmp == amountObj.amount) {
                                    amountObj.quanity = quanity;
                                    amountObj.unitPrice = unitPriceTmp;
                                    return amountObj;
                                }
                            }
                        }
                    }
                }
            }
            return amountObj;
        });
    }
    saveRaw(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = this.extracted ? this.extracted : yield this.extractPDF();
                yield fs.writeFileSync(fileName, JSON.stringify(data));
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    saveRawText(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = this.extracted ? this.extracted : yield this.extractPDF();
                let textArray = data.textPages;
                for (let i = 0; i < textArray.length; i++) {
                    yield fs.writeFileSync(`${fileName}-${i}.txt`, textArray[i]);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
exports.PdfExtractor = PdfExtractor;
