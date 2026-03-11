import type { Route } from "next";
import Link from "next/link";
import Image from "next/image";

type PrintHeaderProps = {
  organizationName: string;
  logoUrl?: string | null;
  branchName: string;
  documentType: string;
  documentNumber: string;
};

export function PrintHeader({
  organizationName,
  logoUrl,
  branchName,
  documentType,
  documentNumber
}: PrintHeaderProps) {
  return (
    <div className="border-b border-ink/10 pb-6 print:border-black print:pb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <div className="relative h-16 w-24">
              <Image
                src={logoUrl}
                alt={organizationName}
                fill
                className="object-contain object-left"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-ink text-cloud">
              <span className="text-2xl font-bold">
                {organizationName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{organizationName}</h1>
            <p className="text-sm text-ink/60">{branchName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-ink/60">{documentType}</p>
          <p className="text-lg font-bold">{documentNumber}</p>
        </div>
      </div>
    </div>
  );
}

type PrintFooterProps = {
  showTimestamp?: boolean;
};

export function PrintFooter({ showTimestamp = true }: PrintFooterProps) {
  return (
    <div className="mt-8 border-t border-ink/10 pt-4 print:border-black">
      <div className="flex items-center justify-between text-xs text-ink/50">
        {showTimestamp && (
          <div>
            Impreso: {new Date().toLocaleString("es-MX", {
              dateStyle: "short",
              timeStyle: "short"
            })}
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-600 text-white font-bold text-xs">
            Z
          </div>
          <span className="font-medium">
            Powered by <strong>ZIII Solutions</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
