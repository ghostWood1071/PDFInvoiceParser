import { PageContent, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class VNPInvoiceExtractor extends PdfExtractor {
    private docLines:Promise<any[] | null>;
    constructor(fileName:string){
        super(fileName);
        this.docLines = this.getDocLines();
    }

    private getDate(str:string){
        let rawNumA = str.split(" ");
        return new Date(`${rawNumA[5].replace("#", "")}-${rawNumA[2].replace("#", "")}-${rawNumA[8].replace("#", "")}`);
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

    private processTableRow(line:string):TableContent{
        let result = new TableContent();
        let numStartRegex = /^[0-9]+/g;
        line = line.replace(numStartRegex, "");
        let rawLine = line.split("#");
        result.product_name = rawLine[0];
        result.unit = rawLine[1];
        result.quantity = parseInt(rawLine[2].replace(".", "")) 
        result.unit_price = parseInt(rawLine[3].replace(".", "")) 
        result.total = parseInt(rawLine[4].replace(".", "")) 
        return result;
    }

    private processPage(pageLines: string[]){
        let tmpLine = "";
        let rowRegex = /[0-9]+[A-Z]+|^\d+$/
        let exchangeRegex = /Tỷ giá:/g;
        let rateVATstartRegex = /Thuế suất/;
        let result = new PageContent();
        if (pageLines.length<=3)
            return result;
        let lineTmp = this.getUntil(pageLines, 0, "Ngày #");
        let nextPos = lineTmp.nextPos;
        lineTmp = this.getUntil(pageLines,nextPos,"Mã của cơ quan thuế");
        result.date = this.getDate(lineTmp.strResult);
        nextPos = this.getUntil(pageLines,lineTmp.nextPos,"Ký hiệu").nextPos;
        lineTmp = this.getUntil(pageLines,nextPos,"Số (Invoice No.)");
        result.serial = this.getBehind(lineTmp.strResult, ":").replace(new RegExp("#", "g"), "");
        lineTmp = this.getUntil(pageLines,lineTmp.nextPos, "NGƯỜI MUA HÀNG")
        result.no = this.getBehind(lineTmp.strResult,":").replace(new RegExp("#", "g"), "");

        nextPos = this.getUntil(pageLines,lineTmp.nextPos, "i website: ").nextPos+1;
        lineTmp = this.getUntil(pageLines,nextPos, "Mã số thuế")
        result.seller.companyName = this.getBehind(lineTmp.strResult, ":").trim().replace(new RegExp("#", "g"), "");
        nextPos = lineTmp.nextPos;
        lineTmp = this.getUntil(pageLines, nextPos, "Địa chỉ");
        nextPos = lineTmp.nextPos;
        result.seller.taxCode = this.getBehind(lineTmp.strResult,":").trim().replace(new RegExp("#", "g"), "");
        nextPos = this.getUntil(pageLines,nextPos,"Tên đơn vị ").nextPos;
        lineTmp = this.getUntil(pageLines, nextPos, "Mã số thuế ");
        result.buyer.companyName = this.getBehind(lineTmp.strResult, ":").replace(new RegExp("#", "g"), "").trim();
        nextPos = lineTmp.nextPos;
        lineTmp = this.getUntil(pageLines, nextPos, "Địa chỉ");
        result.buyer.taxCode = this.getBehind(lineTmp.strResult, ":").replace("#", "").replace(new RegExp("#", "g"), "");
        nextPos = this.getUntil(pageLines, lineTmp.nextPos, "1#2#3#4#56=4x5").nextPos+1;
        
        for(let linePos = nextPos; linePos<pageLines.length; linePos++){
            if(exchangeRegex.test(pageLines[linePos])){
                let tmp_rate = pageLines[linePos].split("#")[2];
                if(tmp_rate != ":")
                    result.exchange_rate = parseFloat(tmp_rate);
                break;
            }
            if(rateVATstartRegex.test(pageLines[linePos])){
                result.vat_rate = parseFloat(pageLines[linePos].split("#")[3].replace("%", ""));
            }
            if (rowRegex.test(pageLines[linePos])) {
                if(tmpLine != "") {
                    result.table.push(this.processTableRow(tmpLine));
                    tmpLine = "";
                }
            } 
            tmpLine = tmpLine + pageLines[linePos];
        }

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
                    if(tmpPage.vat_rate!=0 && tmpPage.vat_rate!=null){
                        result.vat_rate = tmpPage.vat_rate;
                    }
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
