import { NextResponse } from 'next/server';
import { getDraftOrderStatus, CheckoutError } from '@/lib/server/order.service';

export async function GET(request: Request) {
  const draftOrderId = new URL(request.url).searchParams.get('draftOrderId');

  if (!draftOrderId) {
    return NextResponse.json({ error: 'Missing draftOrderId' }, { status: 400 });
  }

  try {
    const status = await getDraftOrderStatus(draftOrderId);
    return NextResponse.json({ purchased: status.purchased });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to check checkout status' }, { status: error instanceof CheckoutError ? error.statusCode : 503 });
  }
}
