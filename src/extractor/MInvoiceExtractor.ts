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

    protected override getUntil(pageLines: string[], posPart: number, ending: string) {
        let result = "";
        let pos = posPart;
        for (let i = posPart; i < pageLines.length; i++) {
          if (pageLines[i].toLocaleLowerCase() == ending || pageLines[i].toLocaleLowerCase().startsWith(ending.toLocaleLowerCase())) {
            pos = i;
            break;
          } else result = result + pageLines[i] + " ";
        }
        return { strResult: result, nextPos: pos };
    }

    private getByFilter(pageLines:string[], posPart: number, endingCondition: (x:string)=>boolean){
        let result = "";
        let pos = posPart;
        for (let i = posPart; i < pageLines.length; i++) {
            if (endingCondition(pageLines[i])) {
              pos = i;
              break;
            } else result = result + pageLines[i] + " ";
          }
        return { strResult: result, nextPos: pos };
    }

    protected renderPage(pageData: any): string {
        let render_options = {
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        };
        let renderText = (textContent: any) => {
          let regex = /^[\d,.]+$/;
          let lastY,
            text = "";
          for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY) {
              text += "#" + item.str;
            } else {
              text += "\n" + item.str;
            }
            lastY = item.transform[5];
          }
          return text;
        };
    
        return pageData.getTextContent(render_options).then(renderText);
    }


    private processTableRow(rowStr: string){
        rowStr = rowStr.substring(0, rowStr.length-1).replace(/\s+/g, " ");
        let result = new TableContent();
        let raw = rowStr.split("|");
        let rawPrice = raw[0].split("#");
        result.total = parseFloat(rawPrice[0].replace(/\./g, "").replace(/\,/g,".")); 
        result.unit_price = parseFloat(rawPrice[1].replace(/\./g, "").replace(/\,/g,".")); 
        result.quantity = parseFloat(rawPrice[2].replace(/\./g, "").replace(/\,/g,".")); 
        result.unit = raw[1].split("#")[0];
        let tmpNameArr = raw.splice(0, 2);
        result.product_name = raw.join(" ");
        if(result.product_name == "")
            result.product_name = tmpNameArr[1].split("#")[1];
        return result;
    }

    private processPage(pageLines: string[]){
        let rowRegex = /^(\d+.)+\d$/
        let enTableRegex = /Người mua hàng|None#Chuyển sang trang sau/g;
        let result = new PageContent();
        let nextPos = this.getUntil(pageLines, 0, "#CÔNG TY").nextPos;
        let tmpLine = this.getByFilter(pageLines,nextPos, (x:string)=> {  
           return x.toLowerCase().includes("số tài khoản") ||
                  x.toLowerCase().includes("stk")
        });
        result.buyer.companyName = tmpLine.strResult.replace(/\#/g, "").trim();
        nextPos = this.getUntil(pageLines, tmpLine.nextPos, "Mã số thuế").nextPos;
        tmpLine = this.getUntil(pageLines, nextPos,"CÔNG TY");
        if(tmpLine.strResult.includes("#"))
            result.seller.taxCode = this.getBehind(tmpLine.strResult,"#");
        else{
            let tmpTax = tmpLine.strResult.match(/\d+/);
            result.seller.taxCode = tmpTax?tmpTax[0]:"";
        }
        result.seller.companyName = pageLines[tmpLine.nextPos];
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
        for(let linePos = nextPos; linePos<pageLines.length-1; linePos++){
            if (enTableRegex.test(pageLines[linePos]) || pageLines[linePos+1].includes("Amount in words")){
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
        if(rowRegex.test(line))
            result.table.push(this.processTableRow(line));
        tmpLine = this.getUntil(pageLines, nextPos, "");
        return result;
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