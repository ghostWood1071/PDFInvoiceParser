import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class LOGISALInvoiceExtractor extends PdfExtractor {
  private docLines: Promise<any[] | null>;

  constructor(fileName: string) {
    super(fileName);
    this.docLines = this.getDocLines();
  }
  protected override getUntil(
    pageLines: string[],
    posPart: number,
    ending: string
  ) {
    let result = "";
    let pos = posPart;
    for (let i = posPart; i < pageLines.length; i++) {
      if (pageLines[i] == ending || pageLines[i].includes(ending)) {
        pos = i;
        break;
      } else result = result + pageLines[i] + " ";
    }
    return { strResult: result, nextPos: pos };
  }

  protected getProdNameUnit(str: string) {
    let product_name: string = "",
      unit: string = "";
    str = str.replace(/\#/g, "");
    for (let u of this.unitArr) {
      if (str.toLowerCase().endsWith(u)) {
        product_name = str.slice(0, -u.length);
        unit = str.slice(-u.length);
        break;
      }
    }

    return { product_name, unit };
  }

  private processPage(pageLines: string[]) {
    let result = new PageContent();

    let lineTmp = this.getUntil(pageLines, 0, "(Invoice code):");
    let nextPos = lineTmp.nextPos;

    nextPos += 2;
    result.seller.companyName = this.getUntil(
      pageLines,
      nextPos,
      "Mã số thuế"
    ).strResult.trim();

    result.seller.taxCode = this.getUntil(pageLines, ++nextPos, "Địa chỉ")
      .strResult.replace("Mã số thuế", "")
      .trim();

    lineTmp = this.getUntil(pageLines, nextPos, "(Sign):");

    nextPos = lineTmp.nextPos;

    result.serial = pageLines[++nextPos].replace(/\#/g, "");
    lineTmp = this.getUntil(pageLines, ++nextPos, "(No):");
    result.no = lineTmp.strResult;
    nextPos = lineTmp.nextPos;

    lineTmp = this.getUntil(pageLines, nextPos, "(VAT Invoice)");
    nextPos = lineTmp.nextPos;

    lineTmp = this.getUntil(pageLines, ++nextPos, "(Date)");
    result.date = new Date(lineTmp.strResult.split(/\D+/g).reverse().join("-"));

    nextPos = this.getUntil(pageLines, nextPos, "(Buyer):").nextPos;

    lineTmp = this.getUntil(pageLines, ++nextPos, "Địa chỉ");
    result.buyer.taxCode = lineTmp.strResult.replace("Mã số thuế", "");

    nextPos = this.getUntil(pageLines, nextPos, "Tên đơn vị").nextPos;
    result.buyer.companyName = pageLines[nextPos].replace("Tên đơn vị", "");

    nextPos = this.getUntil(pageLines, nextPos, "ABC#1#2#3=#1x#2").nextPos;

    while (nextPos < pageLines.length - 2) {
      let newTableContent: TableContent = new TableContent();
      let str = "";

      while (!/^\d[\#\.\,\d]*\d$/.test(pageLines[nextPos])) {
        str += pageLines[nextPos];
        nextPos++;
      }

      if (isNaN(+pageLines[nextPos + 1])) break;

      let { product_name, unit } = this.getProdNameUnit(str);

      newTableContent.product_name = product_name;
      newTableContent.unit = unit;

      let strTmp = pageLines[nextPos].replace(/\#\.\#/g, "");
      let [quantity, unit_price, total] = strTmp
        .split("#")
        .map((x) => parseFloat(x));

      newTableContent.quantity = quantity;
      newTableContent.unit_price = unit_price;
      newTableContent.total = total;

      result.table.push(newTableContent);
      nextPos += 2;
    }

    if (nextPos < pageLines.length) {
      nextPos = this.getUntil(pageLines, nextPos, "(VAT rate):").nextPos;

      lineTmp = this.getUntil(pageLines, ++nextPos, "Tiền thuế GTGT");
      let sharpIndex = lineTmp.strResult.indexOf("#");
      result.vat_rate = lineTmp.strResult.slice(0, sharpIndex);
    }

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
