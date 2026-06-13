import { getAdminApiUrl, getAdminHeaders, validateShopifyConfig } from './shopify-admin';
import { newsletterConfig } from './newsletter-config';

const NEWSLETTER_PARENT_CODE = newsletterConfig.sharedDiscountCode;

const DISCOUNT_SEARCH_PAGE_SIZE = 50;

interface ShopifyGraphQLError {
  message: string;
}

interface ShopifyUserError {
  field?: string[] | null;
  message: string;
}

interface AdminGraphQLResponse<T> {
  data?: T;
  errors?: ShopifyGraphQLError[];
}

interface DiscountCodeNode {
  id: string;
  codeDiscount:
    | {
        title: string;
        codes?: {
          nodes: Array<{
            code: string;
          }>;
        };
      }
    | null;
}

interface ResolveCodeDiscountsResponse {
  codeDiscountNodes: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: DiscountCodeNode[];
  };
}

interface CustomerSetResponse {
  customerSet: {
    customer: { id: string } | null;
    userErrors: ShopifyUserError[];
  };
}

interface CustomerCreateResponse {
  customerCreate: {
    customer: { id: string } | null;
    userErrors: ShopifyUserError[];
  };
}

interface CustomerEmailMarketingConsentUpdateResponse {
  customerEmailMarketingConsentUpdate: {
    customer: { id: string } | null;
    userErrors: ShopifyUserError[];
  };
}

interface SubscribeResult {
  code: string;
  email: string;
  message: string;
}

function validateNewsletterConfig(): void {
  validateShopifyConfig();
}

async function adminGraphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(getAdminApiUrl('/graphql.json'), {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Shopify Admin API request failed [${response.status}]: ${errorText}`
    );
  }

  const json = (await response.json()) as AdminGraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || 'Unknown Shopify GraphQL error');
  }

  if (!json.data) {
    throw new Error('Shopify GraphQL response did not include data');
  }

  return json.data;
}

async function resolveParentDiscountIdByCode(code: string): Promise<string> {
  const query = `
    query ResolveCodeDiscounts($first: Int!, $after: String) {
      codeDiscountNodes(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 20) {
                nodes {
                  code
                }
              }
            }
            ... on DiscountCodeFreeShipping {
              title
              codes(first: 20) {
                nodes {
                  code
                }
              }
            }
            ... on DiscountCodeBxgy {
              title
              codes(first: 20) {
                nodes {
                  code
                }
              }
            }
          }
        }
      }
    }
  `;

  let after: string | null = null;

  while (true) {
    const data: ResolveCodeDiscountsResponse = await adminGraphqlFetch<ResolveCodeDiscountsResponse>(query, {
      first: DISCOUNT_SEARCH_PAGE_SIZE,
      after,
    });

    const match = data.codeDiscountNodes.nodes.find((node) =>
      node.codeDiscount?.codes?.nodes?.some(
        (discountCode) => discountCode.code.toUpperCase() === code.toUpperCase()
      )
    );

    if (match) {
      return match.id;
    }

    if (!data.codeDiscountNodes.pageInfo.hasNextPage) {
      break;
    }

    after = data.codeDiscountNodes.pageInfo.endCursor;
  }

  throw new Error(
    `Unable to find a Shopify code discount matching parent code "${code}".`
  );
}

async function upsertCustomerByEmail(email: string): Promise<{
  customerId: string;
  created: boolean;
}> {
  const existingCustomer = await createCustomerWithMarketingConsent(email);
  if (existingCustomer.created && existingCustomer.customerId) {
    return {
      customerId: existingCustomer.customerId,
      created: true,
    };
  }

  const mutation = `
    mutation UpsertNewsletterCustomer($identifier: CustomerSetIdentifiers, $input: CustomerSetInput!) {
      customerSet(identifier: $identifier, input: $input) {
        customer {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data: CustomerSetResponse = await adminGraphqlFetch<CustomerSetResponse>(mutation, {
    identifier: {
      email,
    },
    input: {
      email,
    },
  });

  const userErrors = data.customerSet.userErrors;
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((error) => error.message).join('; '));
  }

  const customerId = data.customerSet.customer?.id;
  if (!customerId) {
    throw new Error('Shopify did not return a customer ID while upserting newsletter signup');
  }

  return {
    customerId,
    created: false,
  };
}

function safeConsentTimestamp(): string {
  // Send 10s in the past to avoid clock-skew rejection from Shopify ("must not be in the future")
  return new Date(Date.now() - 10_000).toISOString();
}

async function createCustomerWithMarketingConsent(email: string): Promise<{
  created: boolean;
  customerId?: string;
}> {
  const mutation = `
    mutation CreateNewsletterCustomer($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data: CustomerCreateResponse = await adminGraphqlFetch<CustomerCreateResponse>(mutation, {
    input: {
      email,
      emailMarketingConsent: {
        marketingState: 'SUBSCRIBED',
        marketingOptInLevel: 'SINGLE_OPT_IN',
        consentUpdatedAt: safeConsentTimestamp(),
      },
    },
  });

  const userErrors = data.customerCreate.userErrors;
  if (userErrors.length > 0) {
    const duplicateEmailError = userErrors.find((error) =>
      /taken|exists|already/i.test(error.message)
    );

    if (duplicateEmailError) {
      return { created: false };
    }

    throw new Error(userErrors.map((error) => error.message).join('; '));
  }

  const customerId = data.customerCreate.customer?.id;
  if (!customerId) {
    throw new Error('Shopify did not return a customer ID for newsletter signup');
  }

  return {
    created: true,
    customerId,
  };
}

async function updateCustomerMarketingConsent(customerId: string): Promise<void> {
  const mutation = `
    mutation UpdateNewsletterConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
      customerEmailMarketingConsentUpdate(input: $input) {
        customer {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data: CustomerEmailMarketingConsentUpdateResponse =
    await adminGraphqlFetch<CustomerEmailMarketingConsentUpdateResponse>(mutation, {
    input: {
      customerId,
      emailMarketingConsent: {
        marketingState: 'SUBSCRIBED',
        marketingOptInLevel: 'SINGLE_OPT_IN',
        consentUpdatedAt: safeConsentTimestamp(),
      },
    },
  });

  const userErrors = data.customerEmailMarketingConsentUpdate.userErrors;
  if (userErrors.length > 0) {
    throw new Error(userErrors.map((error) => error.message).join('; '));
  }
}

export async function subscribeEmailToNewsletter(email: string): Promise<SubscribeResult> {
  validateNewsletterConfig();

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Email is required');
  }

  await resolveParentDiscountIdByCode(NEWSLETTER_PARENT_CODE);
  const customerSignup = await upsertCustomerByEmail(normalizedEmail);
  await updateCustomerMarketingConsent(customerSignup.customerId);

  return {
    code: NEWSLETTER_PARENT_CODE,
    email: normalizedEmail,
    message: customerSignup.created
      ? 'You are subscribed. Your 10% code is ready.'
      : 'Your 10% code is ready.',
  };
}
