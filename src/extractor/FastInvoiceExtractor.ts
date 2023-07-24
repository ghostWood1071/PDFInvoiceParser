import { PdfExtractor, IExtractable } from "./PDFExtractor";
import { PageContent, TableContent } from "../model/model";

export class FastInvoiceExtractor extends PdfExtractor{
    private docLines:Promise<any[] | null>;
    constructor(fileName: string) {
        super(fileName);
        this.docLines = this.getDocLines();
    }

    private getDate(dateStr: string){
        let strdata =  dateStr.trim().replace(/\#/g, "").split(" ");
        return new Date(`${strdata[3]}/${strdata[1]}/${strdata[5]}`)
    }

    protected parseNumber(strNum:string, isInt: boolean = true){
        let result = strNum.replace(/\./g, "").replace(/\,/g,".");
        return isInt?parseInt(result):parseFloat(result);
    }

    protected override renderPage(pageData: any): string {
        let render_options = {
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        };
    
        let renderText = (textContent: any) => {
          let lastY,
            text = "";
          for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY) {
                text += "#"+ item.str;
            } else {
                text += "\n" + item.str+"#";
            }
            lastY = item.transform[5];
          }
          return text;
        };
    
        return pageData.getTextContent(render_options).then(renderText);
    }

    private optimizeRow(row:string[]){
        while(row.length>5){
            let tmp = row.splice(0,2);
            row.unshift(tmp.join(""));
        }
    }

    private processTableRow(rowStr: string){
        console.log(rowStr);
        let result = new TableContent();
        let numStartRegex = /^[0-9]+\#+/g;
        rowStr = rowStr.replace(numStartRegex, "").replace(/\#\#/g,"#");
        let raw = rowStr.split("#");
        this.optimizeRow(raw);
        result.product_name = raw[0];
        result.unit = raw[1];
        result.quantity = parseFloat(raw[2].replace(/\./g,"").replace(/\,/, "."));
        result.unit_price = parseFloat(raw[3].replace(/\./g,"").replace(/\,/, "."));
        result.total = parseFloat(raw[4].replace(/\./g,"").replace(/\,/, "."));
        return result;
    }

    private execRegex(str: string, regex: RegExp){
        let result = regex.exec(str);
        return result?result[0]:"";
    }

    private extractVAT(pageLines: string[], pageResult:PageContent){
        let nextPos = this.getUntil(pageLines, 0, "#Ngày").nextPos;
        let tmpL = this.getUntil(pageLines,nextPos, "Mã cơ quan thuế cấp");
        console.log(tmpL.strResult);
        pageResult.date = this.getDate(tmpL.strResult); 
        nextPos = this.getUntil(pageLines,nextPos,"Ký hiệu").nextPos;
        tmpL = this.getUntil(pageLines,nextPos,"Số")
        pageResult.serial = this.getBehind(tmpL.strResult, ":").replace(/\#/g, "");
        tmpL = this.getUntil(pageLines, tmpL.nextPos, "Đơn vị bán hàng");
        pageResult.no = this.getBehind(tmpL.strResult, ":").replace(/\#/g, "");
        tmpL = this.getUntil(pageLines, tmpL.nextPos, "Mã số thuế")
        pageResult.seller.companyName = this.getBehind(tmpL.strResult, ":").replace(/\#/g, "").trim();
        tmpL = this.getUntil(pageLines, tmpL.nextPos, "Địa chỉ")
        pageResult.seller.taxCode = this.getBehind(tmpL.strResult, ":").replace(/\#/g, "");
        nextPos = this.getUntil(pageLines, tmpL.nextPos, "Họ tên người mua hàng").nextPos + 1;
        tmpL = this.getUntil(pageLines, nextPos, "Địa chỉ");
        pageResult.buyer.companyName = this.getBehind(tmpL.strResult, ":").replace(/\#/g, "");
        nextPos = this.getUntil(pageLines, tmpL.nextPos, "Số tài khoản").nextPos+1;
        tmpL = this.getUntil(pageLines, nextPos, "Stt##Tên hàng hóa");
        pageResult.buyer.taxCode = tmpL.strResult.split(":")[2].trim();
        return {nextPos: tmpL.nextPos, strResult: tmpL.strResult};
    }

    private extractExportTicket(pageLines: string[], pageResult:PageContent){
        let nextPos = this.getUntil(pageLines, 0, "Ngày").nextPos;
        let tmpL = this.getUntil(pageLines,nextPos, "Mã cơ quan thuế cấp");
        pageResult.date = this.getDate(tmpL.strResult); 
        nextPos = this.getUntil(pageLines, tmpL.nextPos, "Tên tổ chức").nextPos;
        tmpL = this.getUntil(pageLines,nextPos, "Mã số thuế");
        pageResult.seller.companyName = this.getBehind(tmpL.strResult, ":").replace(/\#/g, "").trim();
        tmpL = this.getUntil(pageLines,tmpL.nextPos, "Địa chỉ");
        pageResult.seller.taxCode = this.getBehind(tmpL.strResult, ":").replace(/\#/g, "").replace(/\s/g, "");
        nextPos = this.getUntil(pageLines,tmpL.nextPos, "Mã số thuế").nextPos;
        tmpL = this.getUntil(pageLines,nextPos, "Nhập tại kho");
        pageResult.buyer.taxCode = this.getBehind(tmpL.strResult, ":").replace(/\#/g, "").replace(/\s/g, "");
        tmpL = this.getUntil(pageLines,tmpL.nextPos, "Ký hiệu");
        pageResult.buyer.companyName = this.getBehind(tmpL.strResult, ":").replace(/\#/g, "");
        pageResult.serial =this.getBehind(pageLines[tmpL.nextPos], ":").replace(/\#/,"").trim();
        tmpL = this.getUntil(pageLines, tmpL.nextPos+1, "Số");
        pageResult.no = tmpL.strResult.replace(/\#/g,"");
        tmpL = this.getUntil(pageLines, tmpL.nextPos, "Thực xuất");
        return {nextPos: tmpL.nextPos, strResult: tmpL.strResult};
    }


    private processPage(pageLines: string[]){
        let tmpLine: string = ""; 
        // /^[0-9]+[A-ZÁÀẠÃẢẮẰẲẶẴẤẦẬẨẪĐÓÒỎỌÕÔỐỒỔỘỖƠỚỜỞỢỠĂƯỨỪỬỰỮÚÙỦỤŨÂÊẾỀỂỆỄÉÈẺẸẼÝỲỶỴỸÍÌỈỊĨ]+|^\d+$/
        let rowRegex = /^(0?[1-9]\d*)#/;
        let endTableRegex = /Mã tra cứu hóa đơn|Tỷ giá/
        let exchangeRegex = /Tỷ giá/g;
        let rateRegex = /#[\d.]+[A-Z]/;
        let pageResult:PageContent = new PageContent();
        if (pageLines.length==0)
            return pageResult;
        let tmpL = this.getUntil(pageLines, 0, "Ngày")
        if (tmpL.strResult.toLocaleLowerCase().includes("phiếu xuất kho"))
            tmpL = this.extractExportTicket(pageLines, pageResult);
        else
            tmpL =  this.extractVAT(pageLines, pageResult);
        let nextPos = tmpL.nextPos + 2;
        
        for(let linePos = nextPos; linePos<pageLines.length; linePos++){
            if (endTableRegex.test(pageLines[linePos])){
                nextPos = linePos;
                break;
            }
            if (rowRegex.test(pageLines[linePos])) {
                if(tmpLine != "") {
                    pageResult.table.push(this.processTableRow(tmpLine));
                    tmpLine = "";
                }
            } 
            tmpLine = tmpLine + pageLines[linePos];
        }
        if(rowRegex.test(tmpLine))
            pageResult.table.push(this.processTableRow(tmpLine));
        if(exchangeRegex.test(pageLines[nextPos])){
           pageResult.exchange_rate = parseFloat(pageLines[nextPos].replace(/\s/g, "").replace(/\#\#/g, "#").split("#")[2]);
        }
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
