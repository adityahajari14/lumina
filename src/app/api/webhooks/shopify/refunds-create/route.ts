import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/database';
import { getOrderTableColumns, hasOrderColumn } from '@/lib/server/order-table-schema';

export async function POST(request: Request) {
  try {
    const refund = await request.json();

    if (!refund || !refund.order_id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    console.log(`Webhook: Refund created for Shopify order ${refund.order_id}`);
    console.log(`  Refund amount: ${refund.transactions?.[0]?.amount || 'unknown'}`);

    const orderTableColumns = await getOrderTableColumns();

    if (hasOrderColumn(orderTableColumns, 'shopifyOrderId')) {
      await prisma.order.updateMany({
        where: {
          shopifyOrderId: String(refund.order_id),
        },
        data: {
          status: 'REFUNDED',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', message);
    return NextResponse.json({ success: true, warning: 'Processed with errors' });
  }
}
