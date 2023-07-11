import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class SEOJINAUTOInvoiceExtractor extends PdfExtractor {
  private docLines: Promise<any[] | null>;

  constructor(fileName: string) {
    super(fileName);
    this.docLines = this.getDocLines();
  }

  private processPage(pageLines: string[]) {
    let result: PageContent = new PageContent();
    let parts: PagePart = PagePart.NONE;

    let indexLine = 0;
    let l = pageLines.length;

    while (indexLine <= l) {
      if (pageLines[indexLine] == "(Sign):") {
        parts = PagePart.SERIAL;
        indexLine++;
        if (parts == PagePart.SERIAL) {
          result.serial = pageLines[indexLine].replace(/#/g, "");
        }

        parts = PagePart.NO;
        indexLine++;
        if (parts == PagePart.NO) {
          result.no = pageLines[indexLine];
        }
        break;
      }
      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == "SALES INVOICE") {
        parts = PagePart.DATE;
        indexLine++;

        if (parts == PagePart.DATE) {
          let str: string = pageLines[indexLine];
          result.date = new Date(
            `${str.slice(6, 10)}/${str.slice(4, 6)}/${str.slice(0, 2)}`
          );
          break;
        }
      }

      indexLine++;
    }

    let sellerCompanyName: string = "";

    while (indexLine <= l) {
      if (pageLines[indexLine] == "(E-Invoice viewer)") {
        parts = PagePart.SELLER_COMPANY_NAME;
        indexLine++;
      }

      if (pageLines[indexLine].endsWith("Mã số thuế")) {
        result.seller.companyName = sellerCompanyName.slice(0, -15);
        break;
      } else if (parts == PagePart.SELLER_COMPANY_NAME) {
        sellerCompanyName += pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine].endsWith("Mã số thuế")) {
        parts = PagePart.SELLER_TAX_CODE;
        result.seller.taxCode = pageLines[indexLine].slice(0, -10);
        indexLine++;
        break;
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine].endsWith("Mã số thuế")) {
        parts = PagePart.BUYER_TAX_CODE;
        result.buyer.taxCode = pageLines[indexLine].slice(0, -10);
        indexLine++;
        break;
      }

      indexLine++;
    }

    let buyerCompanyName: string = "";

    while (indexLine < l) {
      if (pageLines[indexLine].endsWith("Tên đơn vị")) {
        parts = PagePart.BUYER_COMPANY_NAME;
      }

      if (pageLines[indexLine] == "(Company's name):") {
        result.buyer.companyName = buyerCompanyName.slice(0, -10);
        indexLine++;
        break;
      } else if (parts == PagePart.BUYER_COMPANY_NAME) {
        buyerCompanyName += pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine < l) {
      if (pageLines[indexLine] == "ABC#1#2#3=#1x#2") {
        parts = PagePart.TABLE;
        indexLine++;
        break;
      }
      indexLine++;
    }

    while (indexLine < l - 1) {
      if (parts == PagePart.TABLE) {
        let newTableContent: TableContent = new TableContent();

        let numStrRegex = /^\d[\#\.\,\d]*\d$/;
        let str = "";

        while (
          parts == PagePart.TABLE &&
          !numStrRegex.test(pageLines[indexLine]) &&
          indexLine < l
        ) {
          str += pageLines[indexLine];
          indexLine++;
        }

        str = str.replace(/#/g, "");
        for (let unit of this.unitArr) {
          if (str.endsWith(unit)) {
            newTableContent.product_name = str.slice(0, -unit.length);
            newTableContent.unit = unit;
            break;
          }
        }

        var numArr = pageLines[indexLine].split("#");
        var commaIndex = numArr.indexOf(",");

        if (numStrRegex.test(pageLines[indexLine])) {
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
        }

        result.table.push(newTableContent);

        if (
          indexLine + 2 < l &&
          pageLines[indexLine + 3] == "(Total amount):"
        ) {
          break;
        }
        indexLine += 2;
      } else break;
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
