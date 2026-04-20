import { auth, clerkClient } from '@clerk/nextjs/server';
import AccountClient from '@/components/account/AccountClient';
import { getAccountOrdersByEmail } from '@/lib/server/account-orders';

export default async function AccountPage() {
  const { isAuthenticated, redirectToSignIn, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return redirectToSignIn({ returnBackUrl: '/account' });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const primaryEmailAddress =
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  const orderProfile = primaryEmailAddress
    ? await getAccountOrdersByEmail(primaryEmailAddress)
    : {
        firstName: null,
        lastName: null,
        defaultAddress: null,
        recentOrders: [],
      };

  const customer = {
    firstName: user.firstName || orderProfile.firstName || null,
    lastName: user.lastName || orderProfile.lastName || null,
    email: primaryEmailAddress || 'No email on file',
    phone: user.primaryPhoneNumber?.phoneNumber || null,
  };

  return (
    <AccountClient
      customer={customer}
      orders={orderProfile.recentOrders}
      defaultAddress={orderProfile.defaultAddress}
    />
  );
}
