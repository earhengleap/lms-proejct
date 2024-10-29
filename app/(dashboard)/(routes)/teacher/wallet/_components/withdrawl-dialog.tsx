"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ArrowDownToLine,
  Plus,
  Loader2,
  X,
  Clock,
  Ban,
  BadgeDollarSign,
  History,
  QrCode,
  Pencil,
  Trash,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrCodeUrl: string | null;
}

interface PendingWithdrawal {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  bankAccount: BankAccount;
}

interface WithdrawalDialogProps {
  availableBalance: number;
  publisherId: string;
}

const WithdrawalDialog: React.FC<WithdrawalDialogProps> = ({
  availableBalance,
  publisherId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("withdraw");
  const [pendingWithdrawals, setPendingWithdrawals] = useState<
    PendingWithdrawal[]
  >([]);
  const [amountError, setAmountError] = useState<string>("");

  const [bankFormData, setBankFormData] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<PendingWithdrawal | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBankToDelete, setSelectedBankToDelete] =
    useState<BankAccount | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchBankAccounts = useCallback(async () => {
    try {
      const response = await fetch(`/api/bank-accounts/${publisherId}`);
      const data = await response.json();
      setBankAccounts(data);
      if (data.length > 0 && !selectedBankId) {
        setSelectedBankId(data[0].id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bank accounts",
        variant: "destructive",
      });
    }
  }, [publisherId, toast, selectedBankId]);

  const fetchPendingWithdrawals = useCallback(async () => {
    try {
      const response = await fetch(`/api/withdrawals/pending/${publisherId}`);
      if (!response.ok) throw new Error("Failed to fetch pending withdrawals");
      const data = await response.json();
      setPendingWithdrawals(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending withdrawals",
        variant: "destructive",
      });
    }
  }, [publisherId, toast]);

  useEffect(() => {
    if (open) {
      fetchBankAccounts();
      fetchPendingWithdrawals();
    }
  }, [open, fetchBankAccounts, fetchPendingWithdrawals]);

  const handleEditBankAccount = (account: BankAccount) => {
    setBankFormData({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
    });
    setQrCodeUrl(account.qrCodeUrl);
    setSelectedBankId(account.id);
    setIsEditMode(true);
    setShowBankForm(true);
  };

  const handleDeleteBankAccount = (account: BankAccount) => {
    setSelectedBankToDelete(account);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBankAccount = async () => {
    if (!selectedBankToDelete) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/bank-accounts/${publisherId}/${selectedBankToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete bank account");
      }

      // Remove the deleted account from state
      setBankAccounts(
        bankAccounts.filter((acc) => acc.id !== selectedBankToDelete.id)
      );
      if (selectedBankId === selectedBankToDelete.id) {
        setSelectedBankId(bankAccounts[0]?.id || "");
      }

      toast({
        title: "Success",
        description: "Bank account deleted successfully",
      });

      setShowDeleteDialog(false);
      setSelectedBankToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete bank account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetBankForm = () => {
    setShowBankForm(false);
    setIsEditMode(false);
    setBankFormData({
      bankName: "",
      accountName: "",
      accountNumber: "",
    });
    setQrCodeUrl(null);
  };
  const handleBankAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isEditMode
        ? `/api/bank-accounts/${publisherId}/${selectedBankId}` // Updated URL structure
        : "/api/bank-accounts";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bankFormData,
          publisherId,
          qrCodeUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${isEditMode ? "update" : "save"} bank account`
        );
      }

      const updatedAccount = await response.json();

      if (isEditMode) {
        setBankAccounts(
          bankAccounts.map((acc) =>
            acc.id === selectedBankId ? updatedAccount : acc
          )
        );
      } else {
        setBankAccounts([...bankAccounts, updatedAccount]);
        setSelectedBankId(updatedAccount.id);
      }

      resetBankForm();
      toast({
        title: "Success",
        description: `Bank account ${isEditMode ? "updated" : "added"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditMode ? "update" : "save"} bank account`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const selectedBank = bankAccounts.find(
        (bank) => bank.id === selectedBankId
      );
      if (!selectedBank) throw new Error("Please select a bank account");

      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          publisherId,
          bankAccountId: selectedBankId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to submit withdrawal request"
        );
      }

      const data = await response.json();
      if (data.success) {
        await fetchPendingWithdrawals();
        setActiveTab("pending");
        setAmount("");
        toast({
          title: "Success",
          description: "Withdrawal request submitted successfully",
        });
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Withdrawal request failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelWithdrawal = async (withdrawalId: string) => {
    try {
      setCancelingId(withdrawalId);
      const response = await fetch(`/api/withdrawals/${withdrawalId}/cancel`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel withdrawal request");
      }

      setPendingWithdrawals((prev) =>
        prev.filter((withdrawal) => withdrawal.id !== withdrawalId)
      );

      toast({
        title: "Success",
        description: "Withdrawal request cancelled successfully",
      });

      setShowCancelDialog(false);
      setSelectedWithdrawal(null);
      await fetchPendingWithdrawals();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to cancel withdrawal request",
        variant: "destructive",
      });
    } finally {
      setCancelingId(null);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

    const numValue = parseFloat(value);
    if (numValue > availableBalance) {
      setAmountError(
        `Amount exceeds available balance of ${formatCurrency(availableBalance)}`
      );
    } else if (numValue <= 0) {
      setAmountError("Amount must be greater than 0");
    } else {
      setAmountError("");
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

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
    setBankFormData({
      ...bankFormData,
      accountNumber: formattedValue,
    });
  };

  const renderBankForm = () => (
    <form onSubmit={handleBankAccountSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Input
          id="bankName"
          value={bankFormData.bankName}
          onChange={(e) =>
            setBankFormData({ ...bankFormData, bankName: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountName">Account Holder Name</Label>
        <Input
          id="accountName"
          value={bankFormData.accountName}
          onChange={(e) =>
            setBankFormData({ ...bankFormData, accountName: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          value={bankFormData.accountNumber}
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

      <DialogFooter>
        <Button type="button" variant="outline" onClick={resetBankForm}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEditMode ? "Updating..." : "Saving..."}
            </>
          ) : isEditMode ? (
            "Update Bank Account"
          ) : (
            "Save Bank Account"
          )}
        </Button>
      </DialogFooter>
    </form>
  );

  const renderWithdrawalForm = () => (
    <form onSubmit={handleWithdrawal} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bankAccount">Select Bank Account</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Select value={selectedBankId} onValueChange={setSelectedBankId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a bank account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.length === 0 ? (
                  <SelectItem value="no-accounts" disabled>
                    No bank accounts available
                  </SelectItem>
                ) : (
                  bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex flex-col">
                        <span>{account.bankName}</span>
                        <span className="text-sm text-muted-foreground">
                          {account.accountNumber}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {selectedBankId && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const account = bankAccounts.find(
                    (acc) => acc.id === selectedBankId
                  );
                  if (account) handleEditBankAccount(account);
                }}
                className="px-3"
                title="Edit Bank Account"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const account = bankAccounts.find(
                    (acc) => acc.id === selectedBankId
                  );
                  if (account) handleDeleteBankAccount(account);
                }}
                className="px-3 text-red-500 hover:text-red-600"
                title="Delete Bank Account"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditMode(false);
              setBankFormData({
                bankName: "",
                accountName: "",
                accountNumber: "",
              });
              setQrCodeUrl(null);
              setShowBankForm(true);
            }}
            className="px-3"
            title="Add New Bank Account"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">
          Amount ({formatCurrency(availableBalance)} available)
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          max={availableBalance}
          value={amount}
          onChange={handleAmountChange}
          className={amountError ? "border-red-500" : ""}
          required
        />
        {amountError && (
          <p className="text-sm text-red-500 mt-1">{amountError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter an amount between $0.01 and {formatCurrency(availableBalance)}
        </p>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOpen(false);
            setAmount("");
            setAmountError("");
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isLoading ||
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > availableBalance ||
            !selectedBankId ||
            !!amountError
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Withdraw"
          )}
        </Button>
      </DialogFooter>
    </form>
  );

  const renderPendingWithdrawals = () => (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {pendingWithdrawals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <History className="h-12 w-12 mb-2 text-muted-foreground/50" />
          <p>No pending withdrawal requests</p>
        </div>
      ) : (
        pendingWithdrawals.map((withdrawal) => (
          <Card
            key={withdrawal.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {formatCurrency(withdrawal.amount)}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-700"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Bank: {withdrawal.bankAccount.bankName}</p>
                  <p>Account: {withdrawal.bankAccount.accountNumber}</p>
                  <p className="text-xs mt-1">
                    Requested: {format(new Date(withdrawal.createdAt), "PPP")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {withdrawal.bankAccount.qrCodeUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedQrCode(withdrawal.bankAccount.qrCodeUrl)
                    }
                    className="justify-start"
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    View QR
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => showCancelConfirmation(withdrawal)}
                  disabled={!!cancelingId}
                  className="justify-start"
                >
                  {cancelingId === withdrawal.id ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4 mr-1" />
                  )}
                  Cancel Request
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  const showCancelConfirmation = (withdrawal: PendingWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowCancelDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Withdraw Funds
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Available balance: {formatCurrency(availableBalance)}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="withdraw">
                <BadgeDollarSign className="h-4 w-4 mr-2" />
                New Withdrawal
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                <Clock className="h-4 w-4 mr-2" />
                Pending
                {pendingWithdrawals.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 ml-2 bg-red-500 text-white"
                  >
                    {pendingWithdrawals.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="withdraw">
              {showBankForm ? renderBankForm() : renderWithdrawalForm()}
            </TabsContent>

            <TabsContent value="pending">
              {renderPendingWithdrawals()}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* QR Code Preview Dialog */}
      <Dialog
        open={!!selectedQrCode}
        onOpenChange={() => setSelectedQrCode(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bank Account QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to proceed with the bank transfer
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Withdrawal Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this withdrawal request for{" "}
              {selectedWithdrawal
                ? formatCurrency(selectedWithdrawal.amount)
                : "$0.00"}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowCancelDialog(false);
                setSelectedWithdrawal(null);
              }}
            >
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedWithdrawal) {
                  handleCancelWithdrawal(selectedWithdrawal.id);
                }
              }}
            >
              Yes, cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Bank Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bank account?
              <div className="mt-2 p-2 bg-muted rounded-lg">
                <p>
                  <strong>Bank:</strong> {selectedBankToDelete?.bankName}
                </p>
                <p>
                  <strong>Account:</strong>{" "}
                  {selectedBankToDelete?.accountNumber}
                </p>
              </div>
              <p className="mt-2 text-red-500">
                This action cannot be undone. Any pending withdrawals will need
                to be cancelled first.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedBankToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDeleteBankAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Bank Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WithdrawalDialog;
