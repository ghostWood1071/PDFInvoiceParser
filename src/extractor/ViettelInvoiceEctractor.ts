import { PageContent, PagePart, TableContent } from "../model/model";
import { IExtractable, PdfExtractor } from "./PDFExtractor";

export class ViettelInvoiceExtractor
  extends PdfExtractor
  implements IExtractable
{
  private docLines: Promise<any[] | null>;

  constructor(fileName: string) {
    super(fileName);
    this.docLines = this.getDocLines();
  }

  private async processLines(pageLines: string[]) {
    let result: PageContent = new PageContent();
    let parts: PagePart = PagePart.NONE;

    let indexLine = 0;
    let l = pageLines.length;
    while (indexLine <= l) {
      if (pageLines[indexLine] == "Ngày") {
        parts = PagePart.DATE;
      }

      if (pageLines[indexLine] == "Ký hiệu") break;
      else if (parts == PagePart.DATE) {
        result.date = result.date + pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == "Ký hiệu") {
        parts = PagePart.SERIAL;
      }

      if (pageLines[indexLine] == "Số") break;
      else if (parts == PagePart.SERIAL) {
        result.serial = result.serial + pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == "Số") {
        parts = PagePart.NO;
      }

      if (pageLines[indexLine] == "Đơn vị bán hàng") break;
      else if (parts == PagePart.NO) {
        result.no = result.no + pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == "Đơn vị bán hàng") {
        parts = PagePart.SELLER_COMPANY_NAME;
      }

      if (pageLines[indexLine] == "Mã số thuế") break;
      else if (parts == PagePart.SELLER_COMPANY_NAME) {
        result.seller.companyName += pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == "Mã số thuế") {
        parts = PagePart.SELLER_TAX_CODE;
      }

      if (pageLines[indexLine] == "Địa chỉ") break;
      else if (parts == PagePart.SELLER_TAX_CODE) {
        result.seller.taxCode += pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == "Tên đơn vị") {
        parts = PagePart.SELLER_COMPANY_NAME;
      }

      if (pageLines[indexLine] == "Mã số thuế") break;
      else if (parts == PagePart.SELLER_COMPANY_NAME) {
        result.buyer.companyName += pageLines[indexLine];
      }

      indexLine++;
    }

    while (indexLine <= l) {
      if (pageLines[indexLine] == "Mã số thuế") {
        parts = PagePart.SELLER_TAX_CODE;
      }

      if (pageLines[indexLine] == "Địa chỉ") break;
      else if (parts == PagePart.SELLER_TAX_CODE) {
        result.buyer.taxCode += pageLines[indexLine];
      }

      indexLine++;
    }

    let indexRow: number = 0;

    while (indexLine <= l) {
      if (pageLines[indexLine] == "STT") {
        parts = PagePart.TABLE;
        indexLine += 13;
        indexRow = 1;
        break;
      }
      indexLine++;
    }

    while (indexLine <= l) {
      if (parts == PagePart.TABLE && /^[0-9]$/.test(pageLines[indexLine])) {
        let no: number = +pageLines[indexLine];
        if (no == indexRow) {
          let newTableContent: TableContent = new TableContent();
          newTableContent.description =
            pageLines[indexLine + 1] + " " + pageLines[indexLine + 2];

          let extractedAmount = await this.extractAmount(
            pageLines[indexLine + 3]
          );

          newTableContent.unit = extractedAmount.unit;
          newTableContent.quanity = extractedAmount.quanity;
          newTableContent.unitPrice = extractedAmount.unitPrice;
          newTableContent.amount = extractedAmount.amount;

          result.table.push(newTableContent);
          indexRow++;
          indexLine += 4;
        } else break;
      } else break;
    }

    return result;
  }

  async getResult() {
    let data = await this.docLines;
    console.log(data ? data[0] : "");
    let result = data ? this.processLines(data[0]) : null;
    return result;
  }

  extractInfo() {
    throw new Error("Method not implemented.");
  }
  extractBuyer() {
    throw new Error("Method not implemented.");
  }
  extractSeller() {
    throw new Error("Method not implemented.");
  }
  extractTable() {
    throw new Error("Method not implemented.");
  }
}
