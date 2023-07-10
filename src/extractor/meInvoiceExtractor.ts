import { PageContent, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class meInvoiceExtractor extends PdfExtractor {
    private docLines:Promise<any[] | null>;
    constructor(fileName:string){
        super(fileName);
        this.docLines = this.getDocLines();
    }

    protected override renderPage(pageData:any): string {
        //check documents https://mozilla.github.io/pdf.js/
        let render_options = {
            //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
            normalizeWhitespace: false,
            //do not attempt to combine same line TextItem's. The default value is `false`.
            disableCombineTextItems: false
        }
  
        let renderText = (textContent:any) => {
          //fs.writeFileSync('lol.json', JSON.stringify(textContent));
          let regex = /^[\d,.]+$/
          let lastY, text = '';
          for (let item of textContent.items) {
              if (lastY == item.transform[5] || !lastY){
                //   if(regex.test(item.str))
                //     text += "#"+item.str;
                //   else 
                    text +=  item.str+"#";
              }  
              else{
                  text += '\n' + item.str;
              }    
              lastY = item.transform[5];
          }
          return text;
        }
    
        return pageData.getTextContent(render_options).then(renderText);
    }

    private getDate(str:string){
        let raw = str.split("#");
        return new Date(`${raw[4]}-${raw[1]}-${raw[7]}`);
    }


    private processTableRow(rowStr: string){
        let result = new TableContent();
        let numStartRegex = /^[0-9]+/g;
        rowStr = rowStr.replace(numStartRegex, "");
        let raw = rowStr.split("#")
        result.product_name = raw[0];
        result.unit = raw[1];
        result.quantity = parseFloat(raw[2].replace(".","").replace(",","."))
        result.unit_price = parseFloat(raw[3].replace(".","").replace(",","."))
        result.total = parseFloat(raw[4].replace(".","").replace(",","."))
        // let spltSignPos = rowStr.lastIndexOf(")");
        // result.product_name = rowStr.substring(0, spltSignPos+1);
        // rowStr = rowStr.substring(spltSignPos+1, rowStr.length);
        // let UnitAndPrice = rowStr.split("#");
        // result.unit = UnitAndPrice[0];
        // result.quantity = this.parseNumber(UnitAndPrice[1], false);
        // result.unit_price = this.parseNumber(UnitAndPrice[2], false);
        // result.total = this.parseNumber(UnitAndPrice[3], false);
        return result;
    }

    private processPage(pageLines: string[]){
        let rowRegex = /[0-9]+[A-Z]+|^\d+$/
        let enTableRegex = /Cộng tiền hàng/;
        let result = new PageContent();
        let nextPos = this.getUntil(pageLines, 0, "CÔNG TY").nextPos;
        let tmpLine = this.getUntil(pageLines,nextPos, "Mã số thuế");
        result.seller.companyName = tmpLine.strResult;
        tmpLine = this.getUntil(pageLines, tmpLine.nextPos, "Địa chỉ");
        result.seller.taxCode = this.getBehind(tmpLine.strResult.replace(new RegExp("#", "g"), ""), ":");
        nextPos = this.getUntil(pageLines, tmpLine.nextPos, "Tên đơn vị").nextPos;
        tmpLine = this.getUntil(pageLines, nextPos, "Mã số thuế")
        result.buyer.companyName = this.getBehind(tmpLine.strResult, ":");
        tmpLine = this.getUntil(pageLines,tmpLine.nextPos,"Địa chỉ");
        result.buyer.taxCode = this.getBehind(tmpLine.strResult.replace(new RegExp("#", "g"), ""), ":"); 
        nextPos = this.getUntil(pageLines, tmpLine.nextPos, "Ngày").nextPos;
        tmpLine = this.getUntil(pageLines, nextPos, "Mã CQT");
        result.date = this.getDate(tmpLine.strResult);
        nextPos = this.getUntil(pageLines, tmpLine.nextPos, "Ký hiệu").nextPos;
        tmpLine = this.getUntil(pageLines,nextPos, "Số(No.)")
        result.serial = tmpLine.strResult.split(":")[1].replace(new RegExp("#", "g"), "").trim();
        tmpLine = this.getUntil(pageLines, tmpLine.nextPos, "STT");
        result.no = tmpLine.strResult.split(":")[1].replace(new RegExp("#", "g"), "").trim();
        nextPos = this.getUntil(pageLines,tmpLine.nextPos, "(Amount)").nextPos+1;
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
            line = line + pageLines[linePos];
        }
        result.table.push(this.processTableRow(line));
        // tmpLine = this.getUntil(pageLines, nextPos, "")
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