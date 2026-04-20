import { prisma } from './database';
import { getOrderTableColumns, hasOrderColumn } from './order-table-schema';

export type AccountOrderLineItem = {
  id: string | null;
  title: string;
  quantity: number;
  price: string;
  sku: string | null;
  configuration: Record<string, string>;
  properties: Array<{
    name: string;
    value: string;
  }>;
};

export type AccountOrderSummary = {
  id: string;
  name: string;
  createdAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: string;
  currencyCode: string;
  lineItems: AccountOrderLineItem[];
};

export type AccountAddress = {
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  country: string | null;
};

export type AccountOrderProfile = {
  firstName: string | null;
  lastName: string | null;
  defaultAddress: AccountAddress | null;
  recentOrders: AccountOrderSummary[];
};

type AddressShape = Partial<AccountAddress>;
type AccountOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string | null;
  shippingAddress: unknown;
  lineItems: unknown;
  currencyCode: string | null;
  total: string | number;
  createdAt: Date | string;
};

function splitCustomerName(name: string | null | undefined): {
  firstName: string | null;
  lastName: string | null;
} {
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return { firstName: null, lastName: null };
  }

  const [firstName, ...rest] = trimmedName.split(/\s+/);

  return {
    firstName: firstName || null,
    lastName: rest.join(' ').trim() || null,
  };
}

function normalizeAddress(value: unknown): AccountAddress | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const address = value as AddressShape;

  return {
    address1: address.address1 ?? null,
    address2: address.address2 ?? null,
    city: address.city ?? null,
    province: address.province ?? null,
    zip: address.zip ?? null,
    country: address.country ?? null,
  };
}

function normalizeLineItems(value: unknown): AccountOrderLineItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : null,
      title: typeof item.title === 'string' ? item.title : 'Configured blind',
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      price: typeof item.price === 'string' ? item.price : '0',
      sku: typeof item.sku === 'string' ? item.sku : null,
      configuration:
        item.configuration && typeof item.configuration === 'object' && !Array.isArray(item.configuration)
          ? item.configuration as Record<string, string>
          : {},
      properties: Array.isArray(item.properties)
        ? item.properties.filter(
            (property): property is { name: string; value: string } =>
              Boolean(property) &&
              typeof property === 'object' &&
              typeof property.name === 'string' &&
              typeof property.value === 'string'
          )
        : [],
    }));
}

function normalizeDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function normalizeMoneyValue(value: string | number): string {
  return typeof value === 'number' ? value.toString() : value;
}

function mapFinancialStatus(status: string): string | null {
  switch (status) {
    case 'REFUNDED':
      return 'REFUNDED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'PAID';
  }
}

function mapFulfillmentStatus(status: string): string | null {
  switch (status) {
    case 'PROCESSING':
      return 'PROCESSING';
    case 'SHIPPED':
      return 'SHIPPED';
    case 'DELIVERED':
      return 'DELIVERED';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'REFUNDED':
      return 'REFUNDED';
    default:
      return 'CONFIRMED';
  }
}

export async function getAccountOrdersByEmail(email: string): Promise<AccountOrderProfile> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      firstName: null,
      lastName: null,
      defaultAddress: null,
      recentOrders: [],
    };
  }

  const columns = await getOrderTableColumns();
  const lineItemsSelect = hasOrderColumn(columns, 'lineItems')
    ? '"lineItems"'
    : 'NULL::jsonb AS "lineItems"';
  const currencyCodeSelect = hasOrderColumn(columns, 'currencyCode')
    ? 'COALESCE("currencyCode", \'GBP\') AS "currencyCode"'
    : '\'GBP\'::text AS "currencyCode"';

  const orders = await prisma.$queryRawUnsafe<AccountOrderRow[]>(
    `
      SELECT
        "id",
        "orderNumber",
        "status",
        "customerName",
        "shippingAddress",
        ${lineItemsSelect},
        ${currencyCodeSelect},
        "total",
        "createdAt"
      FROM "Order"
      WHERE LOWER(COALESCE("customerEmail", '')) = LOWER($1)
      ORDER BY "createdAt" DESC
      LIMIT 10
    `,
    normalizedEmail
  );

  const latestNamedOrder = orders.find((order) => order.customerName?.trim());
  const latestAddressOrder = orders.find((order) => normalizeAddress(order.shippingAddress));

  return {
    ...splitCustomerName(latestNamedOrder?.customerName),
    defaultAddress: latestAddressOrder ? normalizeAddress(latestAddressOrder.shippingAddress) : null,
    recentOrders: orders.map((order) => ({
      id: order.id,
      name: order.orderNumber,
      createdAt: normalizeDate(order.createdAt),
      financialStatus: mapFinancialStatus(order.status),
      fulfillmentStatus: mapFulfillmentStatus(order.status),
      totalPrice: normalizeMoneyValue(order.total),
      currencyCode: order.currencyCode || 'GBP',
      lineItems: normalizeLineItems(order.lineItems),
    })),
  };
}
