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

  private processPageATek(pageLines: string[]): PageContent {
    let lineTmp = this.getUntil(pageLines, 0, "(VAT INVOICE)");
    let nextPos = lineTmp.nextPos;
    let result = new PageContent();

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

    nextPos = this.getUntil(
      pageLines,
      ++nextPos,
      "Địa chỉ #(Address)#:"
    ).nextPos;
    nextPos++;
    result.seller.companyName = pageLines[++nextPos].replace(/\#/g, "").trim();
    result.seller.taxCode = pageLines[++nextPos].replace(/\#/g, "").trim();

    let totalRegex = /^\D+\#[\d\. ]+\#[\d\. ]+\#[\d\. ]+/;
    let rowRegex = /^\d+\#.+\#\D+\#[\d\. ]+\#[\d\. ]+\#[\d\. ]+$/;

    nextPos = this.getUntil(
      pageLines,
      nextPos,
      "(1)#(2)#(3)#(4)#(5)#(6)=(4)x(5)"
    ).nextPos;
    nextPos++;

    while (
      nextPos < pageLines.length &&
      !pageLines[nextPos].startsWith("Cộng tiền hàng #(Sub total)#")
    ) {
      if (!isNaN(+pageLines[nextPos])) {
        nextPos++;
        let newTableContent: TableContent = new TableContent();
        let productNameTmp = "";

        while (!totalRegex.test(pageLines[nextPos])) {
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
      } else if (rowRegex.test(pageLines[nextPos])) {
        let newTableContent = new TableContent();

        let arrTmp = pageLines[nextPos].split("#");
        newTableContent.total = +arrTmp
          .pop()!
          .replace(/\./g, "")
          .replace(",", ".")
          .trim();
        newTableContent.unit_price = +arrTmp
          .pop()!
          .replace(/\./g, "")
          .replace(",", ".")
          .trim();
        newTableContent.quantity = +arrTmp
          .pop()!
          .replace(/\./g, "")
          .replace(",", ".")
          .trim();
        newTableContent.unit = arrTmp.pop()!.trim();
        arrTmp.shift();
        newTableContent.product_name = arrTmp.join("").trim();

        result.table.push(newTableContent);
        nextPos++;
      }
    }

    while (!isNaN(+pageLines[nextPos])) {
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

  private processPageBolt(pageLines: string[]): PageContent {
    let result = new PageContent();

    let nextPos = this.getUntil(pageLines, 0, "#").nextPos;
    let lineTmp = this.getUntil(pageLines, nextPos, "STK");

    result.buyer.companyName = lineTmp.strResult.replace(/\#/g, "").trim();

    nextPos = this.getUntil(pageLines, ++nextPos, "Mã số thuế").nextPos;
    result.seller.taxCode = pageLines[++nextPos].replace(/\#/g, "").trim();
    result.seller.companyName = pageLines[++nextPos].replace(/\#/g, "").trim();

    nextPos = this.getUntil(pageLines, ++nextPos, "Ký hiệu").nextPos;
    result.serial = pageLines[nextPos - 2].replace(/\#/g, "").trim();
    result.no = pageLines[nextPos - 1].replace(/\#/g, "").trim();

    nextPos = this.getUntil(pageLines, ++nextPos, "(At):").nextPos;
    result.date = this.processDate(pageLines[++nextPos]);

    nextPos = this.getUntil(pageLines, ++nextPos, "(Tax code):").nextPos;
    lineTmp = this.getUntil(pageLines, ++nextPos, "Mã số thuế");
    nextPos = lineTmp.nextPos;
    result.buyer.taxCode = lineTmp.strResult.trim();

    let totalRegex = /^\d+[\.\d\,]+\#\d+[\.\d\,]+\#\d+[\.\d\,]+$/;

    for (let i = ++nextPos; i < pageLines.length; i++) {
      if (totalRegex.test(pageLines[i])) {
        let newTableContent: TableContent = new TableContent();

        let totalArr = pageLines[i].split("#");
        newTableContent.total = +totalArr[0]
          .replace(/\./g, "")
          .replace(",", ".");
        newTableContent.unit_price = +totalArr[1]
          .replace(/\./g, "")
          .replace(",", ".");
        newTableContent.quantity = +totalArr[2]
          .replace(/\./g, "")
          .replace(",", ".");

        let productArr = pageLines[++i].split("#");
        productArr.pop();

        newTableContent.unit = productArr.shift()!;
        newTableContent.product_name = productArr.join("");

        result.table.push(newTableContent);
      } else break;
    }
    return result;
  }

  private processPage(pageLines: string[]) {
    let nextPos = this.getUntil(pageLines, 0, "#").nextPos;

    if (pageLines[nextPos].replace(/\#/g, "").trim() == "") {
      return this.processPageATek(pageLines);
    } else {
      return this.processPageBolt(pageLines);
    }
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
