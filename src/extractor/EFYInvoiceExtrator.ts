import { PageContent, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class EFYInvoiceExtractor extends PdfExtractor {
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

  protected override renderPage(pageData: any): string {
    //check documents https://mozilla.github.io/pdf.js/
    let render_options = {
      //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
      normalizeWhitespace: false,
      //do not attempt to combine same line TextItem's. The default value is `false`.
      disableCombineTextItems: false,
    };

    let renderText = (textContent: any) => {
      let lastY,
        text = "";
      for (let item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          text += "#" + item.str;
        } else {
          text += "\n" + item.str;
        }
        lastY = item.transform[5];
      }
      return text;
    };

    return pageData.getTextContent(render_options).then(renderText);
  }

  private processPage(pageLines: string[]) {
    let result = new PageContent();

    let lineTmp = this.getUntil(pageLines, 0, "Số tài khoản#(A/C):");
    let nextPos = lineTmp.nextPos;

    lineTmp = this.getUntil(pageLines, ++nextPos, "Mã số thuế#(Tax code):");
    nextPos = lineTmp.nextPos;

    result.seller.companyName = lineTmp.strResult.trim();

    lineTmp = this.getUntil(pageLines, nextPos, "Địa chỉ#(Address):");
    nextPos = lineTmp.nextPos;

    result.seller.taxCode = this.getBehind(
      lineTmp.strResult.replace(/[ \#]/g, ""),
      ":"
    );

    nextPos = this.getUntil(pageLines, ++nextPos, "Ngày# #(Date)#").nextPos;

    lineTmp = this.getUntil(pageLines, nextPos, "Ký hiệu# #(Serial No):");
    nextPos = lineTmp.nextPos;

    result.date = this.processDate(lineTmp.strResult);

    lineTmp = this.getUntil(pageLines, ++nextPos, "Số# #(No):");
    nextPos = lineTmp.nextPos;

    result.serial = lineTmp.strResult.trim();

    lineTmp = this.getUntil(pageLines, ++nextPos, "Mã số thuế#(Tax code):");
    nextPos = lineTmp.nextPos;

    result.no = lineTmp.strResult.trim();

    lineTmp = this.getUntil(pageLines, nextPos, "Số tài khoản#(A/C):");
    nextPos = lineTmp.nextPos;

    result.buyer.taxCode = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    );

    nextPos = this.getUntil(
      pageLines,
      ++nextPos,
      "Tên đơn vị#(Co.name):"
    ).nextPos;

    lineTmp = this.getUntil(pageLines, nextPos, "Địa chỉ#(Address):#");
    nextPos = lineTmp.nextPos;

    result.buyer.companyName = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    );

    nextPos = this.getUntil(pageLines, ++nextPos, "(Amount)").nextPos;
    nextPos++;

    let rowRegex = /^\d+\#.+\#.+\#[\d\.]+\#[\d\.]+\#[\d\.]+$/;

    while (nextPos < pageLines.length) {
      if (rowRegex.test(pageLines[nextPos])) {
        console.log(pageLines[nextPos]);
        let newTableContent = new TableContent();
        let arrStr = pageLines[nextPos].split("#");

        newTableContent.product_name = arrStr[1];
        newTableContent.unit = arrStr[2];
        newTableContent.quantity = +arrStr[3]
          .replace(/\./g, "")
          .replace(/\,/g, ".");
        newTableContent.unit_price = +arrStr[4]
          .replace(/\./g, "")
          .replace(/\,/g, ".");
        newTableContent.total = +arrStr[5]
          .replace(/\./g, "")
          .replace(/\,/g, ".");
        result.table.push(newTableContent);
      } else if (
        pageLines[nextPos].includes("trang") ||
        pageLines[nextPos].endsWith("#Cộng tiền #hàng #(Total before VAT):")
      ) {
        break;
      }

      nextPos++;
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
