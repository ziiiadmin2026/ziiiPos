import { getBrandingConfig } from "@/lib/config/branding";
import { PrintHeader, PrintFooter } from "@/components/print/print-layout";

type SampleReceiptProps = {
  organizationId: string;
};

export async function SampleReceipt({ organizationId }: SampleReceiptProps) {
  const branding = await getBrandingConfig(organizationId);

  return (
    <div className="mx-auto max-w-[80mm] bg-white p-6 font-mono text-sm print:p-4">
      <PrintHeader
        organizationName={branding.name}
        logoUrl={branding.logoUrl}
        branchName="Sucursal Centro"
        documentType="Ticket de venta"
        documentNumber="#001234"
      />

      <div className="my-6 space-y-2">
        <div className="flex justify-between">
          <span>Mesa: 5</span>
          <span>Mesero: Juan P.</span>
        </div>
        <div className="flex justify-between">
          <span>Fecha:</span>
          <span>{new Date().toLocaleDateString("es-MX")}</span>
        </div>
      </div>

      <div className="border-y border-ink/10 py-4 print:border-black">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>2x Hamburguesa</span>
            <span>$438.00</span>
          </div>
          <div className="flex justify-between">
            <span>1x Refresco</span>
            <span>$45.00</span>
          </div>
        </div>

        <div className="mt-4 space-y-1 text-right">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>$483.00</span>
          </div>
          <div className="flex justify-between">
            <span>IVA (16%):</span>
            <span>$77.28</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>$560.28</span>
          </div>
        </div>
      </div>

      <PrintFooter />
    </div>
  );
}
