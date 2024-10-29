import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrCodeUrl?: string | null;
  publisherId: string;
}

interface EditBankDialogProps {
  bankAccount: BankAccount;
  onSuccess?: () => void;
}

const EditBankDialog = ({ bankAccount, onSuccess }: EditBankDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bankName: bankAccount.bankName,
    accountName: bankAccount.accountName,
    accountNumber: bankAccount.accountNumber,
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(
    bankAccount.qrCodeUrl || null
  );

  const formatAccountNumber = (value: string): string => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  const handleAccountNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\s/g, "");
    const formattedValue = formatAccountNumber(value);
    setFormData((prev) => ({
      ...prev,
      accountNumber: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/bank-accounts/${bankAccount.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          qrCodeUrl,
          publisherId: bankAccount.publisherId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bank account");
      }

      toast({
        title: "Success",
        description: "Bank account updated successfully",
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update bank account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bank Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bankName: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">Account Holder Name</Label>
            <Input
              id="accountName"
              value={formData.accountName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  accountName: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={handleAccountNumberChange}
              maxLength={23}
              placeholder="0000 0000 0000 0000"
              className="font-mono"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your 16-digit account number
            </p>
          </div>

          <div className="space-y-2">
            <Label>QR Code (Optional)</Label>
            {qrCodeUrl ? (
              <div className="relative w-40 h-40 mx-auto">
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  fill
                  className="object-contain rounded-lg"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200"
                  onClick={() => setQrCodeUrl(null)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <UploadDropzone
                endpoint="bankQrCode"
                onClientUploadComplete={(res) => {
                  setQrCodeUrl(res?.[0]?.url);
                  toast({
                    title: "Success",
                    description: "QR code uploaded successfully",
                  });
                }}
                onUploadError={(error: Error) => {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to upload QR code",
                    variant: "destructive",
                  });
                }}
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBankDialog;
