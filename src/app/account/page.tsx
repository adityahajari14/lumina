import { redirect } from 'next/navigation';

const SHOPIFY_ACCOUNT_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_DOMAIN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.replace(/^orders\./, 'account.') ||
  '';

export default function AccountPage() {
  if (!SHOPIFY_ACCOUNT_DOMAIN) {
    redirect('/');
  }

  redirect(`/api/auth/shopify/login?return_to=${encodeURIComponent(`https://${SHOPIFY_ACCOUNT_DOMAIN}`)}`);
}
