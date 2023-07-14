import * as fs from "fs";
import { PDFDocument, PDFPage } from "pdf-lib";
import PdfParse from "pdf-parse";

const pdfSupplier = [
  {
    "File_name": "A-TECK_49_29.09.2022_TEM.pdf",
    "Creater": null,
    "Producer": "iTextSharp™ 5.4.5 ©2000-2013 1T3XT BVBA (AGPL-version) (AGPL-version)",
    "Fournisseur": "SOFTDREAMS",
    "MST": "0105987432"
  },
  {
    "File_name": "BL 1155302.pdf",
    "Creater": "PScript5.dll Version 5.2.2",
    "Producer": "Acrobat Distiller 21.0 (Windows)",
    "Fournisseur": "",
    "MST": ""
  },
  {
    "File_name": "HONK_88_30.09.2022.pdf",
    "Creater": null,
    "Producer": "Developer Express Inc. DXperience (tm) v16.1.2",
    "Fournisseur": "M-Invoice",
    "MST": "0106026495-001"
  },
  {
    "File_name": "CHEONG LIM_00000017.pdf",
    "Creater": null,
    "Producer": "HiQPdf 11.1",
    "Fournisseur": "MeInvoice-1",
    "MST": "0101243150"
  },
  {    //seojin
      "Creator": "Stimulsoft Reports 2016.3.0 from 7 December 2016",
      "Producer": "Stimulsoft Reports",
      "Title": "Hóa đơn",
      "CreationDate": "D:20230131202027+07'00'",
      "ModDate": "D:20230131202027+07'00'",
      "Fournisseur": "MeInvoice-2"
  },
  {
      "File_name": "LOGISALL_00000064_30.05.2023.pdf",
      "Title": "Report",
      "Creater": "Stimulsoft Reports 2016.3.0 from 7 December 2016",
      "Producer": "Stimulsoft Reports",
      "Fournisseur": "MeInvoice-3",
      "MST": "0101243150"
  },
  {
    "File_name": "NAGASE_3482_27.03.2023.pdf",
    "Creater": null,
    "Producer": "HiQPdf 9.12",
    "Fournisseur": "EInvoice",
    "MST": "0101300842"
  },
  {
    "File_name": "DAI LOI_00000437_30.05.2023.pdf",
    "Creater": null,
    "Producer": "Developer Express Inc. DXperience (tm) v15.2.9",
    "Fournisseur": "3A",
    "MST": "0108516079"
  },
  {
    "File_name": "INV T3.pdf",
    "Creater": "Form ZEX_SMART_CI_STANDARD EN",
    "Producer": "SAP NetWeaver 754 ",
    "Fournisseur": "",
    "MST": ""
  },
  {
    "File_name": "INV.pdf",
    "Creater": "Microsoft® Excel® 2016",
    "Producer": "Microsoft® Excel® 2016",
    "Fournisseur": "",
    "MST": ""
  },
  {
    "File_name": "ihoadon.vn_2300755090_851_31052023 JW T5-02.pdf",
    "Creater": null,
    "Producer": "EVO HTML to PDF Converter 8.0",
    "Fournisseur": "EFY",
    "MST": "0102519041"
  },
  {
    "File_name": "MAGTRON__28_27.05.2023.pdf",
    "Creater": null,
    "Producer": "Developer Express Inc. DXperience (tm) v16.1.2",
    "Fournisseur": "M-Invoice",
    "MST": "0106026495"
  },
  {
    "File_name": "1_001_C23TDS_568_18480 DOOSUN.pdf",
    "Creater": "wkhtmltopdf 0.12.1.1",
    "Producer": "Qt 4.8.6",
    "Fournisseur": "VNPT",
    "MST": null
  },
  {
    "File_name": "4601194212-C23TVN113.pdf",
    "Creater": "Apache FOP Version 2.2",
    "Producer": "Apache FOP Version 2.2",
    "Fournisseur": "VIETTEL",
    "MST": "0100109106"
  }, 
  {
      "Creator": "Microsoft Reporting Services 14.0.0.0",
      "Producer": "Microsoft Reporting Services PDF Rendering Extension 14.0.0.0",
      "CreationDate": "D:20230215171219+07'00'",
      "ModDate": "D:20230215195049+07'00'",
      "Fournisseur": "FAST"
  }
];

