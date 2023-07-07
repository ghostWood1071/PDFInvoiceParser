import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class ViettelInvoiceExtractor extends PdfExtractor {
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
        parts = PagePart.SELLER_COMPANY_NAME;
        indexLine++;
      }

      if (pageLines[indexLine] == "Mã số thuế") break;
      else if (parts == PagePart.SELLER_COMPANY_NAME) {
        result.buyer.companyName += pageLines[indexLine];
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
        let nextLine = "";
        while (indexLine < l) {
          nextLine = pageLines[indexLine + 1];
          if (
            !isNaN(+nextLine) ||
            nextLine.startsWith("Đơn vị cung cấp") ||
            nextLine == "Cộng tiền hàng hóa, dịch vụ"
          )
            break;
          else {
            newTableContent.product_name += pageLines[indexLine];
            indexLine++;
          }
        }

        let extractedAmount = await this.extractAmount(pageLines[indexLine]);

        newTableContent.unit = extractedAmount.unit;
        newTableContent.quanity = extractedAmount.quanity;
        newTableContent.unit_price = extractedAmount.unitPrice;
        newTableContent.total = extractedAmount.amount;

        result.table.push(newTableContent);
        indexLine++;
      } else break;
    }

    return result;
  }

  async getResult() {
    let data = await this.docLines;
    // let result = await data?.map(
    //   async (x) => (x = JSON.stringify(await this.processLines(x)))
    // );

    let result = data ? await this.processLines(data[0]) : null;

    return result;
  }
}
