"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, useTransition, type FormEvent } from "react";
import { Camera, Keyboard, Loader2, RotateCcw } from "lucide-react";
import type { IDetectedBarcode, IScannerError } from "@yudiel/react-qr-scanner";

import { verifyMembershipQrAction } from "@/features/membership/verification-actions";
import type { MembershipVerificationResult } from "@/types/membership";
import { MembershipVerificationResultPanel } from "@/components/membership/membership-verification-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  {
    ssr: false,
    loading: () => (
      <div className="grid aspect-[4/3] place-items-center rounded-xl border bg-muted text-sm text-muted-foreground">
        Loading camera...
      </div>
    ),
  },
);

export function MembershipVerificationScanner() {
  const [manualValue, setManualValue] = useState("");
  const [lastPayload, setLastPayload] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [result, setResult] = useState<MembershipVerificationResult | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const verifyPayload = useCallback(
    (payload: string) => {
      const trimmed = payload.trim();

      if (!trimmed || trimmed === lastPayload || isPending) {
        return;
      }

      setLastPayload(trimmed);
      setScannerError(null);

      startTransition(async () => {
        const verificationResult = await verifyMembershipQrAction(trimmed);
        setResult(verificationResult);
      });
    },
    [isPending, lastPayload],
  );

  function handleScan(codes: IDetectedBarcode[]) {
    const rawValue = codes[0]?.rawValue;

    if (rawValue) {
      verifyPayload(rawValue);
    }
  }

  function handleError(error: IScannerError) {
    setScannerError(
      error.message ||
        "Camera access is not available. Use manual entry instead.",
    );
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    verifyPayload(manualValue);
  }

  function resetScan() {
    setLastPayload(null);
    setResult(null);
    setScannerError(null);
    setManualValue("");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-xl border bg-card p-4 shadow-soft sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Camera scan</h2>
            <p className="text-sm text-muted-foreground">
              Scan membership QR codes only.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-black">
          <Scanner
            onScan={handleScan}
            onError={handleError}
            paused={isPending || Boolean(result)}
            allowMultiple={false}
            formats={["qr_code"]}
            constraints={{ facingMode: "environment" }}
            classNames={{
              container: "aspect-[4/3] w-full",
              video: "h-full w-full object-cover",
            }}
          />
        </div>

        {scannerError ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700" role="alert">
            {scannerError}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={resetScan}
            disabled={isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Scan another
          </Button>
          {isPending ? (
            <div className="inline-flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying membership...
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-5">
        <section className="rounded-xl border bg-card p-4 shadow-soft sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <Keyboard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Manual fallback</h2>
              <p className="text-sm text-muted-foreground">
                Enter a membership QR value if camera scanning is unavailable.
              </p>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="membership-qr">Membership QR value</Label>
              <Input
                id="membership-qr"
                value={manualValue}
                onChange={(event) => setManualValue(event.target.value)}
                placeholder="membership:..."
                autoComplete="off"
              />
            </div>
            <Button type="submit" disabled={isPending || !manualValue.trim()} aria-disabled={isPending || !manualValue.trim()}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {isPending ? "Verifying membership..." : "Verify membership"}
            </Button>
          </form>
        </section>

        <MembershipVerificationResultPanel result={result} />
      </div>
    </div>
  );
}
