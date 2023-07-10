import { PdfExtractor, IExtractable } from "./PDFExtractor";
import { PageContent, TableContent } from "../model/model";

export class MSTInvoiceExtractor extends PdfExtractor{
    private docLines:Promise<any[] | null>;
    constructor(fileName:string){
        super(fileName);
        this.docLines = this.getDocLines();
    }

    private getDate(dateStr: string){
        let strdata =  dateStr.split(" ");
        return new Date(`${strdata[3]}/${strdata[1]}/${strdata[5]}`)
    }

    protected parseNumber(strNum:string, isInt: boolean = true){
        // console.log(strNum);
        let result = strNum.replace(".", "").replace(",", ".");
        return isInt?parseInt(result):parseFloat(result);
    }

    private processTableRow(rowStr: string){
       
        let result = new TableContent();
        let numStartRegex = /^[0-9]+/g;
        rowStr = rowStr.replace(numStartRegex, "");
        let spltSignPos = rowStr.lastIndexOf(")");
        result.product_name = rowStr.substring(0, spltSignPos+1);
        rowStr = rowStr.substring(spltSignPos+1, rowStr.length);
        let UnitAndPrice = rowStr.split("#");
        result.unit = UnitAndPrice[0];
        result.quantity = this.parseNumber(UnitAndPrice[1], false);
        result.unit_price = this.parseNumber(UnitAndPrice[2], false);
        result.total = this.parseNumber(UnitAndPrice[3], false);
        return result;
    }

    private execRegex(str: string, regex: RegExp){
        let result = regex.exec(str);
        return result?result[0]:"";
    }

    private processPage(pageLines: string[]){
        let tmpLine: string = "";
        let rowRegex = /^[0-9]+[A-Z]+|^\d+$/
        let endTableRegex = /Mã tra cứu hóa đơn:/
        let exchangeRegex = /Tỷ giá:/g;
        let rateRegex = /#[\d.]+[A-Z]/;
        let rateVATstartRegex = /Thuế suất/;
        let rateVATRegex = /:[\d.]\%/; 
        let pageResult:PageContent = new PageContent();
        if (pageLines.length==0)
            return pageResult;
        let nextPos = this.getUntil(pageLines, 0, "Ngày").nextPos;
        let tmpL = this.getUntil(pageLines,nextPos, "Mã cơ quan thuế cấp");
        pageResult.date = this.getDate(tmpL.strResult);
        nextPos = this.getUntil(pageLines,nextPos,"Ký hiệu").nextPos;
        tmpL = this.getUntil(pageLines,nextPos,"Số")
        pageResult.serial = this.getBehind(tmpL.strResult, ":");
        tmpL = this.getUntil(pageLines, tmpL.nextPos, "Đơn vị bán hàng");
        pageResult.no = this.getBehind(tmpL.strResult, ":").replace("#", "");
        //get seller
        let sellerNameResult = this.getUntil(pageLines, tmpL.nextPos, "Mã số thuế:")
        pageResult.seller.companyName = this.getBehind(sellerNameResult.strResult, ":");
        let sellerTaxResult = this.getUntil(pageLines, sellerNameResult.nextPos, "Địa chỉ:")
        pageResult.seller.taxCode = this.getBehind(sellerTaxResult.strResult, ":");
        nextPos = this.getUntil(pageLines, sellerTaxResult.nextPos, "Họ tên người mua hàng:").nextPos + 1;
        let buyerNameResult = this.getUntil(pageLines, nextPos, "Địa chỉ:");
        pageResult.buyer.companyName = this.getBehind(buyerNameResult.strResult, ":");
        nextPos = this.getUntil(pageLines, buyerNameResult.nextPos, "Số tài khoản:").nextPos+1;
        let buyerTaxResult = this.getUntil(pageLines, nextPos, "SttTên hàng hóa");
        pageResult.buyer.taxCode = buyerTaxResult.strResult.split(":")[2].trim();
        nextPos = buyerTaxResult.nextPos + 2;
        
        for(let linePos = nextPos; linePos<pageLines.length; linePos++){
            if (exchangeRegex.test(pageLines[linePos])){
                let numstr = this.execRegex(pageLines[linePos], rateRegex).replace("#","");
                let rate = parseFloat(numstr.substring(0, numstr.length-1));
                pageResult.exchange_rate = rate?rate:null;
            }
            if(rateVATstartRegex.test(pageLines[linePos])){
                pageResult.vat_rate = parseFloat(this.execRegex(pageLines[linePos], rateVATRegex).replace(":","").replace("%",""));
                break;
            }
            if (endTableRegex.test(pageLines[linePos]))
                break;
            if (rowRegex.test(pageLines[linePos])) {
                if(tmpLine != "") {
                    pageResult.table.push(this.processTableRow(tmpLine));
                    tmpLine = "";
                }
            } 
            tmpLine = tmpLine + pageLines[linePos];
        }
        pageResult.table.push(this.processTableRow(tmpLine));
        return pageResult;
    }

    async getResult() {
        let pageLines = await this.docLines;
        if (pageLines){
            if(pageLines.length == 1){
                let data = this.processPage(pageLines[0]);
                return data;
            } else {
                let result:PageContent = this.processPage(pageLines[0]);
                for(let pageNum = 1; pageNum<pageLines.length; pageNum++){
                    let tmpPage:PageContent = this.processPage(pageLines[pageNum]);
                    result.exchange_rate = tmpPage.exchange_rate?tmpPage.exchange_rate:result.exchange_rate;
                    result.vat_rate = tmpPage.vat_rate!=0&&tmpPage.vat_rate!=null?tmpPage.vat_rate:result.vat_rate;
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
