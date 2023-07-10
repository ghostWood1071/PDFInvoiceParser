import { PdfExtractor } from "./PDFExtractor";

export class MeInvoiceExtractor extends PdfExtractor {
    private docLines:Promise<any[] | null>;
    constructor(fileName:string){
        super(fileName);
        this.docLines = this.getDocLines();
    }

    
}