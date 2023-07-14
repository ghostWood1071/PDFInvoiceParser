import { PageContent, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";
// Lux Share
export class EInvoice2Extractor extends PdfExtractor {
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

    let nextPos = 0;
    while (pageLines[nextPos].trim() == "") {
      nextPos++;
    }

    result.seller.companyName = pageLines[nextPos].replace(/\#/g, "").trim();
    result.seller.taxCode = pageLines[++nextPos].replace(/\#/g, "").trim();

    nextPos++;

    let bankAccount = /[\d-]+#.+/;
    while (!bankAccount.test(pageLines[nextPos])) {
      nextPos++;
    }

    nextPos++;

    while (bankAccount.test(pageLines[nextPos])) {
      nextPos++;
    }

    result.buyer.companyName = pageLines[nextPos].replace(/\#/g, "").trim();
    result.buyer.taxCode = pageLines[++nextPos].replace(/\#/g, "").trim();

    let lineTmp = this.getUntil(pageLines, ++nextPos, "Ký hiệu#");
    if (lineTmp.strResult.includes("Ngày")) {
      lineTmp = this.getUntil(pageLines, nextPos, "Ngày");
      result.date = this.processDate(pageLines[lineTmp.nextPos]);
      nextPos = lineTmp.nextPos;
    }
    nextPos = this.getUntil(pageLines, nextPos, "Ký hiệu#").nextPos;
    ////////////////////////////////////////////////////////////////////////
    lineTmp = this.getUntil(pageLines, nextPos, "Số#");
    result.serial = this.getBehind(lineTmp.strResult, ":")
      .replace(/\#/, "")
      .trim();
    result.no = this.getBehind(pageLines[lineTmp.nextPos], ":")
      .replace(/\#/, "")
      .trim();
    nextPos = lineTmp.nextPos + 1;

    let isContainDate = false;
    for (let i = nextPos; i < pageLines.length; i++) {
      if (
        pageLines[i].startsWith("Ngày#") ||
        pageLines[i].includes("Mã của CQT")
      ) {
        nextPos = i;
        if (pageLines[i].startsWith("Ngày#")) isContainDate = true;
        break;
      }
    }
    if (isContainDate) result.date = this.processDate(pageLines[nextPos]);

    while (
      pageLines[nextPos] != "1#2#3#4#5#6 = 4 x 5" &&
      pageLines[nextPos] != "1#2#3#4#5#6#7 = 5 x 6"
    ) {
      nextPos++;
    }
    nextPos++;
    let totalRegex = /.+\#[\d\,\.]+\#[\d\,\.]+\#[\d\,\.]+$/;

    while (
      nextPos < pageLines.length &&
      pageLines[nextPos] !=
        "Người thực hiện chuyển đổi#(Converter)#Người mua hàng#(Buyer)#Người bán hàng#(Seller)" &&
      !pageLines[nextPos].startsWith("Trang")
    ) {
      while (isNaN(+pageLines[nextPos][0])) {
        if (pageLines[nextPos].startsWith("Tỷ giá #(Exchange rate)#:")) {
          result.exchange_rate = +this.getBehind(
            pageLines[nextPos].replace(/\#/g, "").trim(),
            ":"
          )
            .split(" ")[0]
            .replace(/\./g, "")
            .replace(/\,/g, ".");
          return result;
        } else {
          nextPos++;
          continue;
        }
      }

      let newTableContent = new TableContent();

      if (pageLines[nextPos].includes("#")) {
        newTableContent.product_id = this.getBehind(pageLines[nextPos], "#");
      }
      nextPos++;

      let productNametmp = "";

      while (!totalRegex.test(pageLines[nextPos])) {
        productNametmp += pageLines[nextPos] + " ";
        nextPos++;
      }
      newTableContent.product_name = productNametmp.trim();

      let arrTmp = pageLines[nextPos].split("#");

      newTableContent.unit = arrTmp[0];
      newTableContent.quantity = +arrTmp[1].replace(/\,/g, "");
      newTableContent.unit_price = +arrTmp[2].replace(/\,/g, "");
      newTableContent.total = +arrTmp[3].replace(/\,/g, "");

      result.table.push(newTableContent);

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
