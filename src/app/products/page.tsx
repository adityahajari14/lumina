import { redirect } from "next/navigation";
import { getBlackoutProduct } from "@/lib/blackout-product";
import { getProductPath } from "@/lib/product-routes";

export const revalidate = 3_600;

export default async function Page() {
  const product = await getBlackoutProduct();
  redirect(getProductPath(product.slug));
}
