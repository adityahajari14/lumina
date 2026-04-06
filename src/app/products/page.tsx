import ProductPage from "../../components/product/ProductPage";
import { getBlackoutProduct } from "@/lib/blackout-product";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const product = await getBlackoutProduct();

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

export default async function Page() {
  const product = await getBlackoutProduct();
  return <ProductPage product={product} />;
}
