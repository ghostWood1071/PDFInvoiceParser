import { PageContent, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";
// Lux Share
export class EInvoice3Extractor extends PdfExtractor {
  private docLines: Promise<any[] | null>;

  constructor(fileName: string) {
    super(fileName);
    this.docLines = this.getDocLines();
  }

  private processDate(dataStr: string): Date {
    return new Date(
      dataStr
        .trim()
        .replace(/\#/g, "")
        .split(/\D+/g)
        .filter((x) => x != "")
        .reverse()
        .join("-")
    );
  }

  protected override renderPage(pageData: any): string {
    //check documents https://mozilla.github.io/pdf.js/
    let render_options = {
      //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
      normalizeWhitespace: false,
      //do not attempt to combine same line TextItem's. The default value is `false`.
      disableCombineTextItems: false,
    };

    let renderText = (textContent: any) => {
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
    let result = new TableContent();
    let numStartRegex = /^[0-9]+\#/g;
    rowStr = rowStr.replace(numStartRegex, "");
    if(rowStr.endsWith("#"))
      rowStr = rowStr.substring(0, rowStr.length-1);
    let raw = rowStr.split("#");
    result.product_name = raw[0];
    result.unit = raw[1];
    result.total = parseFloat(raw[2].replace(/\./, "").replace(/\,/,".")); 
    result.unit_price = parseFloat(raw[3].replace(/\./, "").replace(/\,/,".")); 
    result.quantity = parseFloat(raw[4].replace(/\./, "").replace(/\,/,".")); 
    return result;
  }

  private processPage(pageLines: string[]) {
    let enTableRegex = /Trang|tiep theo|Số tiền viết bằng chữ/g;
    let rowRegex = /^\d+\#[A-ZÁÀẠÃẢẮẰẲẶẴẤẦẬẨẪĐÓÒỎỌÕÔỐỒỔỘỖƠỚỜỞỢỠĂƯỨỪỬỰỮÚÙỦỤŨÂÊẾỀỂỆỄÉÈẺẸẼÝỲỶỴỸÍÌỈỊĨ]|^\d+$/
    let result = new PageContent();
    let tmpLine = this.getUntil(pageLines, 0, "#Điện thoại");
    let nextPos = tmpLine.nextPos + 1; 
    tmpLine = this.getUntil(pageLines,nextPos,"Địa chỉ");
    result.seller.companyName = tmpLine.strResult.trim();
    nextPos = this.getUntil(pageLines,nextPos, "Mã số thuế").nextPos;
    tmpLine = this.getUntil(pageLines,nextPos,"Số tài khoản");
    result.seller.taxCode = this.getBehind(tmpLine.strResult, ":").trim().replace(/\#/g,"").trim();
    nextPos = this.getUntil(pageLines,tmpLine.nextPos,"Ngày#").nextPos;
    tmpLine = this.getUntil(pageLines,nextPos,"Ký hiệu");
    result.date = this.processDate(tmpLine.strResult);
    tmpLine = this.getUntil(pageLines,tmpLine.nextPos, "Số");
    result.serial = this.getBehind(tmpLine.strResult, ":").replace(/\#/g, "");
    tmpLine = this.getUntil(pageLines,tmpLine.nextPos, "Mã của CQT");
    result.no = this.getBehind(tmpLine.strResult, ":").replace(/\#/g, "");
    nextPos = this.getUntil(pageLines, tmpLine.nextPos, "Tên đơn vị").nextPos;
    tmpLine = this.getUntil(pageLines, nextPos, "Địa chỉ");
    result.buyer.companyName = this.getBehind(tmpLine.strResult,":").replace(/\#/g, "");
    nextPos = this.getUntil(pageLines, nextPos, "Mã số thuế").nextPos;
    tmpLine = this.getUntil(pageLines, nextPos, "Số tài khoản");
    result.buyer.taxCode = this.getBehind(tmpLine.strResult,":").replace(/\#/g, "").trim();
    nextPos = this.getUntil(pageLines, tmpLine.nextPos, "(Amount)").nextPos+1;
    let line = "";
    for(let linePos = nextPos; linePos<pageLines.length; linePos++){
        if (enTableRegex.test(pageLines[linePos])){
            console.log(pageLines[linePos]);
            nextPos = linePos;
            break;
        }

        if (rowRegex.test(pageLines[linePos])) {
            if(line != "") {
                result.table.push(this.processTableRow(line));
                line = "";
            }
        } 
        line = line + pageLines[linePos] + "#";
    }
    result.table.push(this.processTableRow(line));
    tmpLine = this.getUntil(pageLines, nextPos, "")

    return result;
  }

  async getResult() {
    let pageLines = await this.docLines;
    if (pageLines) {
      if (pageLines.length >= 1) {
        let data = this.processPage(pageLines[0]);
        return data;
      } else {
        let result: PageContent = this.processPage(pageLines[0]);
        for (let pageNum = 1; pageNum < pageLines.length; pageNum++) {
          let tmpPage: PageContent = this.processPage(pageLines[pageNum]);
          result.exchange_rate = tmpPage.exchange_rate
            ? tmpPage.exchange_rate
            : result.exchange_rate;
          result.vat_rate =
            tmpPage.vat_rate != 0 || tmpPage.vat_rate != null
              ? tmpPage.vat_rate
              : result.vat_rate;
          result.table = result.table.concat(tmpPage.table);
        }
        return result;
      }
    } else {
      throw new Error("Không thể đọc file PDF");
    }
  }
}
