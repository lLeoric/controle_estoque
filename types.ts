
export enum TransactionType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT'
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  registration: string;
}

export interface Company {
  id: string;
  cnpj: string;
  razaoSocial: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  description: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  productId: string;
  responsibleId: string;
  companyId: string;
  type: TransactionType;
  quantity: number;
  date: string;
  document: string;
  note?: string;
}

export interface KardexLine {
  date: string;
  document: string;
  responsible: string;
  companyName: string;
  type: TransactionType;
  
  // Quantities
  entryQty: number;
  exitQty: number;
  balanceQty: number;
}

export interface StockSummary {
  productId: string;
  productName: string;
  currentQty: number;
  isLowStock: boolean;
}
