import {PdfExtractor, IExtractable} from './PDFExtractor';

class PageContent{
    date: string = "";
    serial:string = "";
}

enum PagePart {
    NONE, DATE, SERIAL, NO, SELLER, BUYER, TABLE
}

export class ViettelInvoiceExtractor extends PdfExtractor implements IExtractable {
    
    private docLines: Promise<any[] | null>;
    
    constructor(fileName:string){
        super(fileName)
        this.docLines = this.getDocLines();
    }


    private async processLines(pageLines:string[]){
        let result:PageContent = new PageContent();
        let parts: PagePart = PagePart.NONE;
        for(let line of pageLines){
            
            if(line == "Ngày"){
                result.date = result.date + line;
                parts = PagePart.DATE;
            } else if(parts == PagePart.DATE && line != "Ký hiệu"){
                result.date = result.date + line;
            }

            if (line == "Ký hiệu") {
                result.serial = result.serial + line;
                parts = PagePart.SERIAL;
            } else if (parts == PagePart.SERIAL && line != "Số"){
                result.serial = result.serial+line;
            }

            if (line == "Số") {
                break;
            }
            
        }
        return result;
    }

    async getResult() {
        let data = await this.docLines;
        console.log(data?data[0]:"");
        let result = data?this.processLines(data[0]):null;
        return result;
    }

    extractInfo() {
        throw new Error('Method not implemented.');
    }
    extractBuyer() {
        throw new Error('Method not implemented.');
    }
    extractSeller() {
        throw new Error('Method not implemented.');
    }
    extractTable() {
        throw new Error('Method not implemented.');
    }
    
}

