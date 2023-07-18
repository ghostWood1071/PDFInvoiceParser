import { PageContent, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class meInvoiceExtractor extends PdfExtractor {
    private docLines:Promise<any[] | null>;
    constructor(fileName:string){
        super(fileName);
        this.docLines = this.getDocLines();
    }

    protected override renderPage(pageData:any): string {
        let render_options = {
            normalizeWhitespace: false,
            disableCombineTextItems: false
        }
        let renderText = (textContent:any) => {
          let regex = /^[\d,.]+$/
          let lastY, text = '';
          for (let item of textContent.items) {
              if (lastY == item.transform[5] || !lastY){
                    if (regex.test(item.str)){
                        text += "#"+item.str+"#";
                    }
                    else if(item.str.endsWith(" "))
                        text+=item.str;
                    else
                        text +=  item.str+"#";
              }  
              else{
                if (regex.test(item.str))
                    text += "\n#"+item.str+"#";
                else 
                    text += '\n' + item.str;
              }    
              lastY = item.transform[5];
          }
          return text;
        }
        return pageData.getTextContent(render_options).then(renderText);
    }

    private getDate(str:string){
        let raw = str.replace(/\#\#/g, "#").split("#");
        return new Date(`${raw[4]}-${raw[1]}-${raw[7]}`);
    }

    private simplifyRow(rawArr:string[]){
        while(rawArr.length>5){
            let tmp = rawArr.splice(0, 2).join(" ");
            rawArr.unshift(tmp);
        }
    }

    private processTableRow(rowStr: string){
        rowStr = rowStr.replace(/\#\#/g, "#");
        let result = new TableContent();
        let numStartRegex = /^\#[0-9.,]+\#/g;
        rowStr = rowStr.replace(numStartRegex, "");
        if(rowStr.endsWith("#"))
            rowStr = rowStr.substring(0, rowStr.length-2);
        rowStr = rowStr.replace(/\#{2,}/g, "#");
        let raw = rowStr.split("#")
        this.simplifyRow(raw);
        result.product_name = raw[0];
        result.unit = raw[1];
        result.quantity = parseFloat(raw[2].replace(/\./g,"").replace(/\,/,"."))
        result.unit_price = parseFloat(raw[3].replace(/\./g,"").replace(/\,/,"."))
        result.total = parseFloat(raw[4].replace(/\./g,"").replace(/\,/,"."))
        return result;
    }

    private processPage(pageLines: string[]){
        let rowRegex = /^#(0?[1-9]\d*)#/;
        let enTableRegex = /Cộng tiền|Hình thức thanh toán|Người mua hàng|Số:#|\d+\/\d+|\(Theo PO đặt hàng số/;
        let result = new PageContent();
        let nextPos = this.getUntil(pageLines, 0, "CÔNG TY").nextPos;
        let tmpLine = this.getUntil(pageLines,nextPos, "Mã số thuế");
        result.seller.companyName = tmpLine.strResult.replace(/\#/g, "").trim();
        tmpLine = this.getUntil(pageLines, tmpLine.nextPos, "Địa chỉ");
        if(tmpLine.strResult.includes("Mã số thuế")){
            result.seller.taxCode = this.getBehind(tmpLine.strResult.replace(new RegExp("#", "g"), ""), ":");
            nextPos = this.getUntil(pageLines, tmpLine.nextPos, "Tên đơn vị").nextPos;
            tmpLine = this.getUntil(pageLines, nextPos, "Mã số thuế")
            result.buyer.companyName = this.getBehind(tmpLine.strResult, ":").replace(/\#/g, "");;
            tmpLine = this.getUntil(pageLines,tmpLine.nextPos,"Địa chỉ");
            result.buyer.taxCode = this.getBehind(tmpLine.strResult.replace(new RegExp("#", "g"), ""), ":"); 
            nextPos = this.getUntil(pageLines, tmpLine.nextPos, "Ngày").nextPos;
            tmpLine = this.getUntil(pageLines, nextPos, "Mã CQT");
            result.date = this.getDate(tmpLine.strResult);
            nextPos = this.getUntil(pageLines, tmpLine.nextPos, "Ký hiệu").nextPos;
            tmpLine = this.getUntil(pageLines,nextPos, "Số")
            result.serial = tmpLine.strResult.split(":")[1].replace(new RegExp("#", "g"), "").trim();
            tmpLine = this.getUntil(pageLines, tmpLine.nextPos, "STT");
            result.no = tmpLine.strResult.split(":")[1].replace(new RegExp("#", "g"), "").trim();
        }
        nextPos = this.getUntil(pageLines,tmpLine.nextPos, "(Amount)").nextPos+1;
        if(enTableRegex.test(pageLines[nextPos-1]))
            return result;
        let line = "";
        for(let linePos = nextPos; linePos<pageLines.length; linePos++){
            if(!pageLines[linePos].includes("STT#Tên hàng hóa")){
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
                    line = line + pageLines[linePos] + (pageLines[linePos]==""?"":"#");
            }
        }

        if(rowRegex.test(line))
            result.table.push(this.processTableRow(line));
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