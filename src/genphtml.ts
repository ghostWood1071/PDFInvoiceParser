import { PageContent } from "./model/model";
import * as fs from "fs";
import { ViettelInvoiceExtractor } from "./extractor/ViettelInvoiceEctractor";

class HTMLRender {
    constructor(){
        
    }
    async gen(pageContent:PageContent) {
        let result: string[] = [];
        result.push(`<p>${pageContent.date}</p></br>`);
        result.push(`<p>${pageContent.serial}</p></br>`);
        result.push(`<p>${pageContent.no}</p></br>`);
        result.push(`<p>-------------------------------------------------</p></br>`);
        result.push(`<p>${pageContent.seller.companyName}</p></br>`);
        result.push(`<p>${pageContent.seller.taxCode}</p></br>`);
        result.push(`<p>-------------------------------------------------</p></br>`);
        result.push(`<p>${pageContent.buyer.companyName}</p></br>`);
        result.push(`<p>${pageContent.buyer.taxCode}</p></br>`);
        result.push(`<p>-------------------------------------------------</p></br>`);
        for(let tbl of pageContent.table){
            result.push(`<p>${tbl.description} |  ${tbl.unit} | ${tbl.quanity} | ${tbl.unitPrice} | ${tbl.amount} </p> </br>`);
        }
        let data = result.join(" ");
        await fs.writeFileSync('demo.html', data);
    }
}

async function main(){
    let demo = new HTMLRender()
    let extractor = new ViettelInvoiceExtractor("../src/pdf/4601194212-C23TVN113.pdf");
    let data = await extractor.getResult();
    await demo.gen(data?data:new PageContent());
}

main();
