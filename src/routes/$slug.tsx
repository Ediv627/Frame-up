import { createFileRoute } from "@tanstack/react-router";
import { ProductPageContent } from "./shop.$slug";

export const Route = createFileRoute("/$slug")({
  component: ProductShortcutPage,
});

function ProductShortcutPage() {
  const { slug } = Route.useParams();
  return <ProductPageContent slug={slug} />;
}
