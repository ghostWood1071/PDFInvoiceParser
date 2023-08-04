import { PageContent, PagePart, TableContent } from "../model/model";
import { PdfExtractor } from "./PDFExtractor";

export class Viettel2Extractor extends PdfExtractor {
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
      let text = "";
      let textMap: Map<number, any[]> = new Map<number, any[]>();
      for (let item of textContent.items) {
        let itemMap = textMap.get(item.transform[5]);
        if (itemMap) {
          itemMap.push(item);
        } else {
          textMap.set(item.transform[5], [item]);
        }
      }

      for (let key of textMap.keys()) {
        text +=
          textMap
            .get(key)
            ?.sort((x, y) => x.transform[4] - y.transform[4])
            .map((x) => x.str)
            .join("#") + "\n";
      }
      return text;
    };

    return pageData.getTextContent(render_options).then(renderText);
  }

  protected getBetweenLines(
    pageLines: string[],
    nextPos: number,
    startLine: string,
    endLine: string
  ): { result: string; nextPos: number } {
    nextPos = this.getUntil(pageLines, nextPos, startLine).nextPos;
    let lineTmp = this.getUntil(pageLines, nextPos, endLine);

    let result = this.getBehind(
      lineTmp.strResult.replace(/#/g, ""),
      ":"
    ).trim();

    return { result, nextPos: lineTmp.nextPos };
  }

  protected processTotal(
    quantity_str: string,
    unit_price_str: string,
    total_str: string
  ) {
    let quantity = +quantity_str.replace(/\,/g, "").trim();
    let unit_price = +unit_price_str.replace(/\,/g, "").trim();
    let total = +total_str.replace(/\,/g, "").trim();

    if (
      !isNaN(quantity) &&
      !isNaN(unit_price) &&
      !isNaN(total) &&
      quantity * unit_price == total
    ) {
      return [quantity, unit_price, total];
    } else {
      return [
        +quantity_str.replace(/\./g, "").replace(",", "."),
        +unit_price_str.replace(/\./g, "").replace(",", "."),
        +total_str.replace(/\./g, "").replace(",", "."),
      ];
    }
  }

  private processPage(pageLines: string[]) {
    let result = new PageContent();
    let pageLenght = pageLines.length;

    let lineTmp = this.getUntil(pageLines, 0, "Ngày");
    let nextPos = lineTmp.nextPos;

    result.date = this.processDate(pageLines[nextPos]);

    let betweenLines = this.getBetweenLines(
      pageLines,
      nextPos,
      "Ký hiệu ",
      "Số "
    );
    result.serial = betweenLines.result;
    nextPos = betweenLines.nextPos;

    betweenLines = this.getBetweenLines(
      pageLines,
      nextPos,
      "Số",
      "Đơn vị bán hàng"
    );
    result.no = betweenLines.result;
    nextPos = betweenLines.nextPos;

    betweenLines = this.getBetweenLines(
      pageLines,
      nextPos,
      "Đơn vị bán hàng",
      "Mã số thuế"
    );
    result.seller.companyName = betweenLines.result;
    nextPos = betweenLines.nextPos;

    betweenLines = this.getBetweenLines(
      pageLines,
      nextPos,
      "Mã số thuế",
      "Địa chỉ"
    );
    result.seller.taxCode = betweenLines.result;
    nextPos = betweenLines.nextPos;

    betweenLines = this.getBetweenLines(
      pageLines,
      nextPos,
      "Tên đơn vị",
      "Mã số thuế"
    );
    result.buyer.companyName = betweenLines.result;
    nextPos = betweenLines.nextPos;

    betweenLines = this.getBetweenLines(
      pageLines,
      nextPos,
      "Mã số thuế",
      "Địa chỉ "
    );
    result.buyer.taxCode = betweenLines.result;
    nextPos = betweenLines.nextPos;

    let endRowRegex = /\D+\#[\d\.\, ]+\#[\d\,\. ]+\#[\d\,\. ]+$/;

    nextPos = this.getUntil(pageLines, nextPos, "1#2#3#4#5#6 = 4 x 5").nextPos;
    nextPos++;

    for (nextPos; nextPos < pageLines.length; nextPos++) {
      if (!isNaN(+pageLines[nextPos][0])) {
        let rowTmp = "";

        for (nextPos; nextPos < pageLines.length; nextPos++) {
          if (!pageLines[nextPos].includes("#")) {
            break;
          }

          if (!endRowRegex.test(pageLines[nextPos])) {
            rowTmp += pageLines[nextPos] + "#";
          } else {
            rowTmp += pageLines[nextPos] + "#";
            break;
          }
        }

        let newTableContent: TableContent = new TableContent();
        let rowArr = rowTmp.split("#").filter((x) => x != "");
        rowArr.shift();

        let total: string = rowArr.pop()!;
        let unit_price: string = rowArr.pop()!;
        let quantity: string = rowArr.pop()!;
        [
          newTableContent.quantity,
          newTableContent.unit_price,
          newTableContent.total,
        ] = this.processTotal(quantity, unit_price, total);

        newTableContent.unit = rowArr.pop()!;

        newTableContent.product_name = rowArr.join(" ");

        result.table.push(newTableContent);
      } else break;
    }

    return result;
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
