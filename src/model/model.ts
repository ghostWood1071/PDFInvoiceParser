export class PageContent {
  date: Date = new Date();
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
  exchange_rate = null;
  table: TableContent[] = [];
}

export class TableContent {
  product_id = null;
  product_name: string = "";
  unit: string = "";
  quanity: number = 0;
  unit_price: number = 0;
  total: number = 0;
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
