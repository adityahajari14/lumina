import { prisma } from './database';

export const OPTIONAL_ORDER_COLUMNS = ['shopifyOrderId', 'lineItems', 'currencyCode'] as const;

type OptionalOrderColumn = (typeof OPTIONAL_ORDER_COLUMNS)[number];

let orderTableColumnsPromise: Promise<Set<string>> | null = null;

type OrderColumnRow = {
  column_name: string;
};

async function loadOrderTableColumns(): Promise<Set<string>> {
  const rows = await prisma.$queryRaw<OrderColumnRow[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Order'
  `;

  return new Set(rows.map((row) => row.column_name));
}

export async function getOrderTableColumns(): Promise<Set<string>> {
  if (!orderTableColumnsPromise) {
    orderTableColumnsPromise = loadOrderTableColumns().catch((error) => {
      orderTableColumnsPromise = null;
      throw error;
    });
  }

  return orderTableColumnsPromise;
}

export function hasOrderColumn(columns: Set<string>, column: OptionalOrderColumn): boolean {
  return columns.has(column);
}
