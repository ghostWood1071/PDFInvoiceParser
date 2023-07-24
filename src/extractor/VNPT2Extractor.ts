import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class VNPT2Extractor extends PdfExtractor {
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

  private processPage(pageLines: string[]) {
    let result = new PageContent();

    let lineTmp = this.getUntil(pageLines, 0, "Ngày");
    let nextPos = lineTmp.nextPos;

    lineTmp = this.getUntil(pageLines, nextPos, "Mã của cơ quan thuế:");
    nextPos = lineTmp.nextPos;
    result.date = this.processDate(lineTmp.strResult);

    nextPos = this.getUntil(pageLines, nextPos, "Ký hiệu:").nextPos;
    lineTmp = this.getUntil(pageLines, nextPos, "Số:");
    nextPos = lineTmp.nextPos;

    result.serial = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    lineTmp = this.getUntil(pageLines, nextPos, "Đơn vị bán hàng   (Seller) :");
    nextPos = lineTmp.nextPos;
    result.no = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    lineTmp = this.getUntil(pageLines, nextPos, "Mã số thuế   (Tax code) :");
    nextPos = lineTmp.nextPos;
    result.seller.companyName = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    lineTmp = this.getUntil(pageLines, nextPos, "Địa chỉ   (Address) :");
    nextPos = lineTmp.nextPos;
    result.seller.taxCode = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    nextPos = this.getUntil(
      pageLines,
      nextPos,
      "Tên đơn vị   (Company's name) :"
    ).nextPos;

    lineTmp = this.getUntil(pageLines, nextPos, "Mã số thuế   (Tax code) :");
    nextPos = lineTmp.nextPos;
    result.buyer.companyName = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    lineTmp = this.getUntil(pageLines, nextPos, "Địa chỉ   (Address) :");
    nextPos = lineTmp.nextPos;
    result.buyer.taxCode = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    nextPos = this.getUntil(pageLines, nextPos, "1#2#3#4#56=4x5").nextPos;
    nextPos++;

    let endRowRegex = /\D+\#[\d\.\, ]+\#[\d\,\. ]+\#[\d\,\. ]+$/;

    for (nextPos; nextPos < pageLines.length; nextPos++) {
      if (!isNaN(+pageLines[nextPos][0])) {
        let rowTmp = "";

        for (nextPos; nextPos < pageLines.length; nextPos++) {
          if (!endRowRegex.test(pageLines[nextPos])) {
            rowTmp += pageLines[nextPos] + "#";
          } else {
            rowTmp += pageLines[nextPos] + "#";
            break;
          }
        }

        let newTableContent: TableContent = new TableContent();

        let rowArr = rowTmp.split("#").filter((x) => x.trim() != "");
        rowArr.shift();

        newTableContent.total = +rowArr
          .pop()!
          .replace(/\./g, "")
          .replace(",", ".");
        newTableContent.unit_price = +rowArr
          .pop()!
          .replace(/\./g, "")
          .replace(",", ".");
        newTableContent.quantity = +rowArr
          .pop()!
          .replace(/\./g, "")
          .replace(",", ".");
        newTableContent.unit = rowArr.pop()!;

        newTableContent.product_name = rowArr.join("");

        result.table.push(newTableContent);
      } else break;
    }

    return result;
  }

  async getResult() {
    let pageLines = await this.docLines;
    if (pageLines) {
      if (pageLines.length == 1) {
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
