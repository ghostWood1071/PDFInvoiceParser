import { PageContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class VNPInvoiceExtractor extends PdfExtractor {
    private docLines:Promise<any[] | null>;
    constructor(fileName:string){
        super(fileName);
        this.docLines = this.getDocLines();
    }

    private getDate(str:string){
        let rawNum = str.split(" ")
        return new Date(`${rawNum[5].replace("#", "")}-${rawNum[2].replace("#", "")}-${rawNum[8].replace("#", "")}`);
    }

    private processPage(pageLines: string[]){
        let result = new PageContent();
        if (pageLines.length==0)
            return result;
        result.date = this.getDate(pageLines[7]);
        result.serial = this.getBehind(pageLines[10], ":")
        result.no = this.getBehind(pageLines[11],":")
        this.getUntil(pageLines, 12, "Mã số thuế")

        return result;
    }

    async getResult() {
        let pageLines = await this.docLines;
        if (pageLines){
            if(pageLines.length >= 1){
                    let data = this.processPage(pageLines[0]);
                    return data;
                // } else {
                //     let result:PageContent = this.processPage(pageLines[0]);
                //     for(let pageNum = 1; pageNum<pageLines.length; pageNum++){
                //         let tmpPage:PageContent = this.processPage(pageLines[pageNum]);
                //         result.exchange_rate = tmpPage.exchange_rate?tmpPage.exchange_rate:result.exchange_rate;
                //         result.vat_rate = tmpPage.vat_rate!=0||tmpPage.vat_rate!=null?tmpPage.vat_rate:result.vat_rate;
                //         result.table = result.table.concat(tmpPage.table);
                //     }
                //     return result;
                // }
                
            }
            else {
                throw new Error("Không thể đọc file PDF");
            }
        }
    }
}