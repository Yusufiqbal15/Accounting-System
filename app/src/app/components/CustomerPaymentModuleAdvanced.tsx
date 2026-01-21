'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { CreditCard, Plus, Search, TrendingDown, Users, CheckCircle, AlertCircle, Clock, Download, Printer } from 'lucide-react';
import type { Customer } from '../types';
import { toast } from 'sonner';

interface PaymentAllocation {
  method: 'cash' | 'bank' | 'check' | 'pos' | 'credit';
  amount: number;
  reference?: string;
}

interface ScheduledPayment {
  id: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod?: string;
  paidDate?: string;
}

interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  allocations: PaymentAllocation[];
  date: string;
  reference: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed';
  approvedBy?: string;
  approvalTime?: string;
  journalEntryId?: string;
  invoice?: string;
}

interface CustomerBalance {
  customerId: string;
  customerName: string;
  totalSales: number;
  totalPaid: number;
  outstandingBalance: number;
  lastPaymentDate?: string;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue';
  paymentBreakdown?: {
    cash: number;
    bank: number;
    pos: number;
    check: number;
    credit: number;
  };
}

interface PaymentFormData {
  customerId: string;
  invoice: string;
  allocations: PaymentAllocation[];
  reference: string;
  notes: string;
  scheduledPayments: ScheduledPayment[];
}

interface OwnerApproval {
  approverName: string;
  approverEmail: string;
  approvalNotes: string;
}

interface CustomerPaymentModuleProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