const seller = [
  "CÔNG TY CỔ PHẦN BÁN LẺ KỸ THUẬT SỐ FPT",
  "CÔNG TY CỔ PHẦN UIL VIỆT NAM",
  "CÔNG TY TNHH ASIA BOLT VINA",
  "CÔNG TY TNHH CHEONG LIM CHEMICAL",
  "CÔNG TY TNHH CÔNG NGHỆ ECOLIV",
  "CÔNG TY TNHH DONGSIN VINA HÀ NỘI",
  "CÔNG TY TNHH DOO SUNG TECH VIETNAM",
  "CÔNG TY TNHH DOOSUN VIỆT NAM",
  "CÔNG TY TNHH HOSIDEN VIỆT NAM (BẮC GIANG)",
  "CÔNG TY TNHH JUKWANG PRECISION VIỆT NAM",
  "CÔNG TY TNHH JV VINA - CHI NHÁNH BẮC GIANG",
  "CÔNG TY TNHH JWORLD VINA",
  "CÔNG TY TNHH KHVATEC HANOI",
  "CÔNG TY TNHH KỸ THUẬT IN LƯỚI THÌN OAI",
  "CÔNG TY TNHH LOGISALL VIỆT NAM",
  "CÔNG TY TNHH LUXSHARE-ICT (VIỆT NAM)",
  "CÔNG TY TNHH MAGTRON VINA",
  "CÔNG TY TNHH NAGASE VIỆT NAM",
  "CÔNG TY TNHH NANO TECH",
  "CÔNG TY TNHH PHÁT TRIỂN CÔNG NGHỆ HONK VIỆT NAM",
  "CÔNG TY TNHH SẢN XUẤT BAO BÌ VÀ DỊCH VỤ ĐẠI LỢI",
  "CÔNG TY TNHH SEOJIN AUTO",
  "CÔNG TY TNHH SHIN SUNG VINA",
  "CÔNG TY TNHH TEXON VIETNAM",
  "CÔNG TY TNHH VẬT LIỆU ĐIỆN TỬ A-TEK VIỆT NAM",
  "CÔNG TY TNHH WONJIN VINA",
];
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
  protected unitArr: string[] = ["kg", "ea", "cái", "chiếc"];

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  private getSupplierRegex(suppliers:any){
    let supplierNames:string[] = [];
    for (let supplier of suppliers){
      supplierNames.push(supplier.Fournisseur); 
    }
    let regexString = supplierNames.join("|");
    return new RegExp(regexString, "g");
  }

  
  protected async getSupplier(lines:string[], suppliers: any){
    let supplierRegex = this.getSupplierRegex(suppliers);
    let regex = /cung cấp giải pháp|Phần mềm được cung cấp bởi|bởi phần mềm|từ Phần mềm|Hóa Đơn Điện Tử/g;
    for(let line in lines){
      if(regex.test(line)){
        if(supplierRegex.test(line))
          return supplierRegex.exec(line)?.[0];
      }
    }
  }

  async getDocInfo() {
    let fileBuff = await fs.readFileSync(this.fileName);
    let parser = await PdfParse(fileBuff);
    let pdfInfo = parser.info;
    if(pdfInfo)
      return pdfInfo;
    let docLines = await this.getDocLines();
    if(docLines){
      let supplier = await this.getSupplier(docLines[0], pdfSupplier);
      return supplier
    } 
    return null;
  }

  // async getSeller(){
  //   let docLines = await this.getDocLines();
  //   if(docLines){
  //     for(let line of docLines){
  //       if(line.includes(""))
  //     }
  //   } 
  //   return null;
  // }

  async getMetadata() {
    let fileBuff = await fs.readFileSync(this.fileName);
    let parser = await PdfParse(fileBuff);
    return parser.metadata;
  }

  protected getUntil(pageLines: string[], posPart: number, ending: string) {
    let result = "";
    let pos = posPart;
    for (let i = posPart; i < pageLines.length; i++) {
      if (pageLines[i] == ending || pageLines[i].startsWith(ending)) {
        pos = i;
        break;
      } else result = result + pageLines[i] + " ";
    }
    // result = this.getBehind(result.trim(), ":")
    return { strResult: result, nextPos: pos };
  }

  protected getBehind(input: string, split: string) {
    return input.split(split)[1].trim();
  }

  protected renderPage(pageData: any): string {
    //check documents https://mozilla.github.io/pdf.js/
    let render_options = {
      //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
      normalizeWhitespace: false,
      //do not attempt to combine same line TextItem's. The default value is `false`.
      disableCombineTextItems: false,
    };

    let renderText = (textContent: any) => {
      //fs.writeFileSync('lol.json', JSON.stringify(textContent));
      let regex = /^[\d,.]+$/;
      let lastY,
        text = "";
      for (let item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          if (regex.test(item.str)) text += "#" + item.str;
          else text += item.str;
          // text += "\n" + item.str;
        } else {
          text += "\n" + item.str;
        }
        lastY = item.transform[5];
      }
      return text;
    };

    return pageData.getTextContent(render_options).then(renderText);
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
      let parser = await PdfParse(pageBuff, {
        pagerender: await this.renderPage,
      });
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

  protected async extractTotal(totalStr: string) {
    let totalObj: any = {
      unit: "",
      quantity: 0,
      unitPrice: 0,
      total: 0,
    };

    let splitString: string[] = totalStr.split(/(\d+)/);

    totalObj.unit = splitString[0];

    splitString = splitString.slice(1, splitString.length - 1);

    splitString = splitString.filter((x) => x != ".");

    const l = splitString.length;
    let total: string = "";
    let unitPrice: string = "";
    while (splitString.length > 0) {
      let x = splitString.pop();
      if (x != null) {
        if (splitString[splitString.length - 1] == ",") {
          unitPrice = splitString.pop() + x.slice(0, 2);
          totalObj.total = +(x.slice(2) + total);
          break;
        } else if (x.length == 3) {
          total = x + total;
        } else if (x.length > 3) {
          unitPrice = x.slice(0, 3);
          total = x.slice(3) + total;
          totalObj.total = +total;
          break;
        }
      }
    }

    while (splitString.length > 0) {
      let x = splitString.pop();
      if (x != null) {
        if (splitString.length >= 1) {
          if (splitString[splitString.length - 1] == ",") {
            totalObj.quantity = parseFloat(
              (splitString.join("") + x.slice(0, 2)).replace(",", ".")
            );
            totalObj.unitPrice = parseFloat(
              (x.slice(2) + unitPrice).replace(",", ".")
            );

            return totalObj;
          } else if (x.length == 3) {
            unitPrice = x + unitPrice;
          } else if (x.length > 3) {
            let quantity = x.slice(0, 3);
            unitPrice = x.slice(3) + unitPrice;

            totalObj.unitPrice = parseFloat(unitPrice.replace(",", "."));
            totalObj.quantity = parseFloat(
              (splitString.join("") + quantity).replace(",", ".")
            );
            return totalObj;
          }
        } else {
          for (let i = 1; i <= 3; i++) {
            let j = x.length - i;
            if (j >= 1 && j <= 3) {
              let quantity: number = +x.slice(0, i);
              let unitPriceTmp: number = +(x.slice(i) + unitPrice);
              if (quantity * unitPriceTmp == totalObj.total) {
                totalObj.quantity = quantity;
                totalObj.unitPrice = unitPriceTmp;

                return totalObj;
              }
            }
          }
        }
      }
    }

    return null;
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
