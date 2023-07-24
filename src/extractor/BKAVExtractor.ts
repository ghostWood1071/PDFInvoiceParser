import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class BKAVExtractor extends PdfExtractor {
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

    let lineTmp = this.getUntil(pageLines, 0, "(VAT INVOICE)");
    let nextPos = lineTmp.nextPos;

    lineTmp = this.getUntil(pageLines, ++nextPos, "Mã của Cơ quan thuế:");
    nextPos = lineTmp.nextPos;

    result.date = this.processDate(lineTmp.strResult);

    nextPos = this.getUntil(
      pageLines,
      ++nextPos,
      "Đơn vị bán (Seller):"
    ).nextPos;

    lineTmp = this.getUntil(pageLines, nextPos, "MST (Tax Code):");
    nextPos = lineTmp.nextPos;

    result.seller.companyName = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    lineTmp = this.getUntil(pageLines, nextPos, "Địa chỉ (Address):");
    result.seller.taxCode = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    nextPos = this.getUntil(pageLines, nextPos, "Đơn vị (Co. name):").nextPos;
    lineTmp = this.getUntil(pageLines, nextPos, "MST (Tax Code):");
    nextPos = lineTmp.nextPos;

    result.buyer.companyName = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    lineTmp = this.getUntil(pageLines, nextPos, "Địa chỉ (Address):");
    result.buyer.taxCode = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    let endRowRegex = /\D+\#[\d\.\, ]+\#[\d\,\. ]+\#[\d\,\. ]+$/;

    nextPos = this.getUntil(pageLines, nextPos, "1#2#3#4#56 = 4 x 5").nextPos;
    nextPos++;

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

        let rowArr = rowTmp.split("#").filter((x) => x != "");
        rowArr.shift();

        newTableContent.total = +rowArr.pop()!.replace(/\,/g, "");
        newTableContent.unit_price = +rowArr.pop()!.replace(/\,/g, "");
        newTableContent.quantity = +rowArr.pop()!.replace(/\,/g, "");
        newTableContent.unit = rowArr.pop()!;

        newTableContent.product_name = rowArr.join(" ");

        result.table.push(newTableContent);
      } else break;
    }

    nextPos = this.getUntil(
      pageLines,
      nextPos,
      "Mẫu số - Ký hiệu (Serial No.):"
    ).nextPos;
    lineTmp = this.getUntil(pageLines, nextPos, "Số (Invoice No.):");
    nextPos = lineTmp.nextPos;

    result.serial = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    result.no = this.getBehind(
      pageLines[nextPos].replace(/\#/g, ""),
      ":"
    ).trim();

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
