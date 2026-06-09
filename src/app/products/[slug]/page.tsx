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
    title: product.name,
    description: product.description,
    openGraph: {
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

  return <ProductPage product={product} initialReviewsData={initialReviewsData} />;
}
