import { BLACKOUT_PRODUCT_HANDLE, BLACKOUT_PRODUCT_PATH } from "@/lib/product-routes";
import { SITE_URL, serializeJsonLd } from "@/lib/seo";
import ProductPage from "@/components/product/ProductPage";
import { getBlackoutProduct } from "@/lib/blackout-product";
import { getProductReviewsData } from "@/lib/server/product-reviews";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

async function getProductForSlug(slug: string) {
  if (slug !== BLACKOUT_PRODUCT_HANDLE) notFound();
  const product = await getBlackoutProduct();

  if (product.slug !== slug) {
    notFound();
  }

  return product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductForSlug(slug);

  return {
    alternates: { canonical: BLACKOUT_PRODUCT_PATH },
    title: product.name,
    description: product.description,
    openGraph: {
      url: BLACKOUT_PRODUCT_PATH,
      title: product.name,
      description: product.description,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function Page({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductForSlug(slug);
  const initialReviewsData = await getProductReviewsData(product);

  const structuredData = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, description: product.description.replace(/<[^>]*>/g, ''),
    image: product.images.map(src => new URL(src, SITE_URL).href),
    url: `${SITE_URL}${BLACKOUT_PRODUCT_PATH}`,
    brand: { '@type': 'Brand', name: 'Lumina' },
    offers: { '@type': 'AggregateOffer', priceCurrency: product.currency, lowPrice: product.price,
      url: `${SITE_URL}${BLACKOUT_PRODUCT_PATH}` },
    ...(initialReviewsData.reviewCount > 0 ? { aggregateRating: {
      '@type': 'AggregateRating', ratingValue: initialReviewsData.averageRating,
      reviewCount: initialReviewsData.reviewCount,
    } } : {}),
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
    <ProductPage product={product} initialReviewsData={initialReviewsData} />
  </>;
}