export function CustomerPaymentModule({ customers, setCustomers }: CustomerPaymentModuleProps) {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('record');

  // Form State
  const [formData, setFormData] = useState<PaymentFormData>({
    customerId: '',
    invoice: '',
    allocations: [{ method: 'bank', amount: 0, reference: '' }],
    reference: '',
    notes: '',
    scheduledPayments: [],
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showOwnerApproval, setShowOwnerApproval] = useState(false);
  const [ownerApproval, setOwnerApproval] = useState<OwnerApproval>({
    approverName: '',
    approverEmail: '',
    approvalNotes: '',
  });
  const [selectedPaymentForApproval, setSelectedPaymentForApproval] = useState<Payment | null>(null);
  const [showDemoMode, setShowDemoMode] = useState(false);

  // Calculate customer balances
  const customerBalances = useMemo<CustomerBalance[]>(() => {
    return customers.map(customer => {
      const totalSales = customer.totalSales || 0;
      const totalPaid = payments
        .filter(p => p.customerId === customer.id && p.status === 'completed')
        .reduce((sum: number, p) => sum + p.totalAmount, 0);
      const outstandingBalance = Math.max(0, totalSales - totalPaid);

      // Breakdown by method
      const paymentBreakdown = {
        cash: 0,
        bank: 0,
        pos: 0,
        check: 0,
        credit: 0,
      };

      payments
        .filter(p => p.customerId === customer.id && p.status === 'completed')
        .forEach(p => {
          p.allocations.forEach(alloc => {
            if (alloc.method in paymentBreakdown) {
              paymentBreakdown[alloc.method as keyof typeof paymentBreakdown] += alloc.amount;
            }
          });
        });

      let paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue' = 'pending';
      if (outstandingBalance === 0 && totalSales > 0) paymentStatus = 'paid';
      else if (outstandingBalance > 0 && totalPaid > 0) paymentStatus = 'partial';
      else if (outstandingBalance > 0) paymentStatus = 'pending';

      const lastPayment = payments
        .filter(p => p.customerId === customer.id && p.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      return {
        customerId: customer.id,
        customerName: customer.name,
        totalSales,
        totalPaid,
        outstandingBalance,
        lastPaymentDate: lastPayment?.date,
        paymentStatus,
        paymentBreakdown,
      };
    });
  }, [customers, payments]);

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const selectedCustomerBalance = customerBalances.find(b => b.customerId === formData.customerId);
  const totalAllocationAmount = formData.allocations.reduce((sum, a) => sum + a.amount, 0);

  // Handle allocation change
  const handleAllocationChange = (index: number, field: string, value: any) => {
    const newAllocations = [...formData.allocations];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    setFormData({ ...formData, allocations: newAllocations });
  };

  // Add allocation
  const addAllocation = () => {
    setFormData({
      ...formData,
      allocations: [...formData.allocations, { method: 'bank', amount: 0, reference: '' }],
    });
  };

  // Remove allocation
  const removeAllocation = (index: number) => {
    if (formData.allocations.length > 1) {
      const newAllocations = formData.allocations.filter((_, i) => i !== index);
      setFormData({ ...formData, allocations: newAllocations });
    }
  };

  // Handle scheduled payment
  const addScheduledPayment = (dueDate: string, amount: number) => {
    if (!dueDate || amount <= 0) {
      toast.error('Invalid scheduled payment');
      return;
    }
    const newScheduled: ScheduledPayment = {
      id: `SCHED-${Date.now()}`,
      dueDate,
      amount,
      status: 'pending',
    };
    setFormData({
      ...formData,
      scheduledPayments: [...formData.scheduledPayments, newScheduled],
    });
    toast.success('Scheduled payment added');
  };

  // Remove scheduled payment
  const removeScheduledPayment = (id: string) => {
    setFormData({
      ...formData,
      scheduledPayments: formData.scheduledPayments.filter(sp => sp.id !== id),
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return false;
    }
    if (totalAllocationAmount <= 0) {
      toast.error('Total payment amount must be greater than 0');
      return false;
    }
    if (!selectedCustomerBalance || totalAllocationAmount > selectedCustomerBalance.outstandingBalance + 5000) {
      toast.warning('Payment exceeds outstanding balance by significant amount');
    }
    return true;
  };

  // Prepare for owner approval
  const handleSubmitForApproval = () => {
    if (!validateForm()) return;

    const tempPayment: Payment = {
      id: `PAY-${Date.now()}`,
      customerId: formData.customerId,
      customerName: selectedCustomer?.name || '',
      totalAmount: totalAllocationAmount,
      allocations: formData.allocations,
      date: new Date().toISOString().split('T')[0],
      reference: formData.reference,
      notes: formData.notes,
      status: 'pending',
      invoice: formData.invoice,
    };

    setSelectedPaymentForApproval(tempPayment);
    setShowOwnerApproval(true);
  };

  // Owner approves payment
  const handleOwnerApproval = () => {
    if (!ownerApproval.approverName || !ownerApproval.approverEmail) {
      toast.error('Please fill in approver details');
      return;
    }

    if (selectedPaymentForApproval) {
      const approvedPayment: Payment = {
        ...selectedPaymentForApproval,
        status: 'confirmed',
        approvedBy: ownerApproval.approverName,
        approvalTime: new Date().toISOString(),
      };

      setPayments([...payments, approvedPayment]);
      setPaymentHistory([
        ...paymentHistory,
        {
          paymentId: approvedPayment.id,
          event: 'Payment Approved',
          timestamp: new Date().toISOString(),
          details: `${ownerApproval.approverName} approved payment of ${totalAllocationAmount}`,
          approvalNotes: ownerApproval.approvalNotes,
        },
      ]);

      toast.success('Payment Approved', {
        description: `${selectedCustomer?.name} - ${totalAllocationAmount.toLocaleString()}`,
      });

      // Reset form
      setFormData({
        customerId: '',
        invoice: '',
        allocations: [{ method: 'bank', amount: 0, reference: '' }],
        reference: '',
        notes: '',
        scheduledPayments: [],
      });
      setOwnerApproval({ approverName: '', approverEmail: '', approvalNotes: '' });
      setShowOwnerApproval(false);
      setIsDialogOpen(false);
    }
  };

  // Complete payment (after approval)
  const completePayment = (paymentId: string) => {
    const updatedPayments = payments.map(p =>
      p.id === paymentId ? { ...p, status: 'completed' as const } : p
    );
    setPayments(updatedPayments);
    setPaymentHistory([
      ...paymentHistory,
      {
        paymentId,
        event: 'Payment Completed',
        timestamp: new Date().toISOString(),
        details: 'Payment transaction finalized',
      },
    ]);
    toast.success('Payment Completed');
  };

  // Demo mode - auto-record cash payment
  const handleDemoPayment = (amount: number) => {
    if (!validateForm()) return;

    const demoPayment: Payment = {
      id: `DEMO-${Date.now()}`,
      customerId: formData.customerId,
      customerName: selectedCustomer?.name || '',
      totalAmount: amount,
      allocations: [{ method: 'cash', amount, reference: 'DEMO-MODE' }],
      date: new Date().toISOString().split('T')[0],
      reference: 'Demo Payment',
      notes: 'Demo mode - Cash payment received',
      status: 'completed',
      approvedBy: 'Demo Admin',
      approvalTime: new Date().toISOString(),
    };

    setPayments([...payments, demoPayment]);
    toast.success('Demo Payment Recorded', {
      description: `${selectedCustomer?.name} - ${amount.toLocaleString()} (CASH)`,
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'confirmed':
        return 'bg-blue-50 border-blue-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredBalances = useMemo(() => {
    return customerBalances.filter(balance => {
      const matchesSearch = balance.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || balance.paymentStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [customerBalances, searchTerm, filterStatus]);

  const totalOutstanding = filteredBalances.reduce((sum, b) => sum + b.outstandingBalance, 0);
  const totalCollected = filteredBalances.reduce((sum, b) => sum + b.totalPaid, 0);
  
  // Calculate payment method breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const breakdown = {
      cash: 0,
      bank: 0,
      pos: 0,
      check: 0,
      credit: 0
    };
    payments.filter(p => p.status === 'completed').forEach(payment => {
      payment.allocations.forEach(alloc => {
        breakdown[alloc.method as keyof typeof breakdown] += alloc.amount;
      });
    });
    return breakdown;
  }, [payments]);
  
  // Calculate pending approvals count and amount
  const pendingApprovals = useMemo(() => {
    return payments.filter(p => p.status === 'pending');
  }, [payments]);
  
  const totalPendingAmount = useMemo(() => {
    return pendingApprovals.reduce((sum, p) => sum + p.totalAmount, 0);
  }, [pendingApprovals]);
  
  // Calculate client credit data
  const clientCreditData = useMemo(() => {
    return customerBalances
      .filter(c => c.outstandingBalance > 0)
      .sort((a, b) => b.outstandingBalance - a.outstandingBalance);
  }, [customerBalances]);

  return (
    <div className="flex-1 flex flex-col h-full p-6 gap-6 bg-background overflow-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">{t('nav.customerPayment')}</h1>
        </div>
        <p className="text-gray-600">
          Professional payment management system with multi-step processing, approval workflow, and detailed tracking
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-gray-200">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-gray-200">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Outstanding Receivables</p>
            <p className="text-2xl font-bold text-red-600">{totalOutstanding.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-gray-200">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">{totalCollected.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-gray-200">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Collection Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {((totalCollected / (totalCollected + totalOutstanding)) * 100 || 0).toFixed(1)}%
            </p>
          </div>
        </Card>
      </div>

      {/* Enhanced Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Method Breakdown */}
        <Card className="p-4 border-2 border-blue-200 bg-blue-50">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            💵 Payment Method Breakdown (Completed Payments)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-white rounded border border-blue-200">
              <span className="font-medium">💳 POS/Card Payments</span>
              <span className="font-bold text-lg text-blue-600">{paymentMethodBreakdown.pos.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
              <span className="font-medium">💰 Cash Payments</span>
              <span className="font-bold text-lg text-green-600">{paymentMethodBreakdown.cash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-purple-200">
              <span className="font-medium">🏦 Bank Transfers</span>
              <span className="font-bold text-lg text-purple-600">{paymentMethodBreakdown.bank.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-yellow-200">
              <span className="font-medium">📋 Cheques</span>
              <span className="font-bold text-lg text-yellow-600">{paymentMethodBreakdown.check.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-red-200">
              <span className="font-medium">📝 Credit/Other</span>
              <span className="font-bold text-lg text-red-600">{paymentMethodBreakdown.credit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-100 rounded border-2 border-blue-400 mt-2">
              <span className="font-bold">TOTAL COLLECTED</span>
              <span className="font-bold text-xl text-blue-600">{totalCollected.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Pending Approvals & Submissions Status */}
        <Card className="p-4 border-2 border-yellow-200 bg-yellow-50">
          <h3 className="text-lg font-bold text-yellow-900 mb-4 flex items-center gap-2">
            ⏳ Payment Status Tracking
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-white rounded border border-yellow-200">
              <span className="font-medium">🟡 Pending Owner Approval</span>
              <span className="font-bold text-lg text-yellow-600">{pendingApprovals.length} payments</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-yellow-200">
              <span className="font-medium">💰 Pending Amount to Approve</span>
              <span className="font-bold text-lg text-red-600">{totalPendingAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
              <span className="font-medium">🟢 Approved & Submitted</span>
              <span className="font-bold text-lg text-green-600">
                {payments.filter(p => p.status === 'confirmed' || p.status === 'completed').length} payments
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
              <span className="font-medium">✅ Fully Completed</span>
              <span className="font-bold text-lg text-green-600">{payments.filter(p => p.status === 'completed').length} payments</span>
            </div>
            {pendingApprovals.length > 0 && (
              <div className="p-2 bg-red-50 rounded border-2 border-red-300 mt-2">
                <p className="text-sm font-bold text-red-700">
                  ⚠️ ACTION REQUIRED: {pendingApprovals.length} payment(s) awaiting shop owner approval
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Client Credit Tracking */}
      {clientCreditData.length > 0 && (
        <Card className="p-4 border-2 border-red-200 bg-red-50">
          <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
            👥 Clients with Outstanding Credit
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clientCreditData.map((client, idx) => (
              <div key={client.customerId} className="p-3 bg-white rounded border border-red-200 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">{idx + 1}. {client.customerName}</span>
                  <Badge className="bg-red-600">Outstanding</Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales:</span>
                    <span className="font-medium">{client.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Already Paid:</span>
                    <span className="font-medium text-green-600">{client.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="font-semibold text-red-700">Still Due:</span>
                    <span className="font-bold text-lg text-red-600">{client.outstandingBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="record">Record Payment</TabsTrigger>
          <TabsTrigger value="balances">Customer Balances</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
        </TabsList>

        {/* Record Payment Tab */}
        <TabsContent value="record" className="space-y-4 mt-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Payment
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Customer Payment</DialogTitle>
                <DialogDescription>
                  Complete professional payment processing with approval workflow
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Customer Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Select Customer *</label>
                    <Select value={formData.customerId} onValueChange={(val) => setFormData({ ...formData, customerId: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => {
                          const balance = customerBalances.find(b => b.customerId === customer.id);
                          return (
                            <SelectItem key={customer.id} value={customer.id}>
                              <div className="flex gap-2">
                                <span>{customer.name}</span>
                                <span className="text-xs text-gray-500">
                                  Outstanding: {balance?.outstandingBalance.toLocaleString() || 0}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Invoice/Reference</label>
                    <Input
                      placeholder="Invoice number or reference"
                      value={formData.invoice}
                      onChange={(e) => setFormData({ ...formData, invoice: e.target.value })}
                    />
                  </div>
                </div>

                {/* Customer Balance Summary */}
                {selectedCustomerBalance && (
                  <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
                    <p className="text-xs font-bold text-blue-900 mb-3">📊 CUSTOMER BALANCE & PAYMENT IMPACT</p>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 font-semibold">TOTAL SALES</p>
                        <p className="text-base font-bold text-gray-900">{selectedCustomerBalance.totalSales.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-green-200">
                        <p className="text-xs text-gray-600 font-semibold">ALREADY PAID</p>
                        <p className="text-base font-bold text-green-600">{selectedCustomerBalance.totalPaid.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-red-200">
                        <p className="text-xs text-gray-600 font-semibold">CURRENTLY DUE</p>
                        <p className="text-base font-bold text-red-600">{selectedCustomerBalance.outstandingBalance.toLocaleString()}</p>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded border border-yellow-300">
                        <p className="text-xs text-yellow-700 font-semibold">PAYING NOW</p>
                        <p className="text-base font-bold text-yellow-600">{totalAllocationAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded border-2 border-blue-400">
                        <p className="text-xs text-blue-900 font-bold">WILL BE DUE</p>
                        <p className="text-base font-bold text-blue-700">
                          {(selectedCustomerBalance.outstandingBalance - totalAllocationAmount > 0 
                            ? selectedCustomerBalance.outstandingBalance - totalAllocationAmount 
                            : 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-blue-200">
                      <div className="flex justify-between text-xs text-blue-900">
                        <span>
                          <strong>Status After Payment:</strong> {
                            totalAllocationAmount === 0 ? '❓ Enter amount' :
                            (selectedCustomerBalance.outstandingBalance - totalAllocationAmount) === 0 ? '✅ FULLY PAID' :
                            (selectedCustomerBalance.outstandingBalance - totalAllocationAmount) > 0 ? '⚠️ PARTIALLY PAID' :
                            'ℹ️ OVERPAYMENT'
                          }
                        </span>
                        <span>
                          <strong>Payment Methods Used:</strong> {
                            formData.allocations.length > 0 
                              ? formData.allocations.map(a => a.method).join(', ')
                              : 'None selected'
                          }
                        </span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Payment Allocations */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700">Payment Methods *</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAllocation}
                      className="text-xs"
                    >
                      + Add Method
                    </Button>
                  </div>

                  {formData.allocations.map((alloc, idx) => (
                    <div key={idx} className="p-3 border border-gray-200 rounded-lg space-y-2 bg-gray-50">
                      <div className="grid grid-cols-3 gap-2">
                        <Select value={alloc.method} onValueChange={(val) => handleAllocationChange(idx, 'method', val)}>
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">💵 Cash</SelectItem>
                            <SelectItem value="bank">🏦 Bank Transfer</SelectItem>
                            <SelectItem value="check">📋 Check</SelectItem>
                            <SelectItem value="pos">💳 Card/POS</SelectItem>
                            <SelectItem value="credit">📝 Credit</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          placeholder="Amount"
                          value={alloc.amount || ''}
                          onChange={(e) => handleAllocationChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />

                        {formData.allocations.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAllocation(idx)}
                            className="text-xs"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <Input
                        placeholder="Reference (e.g., transaction ID, check number)"
                        value={alloc.reference || ''}
                        onChange={(e) => handleAllocationChange(idx, 'reference', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  ))}

                  <div className="p-3 bg-gray-100 rounded-lg flex justify-between items-center">
                    <span className="font-semibold">Total Payment Amount:</span>
                    <span className="text-lg font-bold text-green-600">{totalAllocationAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Scheduled Payments */}
                <div className="space-y-2 pt-2 border-t">
                  <label className="text-sm font-semibold text-gray-700">Schedule Remaining Payment?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      id="scheduleDate"
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Scheduled amount"
                      id="scheduleAmount"
                      className="text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const date = (document.getElementById('scheduleDate') as HTMLInputElement)?.value;
                      const amount = parseFloat((document.getElementById('scheduleAmount') as HTMLInputElement)?.value || '0');
                      if (date && amount > 0) {
                        addScheduledPayment(date, amount);
                        (document.getElementById('scheduleDate') as HTMLInputElement).value = '';
                        (document.getElementById('scheduleAmount') as HTMLInputElement).value = '';
                      }
                    }}
                    className="w-full text-xs"
                  >
                    Add Scheduled Payment
                  </Button>
                </div>

                {/* Scheduled Payments List */}
                {formData.scheduledPayments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Scheduled Payments:</p>
                    {formData.scheduledPayments.map(sp => (
                      <div key={sp.id} className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-200 text-sm">
                        <span>
                          {new Date(sp.dueDate).toLocaleDateString()} - {sp.amount.toLocaleString()}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeScheduledPayment(sp.id)}
                          className="text-xs h-6"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Additional Notes</label>
                  <Input
                    placeholder="Internal notes for reference..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitForApproval}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Submit for Approval
                  </Button>
                  <Button
                    onClick={() => setShowDemoMode(!showDemoMode)}
                    variant="outline"
                    className="text-orange-600"
                  >
                    Demo Mode
                  </Button>
                </div>

                {/* Demo Mode Options */}
                {showDemoMode && selectedCustomerBalance && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded space-y-2">
                    <p className="text-sm font-semibold text-orange-900">Demo Mode - Quick Cash Payment</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleDemoPayment(5000)}
                        className="flex-1 text-xs bg-orange-600 hover:bg-orange-700"
                      >
                        💵 5,000
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleDemoPayment(10000)}
                        className="flex-1 text-xs bg-orange-600 hover:bg-orange-700"
                      >
                        💵 10,000
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleDemoPayment(selectedCustomerBalance.outstandingBalance)}
                        className="flex-1 text-xs bg-orange-600 hover:bg-orange-700"
                      >
                        Full Balance
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Pending Payments List */}
          {payments.filter(p => p.status !== 'completed').length > 0 && (
            <Card className="p-4 border border-gray-200">
              <h3 className="font-semibold mb-3">Pending Approvals</h3>
              <div className="space-y-2">
                {payments.filter(p => p.status !== 'completed').map(payment => (
                  <div key={payment.id} className={`p-3 rounded-lg border ${getPaymentStatusColor(payment.status)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{payment.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {payment.totalAmount.toLocaleString()} - {payment.allocations.map(a => a.method).join(', ')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <Badge className={payment.status === 'confirmed' ? 'bg-blue-600' : 'bg-yellow-600'}>
                        {payment.status.toUpperCase()}
                      </Badge>
                      {payment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => completePayment(payment.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Customer Balances Tab */}
        <TabsContent value="balances" className="space-y-4 mt-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600">Search Customer</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-40">
              <label className="text-sm font-medium text-gray-600">Filter Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700">Customer Name</TableHead>
                    <TableHead className="text-right text-gray-700">Total Sales</TableHead>
                    <TableHead className="text-right text-gray-700">Total Paid</TableHead>
                    <TableHead className="text-right text-gray-700">Outstanding</TableHead>
                    <TableHead className="text-center text-gray-700">Status</TableHead>
                    <TableHead className="text-gray-700">Payment Methods</TableHead>
                    <TableHead className="text-gray-700">Last Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBalances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBalances.map(balance => (
                      <TableRow key={balance.customerId} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">{balance.customerName}</TableCell>
                        <TableCell className="text-right font-medium">{balance.totalSales.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">{balance.totalPaid.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">{balance.outstandingBalance.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={getStatusBadgeColor(balance.paymentStatus)}>
                            {balance.paymentStatus.charAt(0).toUpperCase() + balance.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="space-y-1">
                            {balance.paymentBreakdown && Object.entries(balance.paymentBreakdown).map(([method, amount]) =>
                              amount > 0 ? <div key={method}>{method}: {amount.toLocaleString()}</div> : null
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {balance.lastPaymentDate ? new Date(balance.lastPaymentDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-4 mt-4">
          {payments.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No payments recorded yet</p>
            </Card>
          ) : (
            <Card className="border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-gray-700">Date</TableHead>
                      <TableHead className="text-gray-700">Customer</TableHead>
                      <TableHead className="text-right text-gray-700">Amount</TableHead>
                      <TableHead className="text-gray-700">Methods</TableHead>
                      <TableHead className="text-gray-700">Invoice</TableHead>
                      <TableHead className="text-center text-gray-700">Status</TableHead>
                      <TableHead className="text-gray-700">Approved By</TableHead>
                      <TableHead className="text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.slice().reverse().map(payment => (
                      <TableRow key={payment.id} className="hover:bg-gray-50">
                        <TableCell className="text-sm">{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium text-gray-900">{payment.customerName}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">{payment.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">
                          {payment.allocations.map((a, i) => (
                            <div key={i}>{a.method}: {a.amount.toLocaleString()}</div>
                          ))}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{payment.invoice || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              payment.status === 'completed'
                                ? 'bg-green-600'
                                : payment.status === 'confirmed'
                                ? 'bg-blue-600'
                                : 'bg-yellow-600'
                            }
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{payment.approvedBy || '-'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="text-xs">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          {payments.filter(p => p.status === 'pending').length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500">All payments approved!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Pending Summary */}
              <Card className="p-4 border-2 border-red-300 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 font-semibold">⚠️ SHOP OWNER VERIFICATION REQUIRED</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {payments.filter(p => p.status === 'pending').length} Payment(s) Awaiting Approval
                    </p>
                    <p className="text-lg text-red-700 mt-1">
                      Total Amount: {payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
                    </p>
                  </div>
                  <AlertCircle className="h-16 w-16 text-red-600" />
                </div>
              </Card>

              {/* Individual Pending Payments */}
              {payments.filter(p => p.status === 'pending').map((payment, idx) => (
                <Card key={payment.id} className="p-4 border-2 border-yellow-300 bg-yellow-50 hover:shadow-lg transition">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-yellow-200 pb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-yellow-700">#{idx + 1}</span>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">{payment.customerName}</h4>
                            <p className="text-xs text-gray-600">Submitted: {new Date(payment.date).toLocaleDateString()} {new Date(payment.date).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-yellow-600 text-white px-3 py-1">⏳ PENDING APPROVAL</Badge>
                    </div>

                    {/* Customer Balance Context */}
                    {(() => {
                      const customerBalance = customerBalances.find(cb => cb.customerName === payment.customerName);
                      if (customerBalance) {
                        const balanceAfterPayment = customerBalance.outstandingBalance - payment.totalAmount;
                        return (
                          <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-300">
                            <p className="text-xs font-bold text-purple-900 mb-3">👤 CUSTOMER PAYMENT CONTEXT</p>
                            <div className="grid grid-cols-4 gap-2">
                              <div className="bg-white p-2 rounded border border-purple-200 text-center">
                                <p className="text-xs text-gray-600 font-semibold">PREVIOUSLY DUE</p>
                                <p className="text-lg font-bold text-red-600">{customerBalance.outstandingBalance.toLocaleString()}</p>
                              </div>
                              <div className="bg-white p-2 rounded border border-green-200 text-center">
                                <p className="text-xs text-gray-600 font-semibold">PAYING NOW</p>
                                <p className="text-lg font-bold text-green-600">-{payment.totalAmount.toLocaleString()}</p>
                              </div>
                              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded border-2 border-blue-400 text-center">
                                <p className="text-xs text-blue-900 font-bold">BALANCE AFTER</p>
                                <p className="text-lg font-bold text-blue-700">
                                  {balanceAfterPayment > 0 ? balanceAfterPayment.toLocaleString() : '0'}
                                </p>
                              </div>
                              <div className="bg-white p-2 rounded border border-gray-200 text-center">
                                <p className="text-xs text-gray-600 font-semibold">STATUS</p>
                                <p className="text-xs font-bold">
                                  {balanceAfterPayment === 0 ? (
                                    <span className="text-green-600">✅ PAID</span>
                                  ) : balanceAfterPayment > 0 ? (
                                    <span className="text-yellow-600">⚠️ PARTIAL</span>
                                  ) : (
                                    <span className="text-blue-600">ℹ️ OVERPAY</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-purple-200">
                              <p className="text-xs text-purple-900">
                                📊 <strong>Total Sales to Customer:</strong> {customerBalance.totalSales.toLocaleString()} | 
                                <strong> Already Paid:</strong> {customerBalance.totalPaid.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Amount & Methods - Prominent Display */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-lg border-2 border-yellow-300">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 font-semibold">TOTAL AMOUNT</p>
                        <p className="text-2xl font-bold text-green-600">{payment.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="border-l-2 border-r-2 border-yellow-200 px-3">
                        <p className="text-xs text-gray-600 font-semibold mb-2">PAYMENT METHODS</p>
                        <div className="space-y-1">
                          {payment.allocations.map((a, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="capitalize font-medium">{a.method}</span>
                              <span className="font-bold text-blue-600">{a.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 font-semibold">REFERENCE</p>
                        <p className="text-sm font-mono text-gray-700 break-all">{payment.reference || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Payment Method Details */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-bold text-blue-900 mb-2">📋 PAYMENT METHOD BREAKDOWN</p>
                      <div className="space-y-2">
                        {payment.allocations.map((alloc, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                            <div>
                              <p className="font-medium capitalize">{alloc.method}</p>
                              {alloc.reference && (
                                <p className="text-xs text-gray-600">Ref: {alloc.reference}</p>
                              )}
                            </div>
                            <p className="font-bold text-lg text-blue-600">{alloc.amount.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes if any */}
                    {payment.notes && (
                      <div className="p-3 bg-gray-100 rounded-lg border border-gray-300">
                        <p className="text-xs font-bold text-gray-700 mb-1">📝 NOTES</p>
                        <p className="text-sm text-gray-800">{payment.notes}</p>
                      </div>
                    )}

                    {/* Invoice info if linked */}
                    {payment.invoice && (
                      <div className="p-2 bg-purple-50 rounded border border-purple-200">
                        <p className="text-xs text-purple-700"><strong>Invoice:</strong> {payment.invoice}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => {
                        setSelectedPaymentForApproval(payment);
                        setShowOwnerApproval(true);
                      }}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 font-bold py-3 text-base"
                    >
                      ✅ PROCEED TO OWNER APPROVAL
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Owner Approval Dialog */}
      <AlertDialog open={showOwnerApproval} onOpenChange={setShowOwnerApproval}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-xl">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <span>🔐 SHOP OWNER APPROVAL VERIFICATION</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2 text-gray-700">
              <strong>MANDATORY:</strong> Only shop owner/manager can approve this payment. Please verify all details and enter owner credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedPaymentForApproval && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Payment Summary - Prominent Display */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 space-y-3">
                <h3 className="font-bold text-lg text-blue-900">💼 PAYMENT SUMMARY</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-xs text-gray-600 font-semibold">CLIENT/CUSTOMER</p>
                    <p className="text-lg font-bold text-gray-900">{selectedPaymentForApproval.customerName}</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-xs text-gray-600 font-semibold">TOTAL AMOUNT</p>
                    <p className="text-lg font-bold text-green-600">{selectedPaymentForApproval.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-xs text-gray-600 font-semibold mb-2">PAYMENT METHOD BREAKDOWN</p>
                  <div className="space-y-1">
                    {selectedPaymentForApproval.allocations.map((a, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="capitalize font-medium">{a.method}</span>
                        <span className="font-bold text-blue-600">{a.amount.toLocaleString()}</span>
                        {a.reference && <span className="text-gray-500 text-xs">({a.reference})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Owner Verification Section */}
              <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300 space-y-3">
                <h3 className="font-bold text-lg text-yellow-900">👤 SHOP OWNER/MANAGER VERIFICATION</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    👤 Full Name of Approver *
                    <span className="text-red-600 ml-1">(Required)</span>
                  </label>
                  <Input
                    placeholder="e.g., Ahmed Khan / Sara Ali"
                    value={ownerApproval.approverName}
                    onChange={(e) => setOwnerApproval({ ...ownerApproval, approverName: e.target.value })}
                    className="border-2 border-yellow-300 font-medium"
                  />
                  {!ownerApproval.approverName && (
                    <p className="text-xs text-red-600">⚠️ Owner name is mandatory for verification</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    📧 Approver Email *
                    <span className="text-red-600 ml-1">(Required)</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g., owner@shop.com"
                    value={ownerApproval.approverEmail}
                    onChange={(e) => setOwnerApproval({ ...ownerApproval, approverEmail: e.target.value })}
                    className="border-2 border-yellow-300 font-medium"
                  />
                  {!ownerApproval.approverEmail && (
                    <p className="text-xs text-red-600">⚠️ Email is mandatory for audit trail</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    📝 Approval Notes (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Verified invoice, pending due next week..."
                    value={ownerApproval.approvalNotes}
                    onChange={(e) => setOwnerApproval({ ...ownerApproval, approvalNotes: e.target.value })}
                    className="border border-gray-300"
                  />
                </div>
              </div>

              {/* Compliance Statement */}
              <div className="p-3 bg-red-50 rounded border border-red-300">
                <p className="text-xs text-red-900 font-semibold">
                  ⚖️ <strong>COMPLIANCE:</strong> By clicking "APPROVE", you confirm that the shop owner/manager has verified this payment and approves the transaction. This action cannot be undone.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <AlertDialogCancel className="flex-1">❌ CANCEL</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleOwnerApproval} 
              className="flex-1 bg-green-600 hover:bg-green-700 font-bold text-base py-2"
              disabled={!ownerApproval.approverName || !ownerApproval.approverEmail}
            >
              ✅ APPROVE PAYMENT
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
