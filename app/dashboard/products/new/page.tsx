import { NewProductForm } from "@/modules/products/views/NewProductView";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Product</h1>
        <p className="text-slate-500 text-sm mt-1">Upload product info or scan with AI OCR</p>
      </div>
      <NewProductForm />
    </div>
  );
}
