import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class SEOJINAUTOInvoiceExtractor extends PdfExtractor {
  private docLines: Promise<any[] | null>;

  constructor(fileName: string) {
    super(fileName);
    this.docLines = this.getDocLines();
  }

  protected unitArr: string[] = ["kg", "EA", "cái", "chiếc"];

  // protected renderPage(pageData: any): string {
  //   //check documents https://mozilla.github.io/pdf.js/
  //   let render_options = {
  //     //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
  //     normalizeWhitespace: false,
  //     //do not attempt to combine same line TextItem's. The default value is `false`.
  //     disableCombineTextItems: false,
  //   };

  //   let renderText = (textContent: any) => {
  //     //fs.writeFileSync('lol.json', JSON.stringify(textContent));
  //     let lastY,
  //       text = "";
  //     for (let item of textContent.items) {
  //       if (lastY == item.transform[5] || !lastY) {
  //         text += "#" + item.str;
  //       } else {
  //         text += "\n" + item.str;
  //       }
  //       lastY = item.transform[5];
  //     }
  //     return text;
  //   };

  //   return pageData.getTextContent(render_options).then(renderText);
  // }

  private async processLines(pageLines: string[]) {
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
          !numStrRegex.test(pageLines[indexLine])
        ) {
          str += pageLines[indexLine];
          indexLine++;
        }
        for (let unit of this.unitArr) {
          if (str.includes(unit)) {
            newTableContent.product_name = str.slice(0, -unit.length);
            newTableContent.unit = unit;
            break;
          }
        }

        var numArr = str.split("#");
        var commaIndex = numArr.indexOf(",");

        // if (numStrRegex.test(pageLines[indexLine])) {
        //   newTableContent.quantity = +numArr
        //     .slice(0, commaIndex + 2)
        //     .filter((x) => x != ".")
        //     .join("")
        //     .replace(",", ".");

        //   numArr = numArr.slice(commaIndex + 2);

        //   commaIndex = numArr.indexOf(",");

        //   newTableContent.unit_price = +numArr
        //     .slice(0, commaIndex + 2)
        //     .filter((x) => x != ".")
        //     .join("")
        //     .replace(",", ".");

        //   numArr = numArr.slice(commaIndex + 2);

        //   newTableContent.total = +numArr
        //     .filter((x) => x != ".")
        //     .join("")
        //     .replace(",", ".");
        // }

        result.table.push(newTableContent);
        indexLine += 2;
        break;
      } else break;
    }

    return result;
  }

  async getResult() {
    let data = await this.docLines;
    // let result = await data?.map(
    //   async (x) => (x = JSON.stringify(await this.processLines(x)))
    // );

    let result = data ? await this.processLines(data[1]) : null;

    return result;
  }
}
