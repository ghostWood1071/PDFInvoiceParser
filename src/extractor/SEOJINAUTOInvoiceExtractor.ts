import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class SEOJINAUTOInvoiceExtractor extends PdfExtractor {
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
      if (pageLines[indexLine] == "(Sign):") {
        parts = PagePart.SERIAL;
        indexLine++;
        if (parts == PagePart.SERIAL) {
          result.serial = pageLines[indexLine];
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
            `${str.slice(4, 8)}/${str.slice(2, 4)}/${str.slice(0, 2)}`
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
      if (pageLines[indexLine] == "ABC123=1x2") {
        parts = PagePart.TABLE;
        indexLine++;
        break;
      }
      indexLine++;
    }

    while (indexLine < l - 1) {
      if (parts == PagePart.TABLE) {
        let newTableContent: TableContent = new TableContent();
        let str = "";
        while (indexLine < l) {
          if (isNaN(+pageLines[indexLine])) {
            str += pageLines[indexLine];
            indexLine++;
          } else break;
        }

        let closerIndex = str.lastIndexOf(")");
        newTableContent.product_name = str.slice(0, closerIndex + 1);

        let totalString = str.slice(closerIndex + 1);
        let extractedTotal = await this.extractTotal(totalString);

        newTableContent.unit = extractedTotal.unit;
        newTableContent.quantity = extractedTotal.quantity;
        newTableContent.unit_price = extractedTotal.unitPrice;
        newTableContent.total = extractedTotal.total;

        result.table.push(newTableContent);
        indexLine++;
      } else break;
    }

    return result;
  }

  async getResult() {
    let data = await this.docLines;
    let result = await data?.map(
      async (x) => (x = JSON.stringify(await this.processLines(x)))
    );

    return result;
  }
}
