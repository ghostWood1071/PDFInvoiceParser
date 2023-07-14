import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class SEOJINAUTOInvoiceExtractor extends PdfExtractor {
  private docLines: Promise<any[] | null>;

  constructor(fileName: string) {
    super(fileName);
    this.docLines = this.getDocLines();
  }

  private processDate(dataStr: string): Date {
    return new Date(
      dataStr
        .trim()
        .split(/\D+/g)
        .filter((x) => x != "")
        .reverse()
        .join("-")
    );
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

  private processPage(pageLines: string[]) {
    let result: PageContent = new PageContent();

    let lineTmp = this.getUntil(pageLines, 0, "(Invoice code):");
    let nextPos = lineTmp.nextPos;

    if (!pageLines[nextPos + 3].includes("Mã số thuế")) {
      lineTmp = this.getUntil(pageLines, nextPos, "(Sign):");
      nextPos = lineTmp.nextPos;

      result.serial = pageLines[++nextPos].replace(/#/g, "");
      result.no = pageLines[++nextPos].replace(/#/g, "");

      nextPos = this.getUntil(pageLines, nextPos, "(Date)").nextPos;

      result.date = this.processDate(pageLines[nextPos - 1]);

      nextPos = this.getUntil(pageLines, nextPos, "Địa chỉ").nextPos;
      result.seller.companyName = pageLines[nextPos - 2]
        .replace("Đơn vị bán hàng", "")
        .trim();

      result.seller.taxCode = pageLines[nextPos - 1]
        .replace("Mã số thuế", "")
        .trim();

      nextPos = this.getUntil(pageLines, nextPos, "(Buyer):").nextPos;

      lineTmp = this.getUntil(pageLines, ++nextPos, "Địa chỉ");

      result.buyer.taxCode = lineTmp.strResult.replace("Mã số thuế", "").trim();
    } else {
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
      result.date = this.processDate(lineTmp.strResult);

      nextPos = this.getUntil(pageLines, nextPos, "(Buyer):").nextPos;

      lineTmp = this.getUntil(pageLines, ++nextPos, "Địa chỉ");
      result.buyer.taxCode = lineTmp.strResult.replace("Mã số thuế", "");

      nextPos = this.getUntil(pageLines, nextPos, "Tên đơn vị").nextPos;
      result.buyer.companyName = pageLines[nextPos].replace("Tên đơn vị", "");
    }

    while (
      nextPos < pageLines.length &&
      !pageLines[nextPos].trim().includes("(Company's name):")
    ) {
      nextPos++;
    }

    result.buyer.companyName = pageLines[nextPos - 1].replace("Tên đơn vị", "");

    nextPos = this.getUntil(pageLines, nextPos, "ABC#1#2#3=#1x#2").nextPos;
    nextPos++;

    let numStrRegex = /^\d[\#\.\,\d]*\d$/;

    while (nextPos < pageLines.length) {
      if (numStrRegex.test(pageLines[nextPos].trim())) {
        break;
      }

      let newTableContent: TableContent = new TableContent();

      let str = "";

      while (!numStrRegex.test(pageLines[nextPos])) {
        str += pageLines[nextPos] + " ";
        nextPos++;
      }

      str = str.replace(/#/g, "").trim();
      for (let unit of this.unitArr) {
        if (str.toLowerCase().endsWith(unit)) {
          newTableContent.product_name = str.slice(0, -unit.length).trim();
          newTableContent.unit = str.slice(-unit.length);
          break;
        }
      }

      var numArr = pageLines[nextPos].split("#");
      var commaIndex = numArr.indexOf(",");

      if (numStrRegex.test(pageLines[nextPos])) {
        newTableContent.quantity = +numArr
          .slice(0, commaIndex + 2)
          .filter((x) => x != ".")
          .join("")
          .replace(",", ".");

        numArr = numArr.slice(commaIndex + 2);

        commaIndex = numArr.indexOf(",");

        newTableContent.unit_price = +numArr
          .slice(0, commaIndex + 2)
          .filter((x) => x != ".")
          .join("")
          .replace(",", ".");

        numArr = numArr.slice(commaIndex + 2);

        newTableContent.total = +numArr
          .filter((x) => x != ".")
          .join("")
          .replace(",", ".");

        result.table.push(newTableContent);
      } else break;

      nextPos += 2;
    }

    while (nextPos < pageLines.length) {
      if (pageLines[nextPos] == "Tỷ giá") {
        result.exchange_rate = +pageLines[nextPos + 2]
          .replace(/\#/g, "")
          .replace(",", ".");
        break;
      }
      nextPos++;
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
