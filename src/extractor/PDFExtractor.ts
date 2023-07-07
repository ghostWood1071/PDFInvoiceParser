import * as fs from "fs";
import { PDFDocument, PDFPage } from "pdf-lib";
import PdfParse from "pdf-parse";

export interface IExtractable {
  extractInfo(): any;
  extractBuyer(): any;
  extractSeller(): any;
  extractTable(): any;
  getResult(): any;
}

export class PdfExtractor {
  private fileName: string;
  private extracted: any;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  protected async getDocInfo() {
    let fileBuff = await fs.readFileSync(this.fileName);
    let parser = await PdfParse(fileBuff);
    return JSON.stringify(parser.metadata);
  }

  protected async getDocLines() {
    try {
      let data = this.extracted ? this.extracted : await this.extractPDF();
      let textPageArr: string[] = data.textPages;
      let result: any[] = [];
      for (let textPage of textPageArr) {
        result.push(textPage.split("\n"));
      }
      return result;
    } catch (e: any) {
      console.log(e);
      return null;
    }
  }

  protected async getPageBuffer(document: PDFDocument, pageNum: number) {
    try {
      let newDoc = await PDFDocument.create();
      let [page] = await newDoc.copyPages(document, [pageNum]);
      newDoc.addPage(page);
      let buffArr = await newDoc.save();
      let buff = Buffer.from(buffArr);
      return buff;
    } catch (err: any) {
      console.log(err);
      return null;
    }
  }

  protected async getTextInPages(document: PDFDocument) {
    let pageText: string[] = [];
    for (let pageNum = 0; pageNum < document.getPageCount(); pageNum++) {
      let pageBuff = await this.getPageBuffer(document, pageNum);
      if (!pageBuff) continue;
      let parser = await PdfParse(pageBuff);
      pageText.push(parser.text);
    }
    return pageText;
  }

  async extractPDF() {
    try {
      let fileContent = await fs.readFileSync(this.fileName);
      let pdfDoc = await PDFDocument.load(fileContent);
      let pageTextArr = await this.getTextInPages(pdfDoc);
      let docInfo = await this.getDocInfo();
      this.extracted = {
        textPages: pageTextArr,
        supplier: docInfo,
      };
      return this.extracted;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  protected async extractAmount(amountStr: string) {
    let amountObj: any = {
      unit: "",
      quanity: 0,
      unitPrice: 0,
      amount: 0,
    };

    let splitString: string[] = amountStr.split(/(\d+)/);

    amountObj.unit = splitString[0];

    splitString = splitString.slice(1, splitString.length - 1);

    const countDot = splitString.reduce(
      (count, x) => (count = x == "." ? count + 1 : count),
      0
    );

    splitString = splitString.filter((x) => x != ".");
    const l = splitString.length;
    let amount: string = "";
    let unitPrice: string = "";
    while (splitString.length > 0) {
      let x = splitString.pop();
      if (x != null) {
        if (x.length == 3) {
          amount = x + amount;
        } else if (x.length > 3) {
          unitPrice = x.slice(0, 3);
          amount = x.slice(3) + amount;
          amountObj.amount = +amount;
          break;
        }
      }
    }
    while (splitString.length > 0) {
      let x = splitString.pop();
      if (x != null) {
        if (splitString.length >= 1) {
          if (x.length == 3) {
            unitPrice = x + unitPrice;
          } else if (x.length > 3) {
            let quanity = x.slice(0, 3);
            unitPrice = x.slice(3) + unitPrice;
            amountObj.unitPrice = +unitPrice;
            amountObj.quanity = +(splitString.join("") + quanity);
            return amountObj;
          }
        } else {
          for (let i = 1; i <= 3; i++) {
            let j = x.length - i;
            if (j >= 1 && j <= 3) {
              let quanity: number = +x.slice(0, i);
              let unitPriceTmp: number = +(x.slice(i) + unitPrice);
              if (quanity * unitPriceTmp == amountObj.amount) {
                amountObj.quanity = quanity;
                amountObj.unitPrice = unitPriceTmp;
                return amountObj;
              }
            }
          }
        }
      }
    }

    return amountObj;
  }

  async saveRaw(fileName: string) {
    try {
      let data = this.extracted ? this.extracted : await this.extractPDF();
      await fs.writeFileSync(fileName, JSON.stringify(data));
    } catch (e: any) {
      console.log(e);
    }
  }

  async saveRawText(fileName: string) {
    try {
      let data: any = this.extracted ? this.extracted : await this.extractPDF();
      let textArray = data.textPages;
      for (let i = 0; i < textArray.length; i++) {
        await fs.writeFileSync(`${fileName}-${i}.txt`, textArray[i]);
      }
    } catch (e: any) {
      console.log(e);
    }
  }
}
