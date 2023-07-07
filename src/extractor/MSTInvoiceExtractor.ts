import { PdfExtractor, IExtractable } from "./PDFExtractor";

enum Part {
    NONE, DATE, SERIAL, NO, SELLER, BUYER, TABLE
}


export class MSTInvoiceExtractor extends PdfExtractor{
    private docLines:Promise<any[] | null>;
    private pos: number;
    constructor(fileName:string){
        super(fileName);
        this.docLines = this.getDocLines();
        this.pos = 0;
    }


    private processLine(pageLines: string[]){
        while(true){

        }
    }

    getResult() {
        throw new Error("Method not implemented.");
    }

    
    async extractInfo() {
        
    }
    extractBuyer() {
        throw new Error("Method not implemented.");
    }
    extractSeller() {
        throw new Error("Method not implemented.");
    }
    extractTable() {
        throw new Error("Method not implemented.");
    }

}

let mst = new MSTInvoiceExtractor("../src/pdf/1C23TGT-256.pdf");
mst.saveRawText("abc.txt");