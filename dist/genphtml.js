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
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model/model");
const fs = __importStar(require("fs"));
const ViettelInvoiceEctractor_1 = require("./extractor/ViettelInvoiceEctractor");
class HTMLRender {
    constructor() {
    }
    gen(pageContent) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            result.push(`<p>${pageContent.date}</p></br>`);
            result.push(`<p>${pageContent.serial}</p></br>`);
            result.push(`<p>${pageContent.no}</p></br>`);
            result.push(`<p>-------------------------------------------------</p></br>`);
            result.push(`<p>${pageContent.seller.companyName}</p></br>`);
            result.push(`<p>${pageContent.seller.taxCode}</p></br>`);
            result.push(`<p>-------------------------------------------------</p></br>`);
            result.push(`<p>${pageContent.buyer.companyName}</p></br>`);
            result.push(`<p>${pageContent.buyer.taxCode}</p></br>`);
            result.push(`<p>-------------------------------------------------</p></br>`);
            for (let tbl of pageContent.table) {
                result.push(`<p>${tbl.description} |  ${tbl.unit} | ${tbl.quanity} | ${tbl.unitPrice} | ${tbl.amount} </p> </br>`);
            }
            let data = result.join(" ");
            yield fs.writeFileSync('demo.html', data);
        });
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let demo = new HTMLRender();
        let extractor = new ViettelInvoiceEctractor_1.ViettelInvoiceExtractor("../src/pdf/4601194212-C23TVN113.pdf");
        let data = yield extractor.getResult();
        yield demo.gen(data ? data : new model_1.PageContent());
    });
}
main();
