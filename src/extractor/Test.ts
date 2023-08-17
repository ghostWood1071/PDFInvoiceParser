import { PdfExtractor } from "./PDFExtractor";

export class Test extends PdfExtractor {
  private docLines: Promise<any[] | null>;
  constructor(fileName: string) {
    super(fileName);
    this.docLines = this.getDocLines();
  }

  protected renderPage(pageData: any): string {
    let render_options = {
      normalizeWhitespace: false,
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
      for (let value of textMap.values()) {
        text +=
          value
            ?.sort((x, y) => x.transform[4] - y.transform[4])
            .map((x) => x.str)
            .join("#") + "\n";
      }
      return text;
    };
    return pageData.getTextContent(render_options).then(renderText);
  }
}
