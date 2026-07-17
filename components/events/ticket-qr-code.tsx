"use client";

import { QRCodeSVG } from "qrcode.react";

type TicketQrCodeProps = {
  value: string | null;
  label: string;
};

export function TicketQrCode({ value, label }: TicketQrCodeProps) {
  if (!value) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border bg-muted p-4 text-center text-sm text-muted-foreground">
        QR unavailable
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <QRCodeSVG
        value={value}
        size={220}
        level="M"
        includeMargin
        title={label}
        className="h-auto w-full"
      />
    </div>
  );
}
