import { PageContent, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";
// Lux Share
export class EInvoice3Extractor extends PdfExtractor {
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

    let lineTmp = this.getUntil(pageLines, 0, "#Điện thoại #(Tel)#:");
    let nextPos = lineTmp.nextPos;

    lineTmp = this.getUntil(pageLines, ++nextPos, "Địa chỉ #(Address)#:");

    result.seller.companyName = lineTmp.strResult.replace(/\#/g, "").trim();

    nextPos = this.getUntil(
      pageLines,
      ++lineTmp.nextPos,
      "Mã số thuế #(Tax code)#:"
    ).nextPos;

    lineTmp = this.getUntil(pageLines, nextPos, "Số tài khoản #(Account No)#:");

    result.seller.taxCode = this.getBehind(
      lineTmp.strResult.replace(/\#/g, ""),
      ":"
    ).trim();

    // nextPos++;

    // let bankAccount = /[\d-]+#.+/;
    // while (!bankAccount.test(pageLines[nextPos])) {
    //   nextPos++;
    // }

    // nextPos++;

    // while (bankAccount.test(pageLines[nextPos])) {
    //   nextPos++;
    // }

    // result.buyer.companyName = pageLines[nextPos].replace(/\#/g, "").trim();
    // result.buyer.taxCode = pageLines[++nextPos].replace(/\#/g, "").trim();

    // nextPos = this.getUntil(pageLines, ++nextPos, "Ký hiệu#(Symbol)").nextPos;

    // lineTmp = this.getUntil(pageLines, nextPos, "Số#(Invoice No)");
    // nextPos = lineTmp.nextPos;

    // result.serial = this.getBehind(
    //   lineTmp.strResult.replace(/\#/g, "").trim(),
    //   ":"
    // );

    // lineTmp = this.getUntil(pageLines, nextPos, ":");
    // nextPos = lineTmp.nextPos;

    // result.no = this.getBehind(
    //   lineTmp.strResult.trim().replace(/\#/g, ""),
    //   ":"
    // );

    // nextPos = this.getUntil(pageLines, ++nextPos, "Ngày#(Date)").nextPos;

    // result.date = this.processDate(pageLines[nextPos].trim());

    // nextPos = this.getUntil(
    //   pageLines,
    //   ++nextPos,
    //   "1#2#3#4#5#6#7 = 5 x 6"
    // ).nextPos;
    // nextPos++;

    // let totalRegex = /.+\#[\d\,\.]+\#[\d\,\.]+\#[\d\,\.]+$/;

    // while (
    //   nextPos < pageLines.length &&
    //   pageLines[nextPos] !=
    //     "Người thực hiện chuyển đổi#(Converter)#Người mua hàng#(Buyer)#Người bán hàng#(Seller)"
    // ) {
    //   while (isNaN(+pageLines[nextPos][0])) {
    //     if (pageLines[nextPos].startsWith("Tỷ giá #(Exchange rate)#:")) {
    //       result.exchange_rate = +this.getBehind(
    //         pageLines[nextPos].replace(/\#/g, "").trim(),
    //         ":"
    //       )
    //         .split(" ")[0]
    //         .replace(/\./g, "")
    //         .replace(/\,/g, ".");
    //       return result;
    //     } else {
    //       nextPos++;
    //       continue;
    //     }
    //   }

    //   let newTableContent = new TableContent();

    //   if (pageLines[nextPos].includes("#")) {
    //     newTableContent.product_id = this.getBehind(pageLines[nextPos], "#");
    //   }
    //   nextPos++;

    //   let productNametmp = "";

    //   while (!totalRegex.test(pageLines[nextPos])) {
    //     productNametmp += pageLines[nextPos] + " ";
    //     nextPos++;
    //   }
    //   newTableContent.product_name = productNametmp.trim();

    //   let arrTmp = pageLines[nextPos].split("#");

    //   newTableContent.unit = arrTmp[0];
    //   newTableContent.quantity = +arrTmp[1].replace(/\,/g, "");
    //   newTableContent.unit_price = +arrTmp[2].replace(/\,/g, "");
    //   newTableContent.total = +arrTmp[3].replace(/\,/g, "");

    //   result.table.push(newTableContent);

    //   nextPos++;
    // }
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
