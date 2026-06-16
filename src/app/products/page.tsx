import { redirect } from "next/navigation";
import { BLACKOUT_PRODUCT_PATH } from "@/lib/product-routes";

export const revalidate = 3_600;

export default function Page() {
  redirect(BLACKOUT_PRODUCT_PATH);
}
