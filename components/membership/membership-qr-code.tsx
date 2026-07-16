import { AlertTriangle, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import type { MembershipCardStatus } from "@/types/membership";
import { cn } from "@/lib/utils";

type MembershipQrCodeProps = {
  value: string | null;
  status: MembershipCardStatus | "missing" | "loading";
  label?: string;
  className?: string;
};

const statusMessages = {
  active: "Membership QR",
  expired: "Card expired",
  revoked: "Card revoked",
  missing: "Card unavailable",
  loading: "Loading card",
} satisfies Record<MembershipCardStatus | "missing" | "loading", string>;

function getUnavailableMessage(
  status: MembershipCardStatus | "missing" | "loading",
) {
  if (status === "loading") {
    return "Loading membership QR.";
  }

  if (status === "revoked") {
    return "This card has been revoked.";
  }

  if (status === "expired") {
    return "This card has expired.";
  }

  return "No active card is available.";
}

export function MembershipQrCode({
  value,
  status,
  label = "Membership QR code",
  className,
}: MembershipQrCodeProps) {
  const canRenderQr = status === "active" && Boolean(value);
  const qrValue = value ?? "";

  return (
    <div className={cn("rounded-lg bg-white p-3 text-primary shadow-sm", className)}>
      <div className="grid aspect-square place-items-center rounded-md border border-primary/10 bg-white">
        {canRenderQr ? (
          <QRCodeSVG
            value={qrValue}
            size={144}
            level="M"
            marginSize={2}
            title={label}
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md bg-muted/50 p-3 text-center">
            {status === "missing" || status === "loading" ? (
              <QrCode className="h-9 w-9 text-primary/40" aria-hidden="true" />
            ) : (
              <AlertTriangle
                className="h-9 w-9 text-amber-600"
                aria-hidden="true"
              />
            )}
            <p className="text-[11px] font-medium leading-4 text-primary/60">
              {getUnavailableMessage(status)}
            </p>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] font-medium text-primary/65">
        {statusMessages[status]}
      </p>
    </div>
  );
}
