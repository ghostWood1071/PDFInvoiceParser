import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class ViettelInvoiceExtractor extends PdfExtractor {
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
    let dateArr = [];
    while (indexLine <= l) {
      if (pageLines[indexLine] == "Ngày") {
        parts = PagePart.DATE;
      }

      if (pageLines[indexLine] == "Ký hiệu") {
        result.date = new Date(dateArr.reverse().join("/"));
        break;
      } else if (
        parts == PagePart.DATE &&
        pageLines[indexLine].trim().startsWith("(")
      ) {
        indexLine++;
        dateArr.push(pageLines[indexLine].split(" ")[0]);
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == " (Serial):") {
        parts = PagePart.SERIAL;
        indexLine++;
      }

      if (pageLines[indexLine] == "Số") break;
      else if (parts == PagePart.SERIAL) {
        result.serial = result.serial + pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == " (No.):") {
        parts = PagePart.NO;
        indexLine++;
      }

      if (pageLines[indexLine] == "Đơn vị bán hàng") break;
      else if (parts == PagePart.NO) {
        result.no = result.no + pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == " (Company): ") {
        parts = PagePart.SELLER_COMPANY_NAME;
        indexLine++;
      }

      if (pageLines[indexLine] == "Mã số thuế") break;
      else if (parts == PagePart.SELLER_COMPANY_NAME) {
        result.seller.companyName += pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == " (Tax code): ") {
        parts = PagePart.SELLER_TAX_CODE;
        indexLine++;
      }

      if (pageLines[indexLine] == "Địa chỉ") break;
      else if (parts == PagePart.SELLER_TAX_CODE) {
        result.seller.taxCode += pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == " (Company's name): ") {
        parts = PagePart.BUYER_COMPANY_NAME;
        indexLine++;
      }

      if (pageLines[indexLine] == "Mã số thuế") break;
      else if (parts == PagePart.BUYER_COMPANY_NAME) {
        result.buyer.companyName += pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == " (Tax code): ") {
        parts = PagePart.BUYER_TAX_CODE;
        indexLine++;
      }

      if (pageLines[indexLine] == "Địa chỉ") break;
      else if (parts == PagePart.BUYER_TAX_CODE) {
        result.buyer.taxCode += pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == "STT") {
        parts = PagePart.TABLE;
        indexLine += 13;
        break;
      }
      indexLine++;
    }

    while (indexLine < l) {
      let no: number = +pageLines[indexLine];
      if (parts == PagePart.TABLE && !isNaN(no)) {
        let newTableContent: TableContent = new TableContent();
        indexLine++;
        let totalRegex = /.*#.*#.*#.*/;

        while (indexLine < l) {
          if (totalRegex.test(pageLines[indexLine])) {
            let [unit, quantity, unitPrice, total] =
              pageLines[indexLine].split("#");

            newTableContent.unit = unit;
            newTableContent.quantity = +quantity.replace(/\./g, "");
            newTableContent.unit_price = +unitPrice.replace(/\./g, "");
            newTableContent.total = +total.replace(/\./g, "");

            result.table.push(newTableContent);
            indexLine++;
            break;
          } else {
            newTableContent.product_name += pageLines[indexLine];
            indexLine++;
          }
        }
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
