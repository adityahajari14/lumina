import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/database';
import { getOrderTableColumns, hasOrderColumn } from '@/lib/server/order-table-schema';
import { orderMatchesSource } from '@/lib/server/shopify-order-source';

type ShopifyLineItemProperty = {
  name?: string | null;
  value?: string | number | boolean | null;
};

type ShopifyLineItem = {
  id?: string | number | null;
  title?: string | null;
  name?: string | null;
  quantity?: number | null;
  price?: string | number | null;
  sku?: string | null;
  properties?: ShopifyLineItemProperty[] | null;
};

function normalizePropertyValue(value: ShopifyLineItemProperty['value']): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function normalizeLineItemProperties(properties: ShopifyLineItem['properties']) {
  if (!Array.isArray(properties)) {
    return [];
  }

  return properties
    .filter((property) => property?.name)
    .map((property) => ({
      name: property.name || '',
      value: normalizePropertyValue(property.value),
    }));
}

function buildLineItemConfiguration(properties: ReturnType<typeof normalizeLineItemProperties>) {
  return Object.fromEntries(
    properties
      .filter((property) => property.name && !property.name.startsWith('_'))
      .map((property) => [property.name, property.value])
  );
}

function normalizeLineItems(lineItems: unknown) {
  if (!Array.isArray(lineItems)) {
    return [];
  }

  return lineItems.map((lineItem: ShopifyLineItem) => {
    const properties = normalizeLineItemProperties(lineItem.properties);

    return {
      id: lineItem.id ? String(lineItem.id) : null,
      title: lineItem.title || lineItem.name || 'Configured blind',
      quantity: lineItem.quantity || 1,
      price: lineItem.price ? String(lineItem.price) : '0',
      sku: lineItem.sku || null,
      properties,
      configuration: buildLineItemConfiguration(properties),
    };
  });
}

export async function POST(request: Request) {
  try {
    const order = await request.json();

    if (!order || !order.id) {
      console.error('Webhook: Invalid order payload');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!orderMatchesSource(order)) {
      console.log(`Webhook: Ignoring paid order ${order.id} because source tag did not match`);
      return NextResponse.json({ success: true, ignored: true });
    }

    const orderTableColumns = await getOrderTableColumns();
    console.log(`Webhook: Order paid #${order.order_number} (Shopify ID: ${order.id})`);

    const orderNumber = `BLACKOUT-SHOP-${order.order_number || order.id}`;
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
    });

    const orderData = {
      status: 'CONFIRMED' as const,
      customerEmail: (order.email || order.customer?.email || '').trim().toLowerCase() || null,
      customerName: order.customer
        ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
        : null,
      shippingAddress: order.shipping_address || null,
      subtotal: parseFloat(order.subtotal_price) || 0,
      tax: parseFloat(order.total_tax) || 0,
      shipping: order.shipping_lines?.[0]
        ? parseFloat(order.shipping_lines[0].price) || 0
        : 0,
      total: parseFloat(order.total_price) || 0,
      ...(hasOrderColumn(orderTableColumns, 'shopifyOrderId')
        ? { shopifyOrderId: String(order.id) }
        : {}),
      ...(hasOrderColumn(orderTableColumns, 'lineItems')
        ? { lineItems: normalizeLineItems(order.line_items) }
        : {}),
      ...(hasOrderColumn(orderTableColumns, 'currencyCode')
        ? { currencyCode: order.currency || null }
        : {}),
    };

    if (existingOrder) {
      await prisma.order.update({
        where: { orderNumber },
        data: orderData,
      });
      console.log(`  Updated order: ${orderNumber}`);
    } else {
      await prisma.order.create({
        data: { orderNumber, ...orderData },
      });
      console.log(`  Created order: ${orderNumber}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', message);
    return NextResponse.json({ success: true, warning: 'Processed with errors' });
  }
}
