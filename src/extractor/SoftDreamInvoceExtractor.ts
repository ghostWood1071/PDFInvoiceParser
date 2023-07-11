import { table } from "console";
import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class SoftDreamsInvoiceExtractor extends PdfExtractor {
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

    let lineTmp = this.getUntil(pageLines, 0, "(VAT INVOICE)");
    let nextPos = lineTmp.nextPos;

    lineTmp = this.getUntil(pageLines, ++nextPos, "Ký hiệu #(Serial)#:");
    nextPos = lineTmp.nextPos;

    result.date = this.processDate(lineTmp.strResult);

    lineTmp = this.getUntil(pageLines, nextPos, "Số #(No.)#:");
    nextPos = lineTmp.nextPos;

    result.serial = this.getBehind(lineTmp.strResult.replace(/\#/g, ""), ":");

    lineTmp = this.getUntil(
      pageLines,
      nextPos,
      "Thuế suất GTGT #(VAT rate)#: "
    );
    nextPos = lineTmp.nextPos;

    result.no = this.getBehind(lineTmp.strResult.replace(/\#/g, ""), ":");

    nextPos = this.getUntil(pageLines, ++nextPos, "Email:").nextPos;

    result.seller.companyName = pageLines[++nextPos];
    result.seller.taxCode = pageLines[++nextPos];

    let rowRegex = /^\D+\#[\d\. ]+\#[\d\. ]+\#[\d\. ]+/;

    nextPos = this.getUntil(
      pageLines,
      nextPos,
      "(1)#(2)#(3)#(4)#(5)#(6)=(4)x(5)"
    ).nextPos;
    nextPos++;

    while (!isNaN(+pageLines[nextPos])) {
      nextPos++;
      let newTableContent: TableContent = new TableContent();
      let productNameTmp = "";

      while (!rowRegex.test(pageLines[nextPos])) {
        productNameTmp += pageLines[nextPos] + " ";
        nextPos++;
      }

      newTableContent.product_name = productNameTmp.trim();

      let strTmp = "";

      while (
        isNaN(+pageLines[nextPos]) &&
        !pageLines[nextPos].startsWith("Cộng tiền hàng #(Sub total)#")
      ) {
        strTmp += pageLines[nextPos];
        nextPos++;
      }

      let arr = strTmp.split("#");

      newTableContent.unit = arr[0];
      newTableContent.quantity = +arr[1].replace(/\./g, "");
      newTableContent.unit_price = +arr[2].replace(/\./g, "");
      newTableContent.total = +arr[3].replace(/\./g, "");

      result.table.push(newTableContent);

      if (nextPos >= pageLines.length) break;
    }

    if (nextPos < pageLines.length) {
      nextPos = this.getUntil(
        pageLines,
        nextPos,
        "Tên đơn vị #(Company name)#:"
      ).nextPos;

      lineTmp = this.getUntil(pageLines, nextPos, "Mã số thuế #(Tax code)#:");
      nextPos = lineTmp.nextPos;

      result.buyer.companyName = this.getBehind(
        lineTmp.strResult.replace(/\#/g, ""),
        ":"
      );

      lineTmp = this.getUntil(pageLines, nextPos, "Địa chỉ #(Address)#:");
      nextPos = lineTmp.nextPos;

      result.buyer.taxCode = this.getBehind(
        lineTmp.strResult.replace(/\#/g, ""),
        ":"
      );
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
