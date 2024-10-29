// lib/revenue-calculations.ts

export interface Purchase {
    amount: number;
    royaltyAmount: number;
    paymentStatus: string;
  }
  
  export interface Withdrawal {
    amount: number;
    status: string;
  }
  
  export const calculateRevenue = (
    purchases: Purchase[],
    withdrawals: Withdrawal[]
  ) => {
    // Get only completed purchases
    const completedPurchases = purchases.filter(p => p.paymentStatus === 'completed');
    const pendingPurchases = purchases.filter(p => p.paymentStatus === 'pending');
  
    // Calculate purchase-related amounts
    const totalRevenue = completedPurchases.reduce((sum, p) => sum + p.amount, 0);
    const royalty = completedPurchases.reduce((sum, p) => sum + p.royaltyAmount, 0);
    const instructorRevenue = totalRevenue - royalty;
  
    // Calculate pending amounts
    const pendingRevenue = pendingPurchases.reduce((sum, p) => sum + p.amount, 0);
    const pendingRoyalty = pendingPurchases.reduce((sum, p) => sum + p.royaltyAmount, 0);
  
    // Calculate withdrawal amounts
    const completedWithdrawals = withdrawals.filter(w => w.status === 'completed');
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
    
    const withdrawnRevenue = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  
    // Calculate balances
    const availableBalance = instructorRevenue - withdrawnRevenue - pendingWithdrawalAmount;
    const pendingBalance = pendingWithdrawalAmount + pendingRevenue - pendingRoyalty;
  
    return {
      totalRevenue,
      instructorRevenue,
      royalty,
      availableBalance,
      pendingBalance,
      withdrawnRevenue,
      pendingWithdrawalAmount,
    };
  };