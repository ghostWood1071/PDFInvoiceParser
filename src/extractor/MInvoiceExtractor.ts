import { PageContent, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class MInvoiceExtractor extends PdfExtractor {
    private docLines: Promise<any[] | null>;
    constructor(fileName: string) {
        super(fileName);
        this.docLines = this.getDocLines();
    }
 
    private getDate(str:string){
        let raw = str.split(" ");
        return new Date(`${raw[7]}-${raw[3]}-${raw[10]}`);
    }


    private processTableRow(rowStr: string){
        let result = new TableContent();
        let raw = rowStr.split("|");
        let rawPrice = raw[0].split("#");
        result.total = parseFloat(rawPrice[0].replace(".", "").replace(",",".")); 
        result.unit_price = parseFloat(rawPrice[1].replace(".", "").replace(",",".")); 
        result.quantity = parseFloat(rawPrice[2].replace(".", "").replace(",",".")); 
        result.unit = raw[1].split("#")[0];
        raw.splice(0, 2);
        result.product_name = raw.join("");
        return result;
    }

    private processPage(pageLines: string[]){
        let rowRegex = /^(\d+.)+\d$/
        let enTableRegex = /Người mua hàng/;
        let result = new PageContent();
        let nextPos = this.getUntil(pageLines, 0, "CÔNG TY").nextPos;
        let tmpLine = this.getUntil(pageLines,nextPos, "Số tài khoản");
        result.seller.companyName = tmpLine.strResult;
        nextPos = this.getUntil(pageLines, tmpLine.nextPos, "Mã số thuế").nextPos;
        tmpLine = this.getUntil(pageLines, nextPos,"CÔNG TY");
        result.seller.taxCode = this.getBehind(tmpLine.strResult,"#");
        result.buyer.companyName = pageLines[tmpLine.nextPos];
        nextPos = this.getUntil(pageLines,nextPos+1,"HÓA ĐƠN GIÁ TRỊ GIA TĂNG").nextPos+1;
        result.serial = pageLines[nextPos];
        result.no = pageLines[nextPos+1];
        nextPos = this.getUntil(pageLines,nextPos+2, "(At):").nextPos+1; 
        result.date = this.getDate(pageLines[nextPos]);
        nextPos = this.getUntil(pageLines, nextPos, "(Tax code):").nextPos;
        tmpLine = this.getUntil(pageLines,nextPos, "Mã số thuế");
        result.buyer.taxCode = this.getBehind(tmpLine.strResult,":");
        nextPos = tmpLine.nextPos;
        while(nextPos<pageLines.length-1){
            if(rowRegex.test(pageLines[nextPos])){
                break;
            } else nextPos++;
        }
        let line = "";
        for(let linePos = nextPos; linePos<pageLines.length; linePos++){
            if (enTableRegex.test(pageLines[linePos])){
                nextPos = linePos;
                break;
            }
            if (rowRegex.test(pageLines[linePos])) {
                if(line != "") {
                    result.table.push(this.processTableRow(line));
                    line = "";
                }
            } 
            line = line + pageLines[linePos] + "|";
        }
        result.table.push(this.processTableRow(line));
        tmpLine = this.getUntil(pageLines, nextPos, "")
        return result;
    }

    async getResult() {
        let pageLines = await this.docLines;
        if (pageLines){
            if(pageLines.length >= 1){
                let data = this.processPage(pageLines[0]);
                return data;
            } else {
                let result:PageContent = this.processPage(pageLines[0]);
                for(let pageNum = 1; pageNum<pageLines.length; pageNum++){
                    let tmpPage:PageContent = this.processPage(pageLines[pageNum]);
                    result.exchange_rate = tmpPage.exchange_rate?tmpPage.exchange_rate:result.exchange_rate;
                    result.vat_rate = tmpPage.vat_rate!=0||tmpPage.vat_rate!=null?tmpPage.vat_rate:result.vat_rate;
                    result.table = result.table.concat(tmpPage.table);
                }
                return result;
            }
            
        }
        else {
            throw new Error("Không thể đọc file PDF");
        }
    }
    
}