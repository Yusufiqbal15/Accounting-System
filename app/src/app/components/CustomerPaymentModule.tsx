'use client';

import React, { useState, useMemo } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { CreditCard, Plus, Search, TrendingDown, Users } from 'lucide-react';
import type { Customer, Sale } from '../types';
import { toast } from 'sonner';

interface CustomerPaymentModuleProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'check' | 'pos' | 'credit';
  date: string;
  reference: string;
  notes: string;
  journalEntryId?: string;
}

interface CustomerBalance {
  customerId: string;
  customerName: string;
  totalSales: number;
  totalPaid: number;
  outstandingBalance: number;
  lastPaymentDate?: string;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue';
}

export function CustomerPaymentModule({ customers, setCustomers }: CustomerPaymentModuleProps) {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate customer balances
  const customerBalances = useMemo<CustomerBalance[]>(() => {
    return customers.map(customer => {
      const totalSales = customer.totalSales || 0;
      const totalPaid = payments
        .filter(p => p.customerId === customer.id)
        .reduce((sum: number, p) => sum + p.amount, 0);
      const outstandingBalance = Math.max(0, totalSales - totalPaid);
      
      let paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue' = 'pending';
      if (outstandingBalance === 0 && totalSales > 0) paymentStatus = 'paid';
      else if (outstandingBalance > 0 && totalPaid > 0) paymentStatus = 'partial';
      else if (outstandingBalance > 0) paymentStatus = 'pending';

      const lastPayment = payments
        .filter(p => p.customerId === customer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      return {
        customerId: customer.id,
        customerName: customer.name,
        totalSales,
        totalPaid,
        outstandingBalance,
        lastPaymentDate: lastPayment?.date,
        paymentStatus,
      };
    });
  }, [customers, payments]);

  const handleRecordPayment = () => {
    if (!selectedCustomerId || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error(t('common.error'), { description: 'Please fill all fields with valid amounts' });
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const balance = customerBalances.find(b => b.customerId === selectedCustomerId);
    if (balance && parseFloat(paymentAmount) > balance.outstandingBalance + 1000) {
      toast.warning('Payment Exceeds Outstanding Balance', {
        description: `Outstanding: ${balance.outstandingBalance.toLocaleString()}`,
      });
    }

    const newPayment: Payment = {
      id: `PAY-${Date.now()}`,
      customerId: selectedCustomerId,
      customerName: customer.name,
      amount: parseFloat(paymentAmount),
      paymentMethod: paymentMethod as any,
      date: new Date().toISOString().split('T')[0],
      reference,
      notes,
    };

    setPayments([...payments, newPayment]);
    
    // Update customer data - note: In this demo we track payments separately
    // In production, sync with backend
    setCustomers(customers);

    toast.success('Payment Recorded', {
      description: `${customer.name} - ${parseFloat(paymentAmount).toLocaleString()}`,
    });

    // Reset form
    setSelectedCustomerId('');
    setPaymentAmount('');
    setReference('');
    setNotes('');
    setIsDialogOpen(false);
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

  const filteredBalances = useMemo(() => {
    return customerBalances.filter(balance => {
      const matchesSearch = balance.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || balance.paymentStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [customerBalances, searchTerm, filterStatus]);

  const totalOutstanding = filteredBalances.reduce((sum, b) => sum + b.outstandingBalance, 0);
  const totalCollected = filteredBalances.reduce((sum, b) => sum + b.totalPaid, 0);

  return (
    <div className="flex-1 flex flex-col h-full p-6 gap-6 bg-background overflow-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">{t('nav.customerPayment')}</h1>
        </div>
        <p className="text-gray-600">{t('common.description') || 'Manage and track customer payments'}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-gray-200">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{t('common.totalCustomers') || 'Total Customers'}</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </div>
        </Card>
        
        <Card className="p-4 bg-white border border-gray-200">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{t('accounting.outstandingReceivables') || 'Outstanding'}</p>
            <p className="text-2xl font-bold text-red-600">{totalOutstanding.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-gray-200">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{t('common.totalCollected') || 'Total Collected'}</p>
            <p className="text-2xl font-bold text-green-600">{totalCollected.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-gray-200">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{t('common.paymentCount') || 'Payments Recorded'}</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </div>
        </Card>
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-fit bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t('common.recordPayment') || 'Record Payment'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('common.recordPayment') || 'Record Payment'}</DialogTitle>
            <DialogDescription>
              {t('common.recordPaymentDesc') || 'Record a payment from a customer'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.customer') || 'Customer'}</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.selectCustomer') || 'Select customer'} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => {
                    const balance = customerBalances.find(b => b.customerId === customer.id);
                    return (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - Outstanding: {balance?.outstandingBalance.toLocaleString() || 0}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.amount') || 'Amount'}</label>
              <Input
                type="number"
                placeholder="0.00"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.paymentMethod') || 'Payment Method'}</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t('payment.cash') || 'Cash'}</SelectItem>
                  <SelectItem value="bank">{t('payment.bank') || 'Bank Transfer'}</SelectItem>
                  <SelectItem value="check">{t('payment.check') || 'Check'}</SelectItem>
                  <SelectItem value="pos">{t('payment.pos') || 'Card/POS'}</SelectItem>
                  <SelectItem value="credit">{t('payment.credit') || 'Credit'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.reference') || 'Reference'}</label>
              <Input
                placeholder={t('common.enterReference') || 'Enter reference number'}
                value={reference}
                onChange={e => setReference(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('common.notes') || 'Notes'}</label>
              <Input
                placeholder={t('common.enterNotes') || 'Enter notes'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleRecordPayment} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {t('common.recordPayment') || 'Record Payment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-600">{t('common.search')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('common.searchCustomer') || 'Search customer...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-40">
          <label className="text-sm font-medium text-gray-600">{t('common.status')}</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.allStatuses') || 'All Statuses'}</SelectItem>
              <SelectItem value="paid">{t('common.paid') || 'Paid'}</SelectItem>
              <SelectItem value="partial">{t('common.partial') || 'Partial'}</SelectItem>
              <SelectItem value="pending">{t('common.pending') || 'Pending'}</SelectItem>
              <SelectItem value="overdue">{t('common.overdue') || 'Overdue'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer Balances Table */}
      <Card className="border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-gray-700">{t('common.customer')}</TableHead>
                <TableHead className="text-right text-gray-700">{t('common.totalSales') || 'Total Sales'}</TableHead>
                <TableHead className="text-right text-gray-700">{t('common.totalPaid') || 'Total Paid'}</TableHead>
                <TableHead className="text-right text-gray-700">{t('common.outstanding') || 'Outstanding'}</TableHead>
                <TableHead className="text-center text-gray-700">{t('common.status')}</TableHead>
                <TableHead className="text-gray-700">{t('common.lastPayment') || 'Last Payment'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBalances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBalances.map(balance => (
                  <TableRow key={balance.customerId} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{balance.customerName}</TableCell>
                    <TableCell className="text-right">{balance.totalSales.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">{balance.totalPaid.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600 font-medium">{balance.outstandingBalance.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusBadgeColor(balance.paymentStatus)}>
                        {balance.paymentStatus.charAt(0).toUpperCase() + balance.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {balance.lastPaymentDate ? new Date(balance.lastPaymentDate).toLocaleDateString() : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card className="border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">{t('common.paymentHistory') || 'Payment History'}</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700">{t('common.date')}</TableHead>
                  <TableHead className="text-gray-700">{t('common.customer')}</TableHead>
                  <TableHead className="text-right text-gray-700">{t('common.amount')}</TableHead>
                  <TableHead className="text-gray-700">{t('common.method')}</TableHead>
                  <TableHead className="text-gray-700">{t('common.reference')}</TableHead>
                  <TableHead className="text-gray-700">{t('common.notes')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice().reverse().map(payment => (
                  <TableRow key={payment.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900">{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-gray-900">{payment.customerName}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">{payment.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-600">{payment.paymentMethod.toUpperCase()}</TableCell>
                    <TableCell className="text-gray-600">{payment.reference || '-'}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
