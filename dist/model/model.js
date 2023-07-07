"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagePart = exports.TableContent = exports.PageContent = void 0;
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
exports.PageContent = PageContent;
class TableContent {
    constructor() {
        this.description = "";
        this.unit = "";
        this.quanity = 0;
        this.unitPrice = 0;
        this.amount = 0;
    }
}
exports.TableContent = TableContent;
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
})(PagePart || (exports.PagePart = PagePart = {}));
