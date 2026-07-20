import { NextResponse } from 'next/server';
import { createCheckout, CheckoutError } from '@/lib/server/order.service';

const MAX_TRACKING_FIELD_LENGTH = 500;

function clampString(value: unknown, maxLength = MAX_TRACKING_FIELD_LENGTH): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerEmail, note } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'items array is required and must not be empty' } },
        { status: 400 }
      );
    }

    const result = await createCheckout({
      items,
      customerEmail,
      note,
      sessionId: clampString(body.sessionId, 100),
      utmSource: clampString(body.utmSource, 200),
      utmMedium: clampString(body.utmMedium, 200),
      utmCampaign: clampString(body.utmCampaign, 200),
      referrer: clampString(body.referrer),
      deviceType: clampString(body.deviceType, 20),
      userAgent: clampString(body.userAgent),
      sessionDurationSeconds:
        typeof body.sessionDurationSeconds === 'number' && Number.isFinite(body.sessionDurationSeconds) && body.sessionDurationSeconds >= 0
          ? body.sessionDurationSeconds
          : undefined,
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: error.statusCode }
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found') || message.includes('no price band')) {
      return NextResponse.json(
        { success: false, error: { message } },
        { status: 404 }
      );
    }

    console.error('Checkout error:', message);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
