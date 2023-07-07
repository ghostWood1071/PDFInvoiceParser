import { PdfExtractor, IExtractable } from "./PDFExtractor";
import { PageContent } from "../model/model";
export class MSTInvoiceExtractor extends PdfExtractor{
    private docLines:Promise<any[] | null>;
    private pos: number;
    constructor(fileName:string){
        super(fileName);
        this.docLines = this.getDocLines();
        this.pos = 0;
    }

    private getDate(dateStr: string){
        console.log(dateStr);
        let strdata =  dateStr.split(" ");
        return new Date(`${strdata[3]}/${strdata[1]}/${strdata[5]}`)
    }

    private getBehind(input:string, split: string){
        return input.split(split)[1].trim();
    }

    private getUntil(pageLines:string[], posPart: number, ending: string){
        let result = "";
        let pos = posPart;
        for(let i=posPart; i<pageLines.length; i++){
            if(pageLines[i] == ending || pageLines[i].startsWith(ending)){
                pos = i;
                break;
            }
            else
                result = result + pageLines[i]+ " "
        }
        // result = this.getBehind(result.trim(), ":")
        return {strResult: result, nextPos: pos};
    }

    private processLine(pageLines: string[]){
        let pageResult:PageContent = new PageContent();
        pageResult.date = this.getDate(pageLines[2]);
        pageResult.serial = this.getBehind(pageLines[5], ":");
        pageResult.no = this.getBehind(pageLines[6], ":");
        //get seller
        let sellerNameResult = this.getUntil(pageLines, 7, "Mã số thuế:")
        pageResult.seller.companyName = this.getBehind(sellerNameResult.strResult, ":");
        let sellerTaxResult = this.getUntil(pageLines, sellerNameResult.nextPos, "Địa chỉ:")
        pageResult.seller.taxCode = this.getBehind(sellerTaxResult.strResult, ":");
        let nextPos = this.getUntil(pageLines, sellerTaxResult.nextPos, "Họ tên người mua hàng:").nextPos + 1;
        let buyerNameResult = this.getUntil(pageLines, nextPos, "Địa chỉ:");
        pageResult.buyer.companyName = this.getBehind(buyerNameResult.strResult, ":");
        nextPos = this.getUntil(pageLines, buyerNameResult.nextPos, "Số tài khoản:").nextPos+1;
        let buyerTaxResult = this.getUntil(pageLines, nextPos, "SttTên hàng hóa");
        pageResult.buyer.taxCode = buyerTaxResult.strResult.split(":")[2].trim();
        nextPos = buyerTaxResult.nextPos;
        return pageResult;
    }

    async getResult() {
        let pageLines = await this.docLines;
        if (pageLines){
            let data = this.processLine(pageLines[0]);
            console.log(data);
            return "done";
        }
        return "fail";
    }

    
    async extractInfo() {
        
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

let mst = new MSTInvoiceExtractor("../src/pdf/1C23TGT-281.pdf");
mst.getResult().then((res)=>{
    console.log(res);
})