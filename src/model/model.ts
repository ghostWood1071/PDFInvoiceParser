export class PageContent {
  date: string = "";
  serial: string = "";
  no: string = "";
  seller: any = {
    companyName: "",
    taxCode: "",
  };
  buyer: any = {
    companyName: "",
    taxCode: "",
  };
  table: TableContent[] = [];
}

export class TableContent {
  description: string = "";
  unit: string = "";
  quanity: number = 0;
  unitPrice: number = 0;
  amount: number = 0;
}

export enum PagePart {
  NONE,
  DATE,
  SERIAL,
  NO,
  SELLER_COMPANY_NAME,
  SELLER_TAX_CODE,
  BUYER_COMPANY_NAME,
  BUYER_TAX_CODE,
  TABLE,
}
