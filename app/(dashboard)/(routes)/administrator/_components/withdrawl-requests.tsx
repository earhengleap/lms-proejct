// app/(dashboard)/(routes)/administrator/_components/withdrawal-requests.tsx

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  QrCode,
  Loader2,
  AlertCircle,
  Eye,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  publisher: {
    name: string | null;
    imageUrl?: string | null;
  };
  bankAccount: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    qrCodeUrl: string | null;
  };
}

interface WithdrawalRequestsProps {
  initialRequests: WithdrawalRequest[];
}

interface ImagePreviewProps {
  url: string | null;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImagePreview = ({ url, alt, isOpen, onClose }: ImagePreviewProps) => {
  if (!url) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-square w-full">
          <Image
            src={url}
            alt={alt}
            fill
            className="object-contain rounded-lg"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
export const WithdrawalRequests = ({
  initialRequests,
}: WithdrawalRequestsProps) => {
  const [requests, setRequests] =
    useState<WithdrawalRequest[]>(initialRequests);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{
    id: string;
    action: "approve" | "reject";
    amount: number;
  } | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawalRequest | null>(null);

  const [previewImage, setPreviewImage] = useState<{
    url: string | null;
    alt: string;
  } | null>(null);
  const router = useRouter();

  const handleAction = async (
    id: string,
    action: "approve" | "reject",
    amount: number
  ) => {
    try {
      setIsLoading(id);

      const response = await fetch("/api/admin/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ withdrawalId: id, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} withdrawal`);
      }

      // Update local state
      setRequests((prev) => prev.filter((req) => req.id !== id));

      toast.success(data.message || `Withdrawal ${action}ed successfully`);
      router.refresh();
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${action} withdrawal`
      );
    } finally {
      setIsLoading(null);
      setSelectedAction(null);
      setShowConfirmDialog(false);
    }
  };

  const RequestDetails = ({ request }: { request: WithdrawalRequest }) => (
    <div className="space-y-6">
      {/* Publisher Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Publisher Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-4">
            <div
              className="relative h-16 w-16 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                if (request.publisher.imageUrl) {
                  setPreviewImage({
                    url: request.publisher.imageUrl,
                    alt: request.publisher.name || "Publisher",
                  });
                }
              }}
            >
              {request.publisher.imageUrl ? (
                <Image
                  src={request.publisher.imageUrl}
                  alt={request.publisher.name || "Publisher"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">
                {request.publisher.name || "Unknown Publisher"}
              </p>
              <p className="text-sm text-muted-foreground">
                Requested on {format(new Date(request.createdAt), "PPP")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Bank Name</p>
              <p className="font-medium">{request.bankAccount.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Name</p>
              <p className="font-medium">{request.bankAccount.accountName}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-mono font-medium">
                {request.bankAccount.accountNumber}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      {request.bankAccount.qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div
              className="relative aspect-square w-48 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                setPreviewImage({
                  url: request.bankAccount.qrCodeUrl,
                  alt: "Bank QR Code",
                });
              }}
            >
              <Image
                src={request.bankAccount.qrCodeUrl}
                alt="Bank QR Code"
                fill
                className="object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity">
                <Eye className="h-8 w-8 text-gray-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amount Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Withdrawal Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(request.amount)}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-2 text-muted-foreground/50" />
        <p>No pending withdrawal requests</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex flex-col space-y-4 p-4 border rounded-lg hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-lg">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(request.amount)}
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Pending
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Publisher: {request.publisher.name || "Unknown"}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Bank: {request.bankAccount.bankName}
                  </p>
                  <span className="text-muted-foreground">•</span>
                  <p className="text-sm font-mono text-muted-foreground">
                    {request.bankAccount.accountNumber}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Requested: {format(new Date(request.createdAt), "PPP")}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-[100px] justify-center"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Withdrawal Request Details</SheetTitle>
                      <SheetDescription>
                        Review the details of this withdrawal request
                      </SheetDescription>
                    </SheetHeader>
                    {selectedRequest && (
                      <RequestDetails request={selectedRequest} />
                    )}
                    <SheetFooter className="mt-6">
                      <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedAction({
                        id: request.id,
                        action: "approve",
                        amount: request.amount,
                      });
                      setShowConfirmDialog(true);
                    }}
                    disabled={isLoading === request.id}
                    className="w-[100px] justify-center"
                  >
                    {isLoading === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedAction({
                        id: request.id,
                        action: "reject",
                        amount: request.amount,
                      });
                      setShowConfirmDialog(true);
                    }}
                    disabled={isLoading === request.id}
                    className="w-[100px] justify-center"
                  >
                    {isLoading === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Dialog */}
      <Dialog
        open={!!selectedQrCode}
        onOpenChange={() => setSelectedQrCode(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bank Account QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code for bank transfer details
            </DialogDescription>
          </DialogHeader>
          {selectedQrCode && (
            <div className="relative aspect-square w-full max-w-sm mx-auto">
              <Image
                src={selectedQrCode}
                alt="QR Code"
                fill
                className="object-contain rounded-lg"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={() => {
          setShowConfirmDialog(false);
          setSelectedAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAction?.action === "approve" ? "Approve" : "Reject"}{" "}
              Withdrawal
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedAction?.action} this withdrawal
              request for{" "}
              {selectedAction?.amount &&
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(selectedAction.amount)}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedAction) {
                  handleAction(
                    selectedAction.id,
                    selectedAction.action,
                    selectedAction.amount
                  );
                }
              }}
              className={cn(
                selectedAction?.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              {selectedAction?.action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ImagePreview
        url={previewImage?.url || null}
        alt={previewImage?.alt || ""}
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
};
