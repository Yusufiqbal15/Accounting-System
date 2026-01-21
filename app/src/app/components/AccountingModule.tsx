'use client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, ChevronRight, ChevronDown, Eye, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockChartOfAccounts, mockJournalEntries } from '../mockData';
import { useState } from 'react';
import React from 'react';
import { toast } from 'sonner';

export function AccountingModule() {
  const { t } = useTranslation();
  const [expandedAccounts, setExpandedAccounts] = useState<string[]>(['COA-6000', 'COA-6100']);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [accounts, setAccounts] = useState(mockChartOfAccounts);
  const [entries, setEntries] = useState(mockJournalEntries);
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [entrySearchQuery, setEntrySearchQuery] = useState('');
  const [accountFormData, setAccountFormData] = useState({
    code: '',
    name: '',
    type: '',
    parentId: ''
  });
  const [entryFormData, setEntryFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    debitAmount: '',
    creditAmount: ''
  });

  const handleAddAccount = () => {
    if (!accountFormData.code || !accountFormData.name || !accountFormData.type) {
      toast.error(t('accounting.fillAllFields'));
      return;
    }

    const newAccount = {
      id: `COA-${Date.now()}`,
      code: accountFormData.code,
      name: accountFormData.name,
      type: accountFormData.type as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'cogs',
      parentId: accountFormData.parentId || undefined,
      balance: 0,
      isActive: true,
      level: accountFormData.parentId ? 2 : 1,
      createdDate: new Date().toISOString()
    };

    setAccounts([...accounts, newAccount]);
    setAccountFormData({ code: '', name: '', type: '', parentId: '' });
    setShowAddAccount(false);
    toast.success(t('common.success'));
  };

  const handleNewEntry = () => {
    if (!entryFormData.date || !entryFormData.reference || !entryFormData.description || !entryFormData.debitAmount || !entryFormData.creditAmount) {
      toast.error(t('accounting.fillAllFields'));
      return;
    }

    const debit = parseFloat(entryFormData.debitAmount);
    const credit = parseFloat(entryFormData.creditAmount);

    const newEntry = {
      id: `JE-${Date.now()}`,
      date: entryFormData.date,
      reference: entryFormData.reference,
      description: entryFormData.description,
      entries: [
        { accountId: 'COA-6110', accountName: 'Expenses', debit: debit, credit: 0 },
        { accountId: 'COA-3000', accountName: 'Cash', debit: 0, credit: credit }
      ],
      totalDebit: debit,
      totalCredit: credit,
      status: 'draft' as const
    };

    setEntries([...entries, newEntry]);
    setEntryFormData({
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      debitAmount: '',
      creditAmount: ''
    });
    setShowNewEntry(false);
    toast.success(t('messages.journalEntryCreatedSuccessfully'));
  };

  const toggleExpand = (accountId: string) => {
    setExpandedAccounts(prev =>
      prev.includes(accountId) ? prev.filter(id => id !== accountId) : [...prev, accountId]
    );
  };

  const getChildAccounts = (parentId: string) => {
    return mockChartOfAccounts.filter(acc => acc.parentId === parentId);
  };

  const hasChildren = (accountId: string) => {
    return mockChartOfAccounts.some(acc => acc.parentId === accountId);
  };

  const renderAccountRow = (account: typeof mockChartOfAccounts[0]): React.ReactNode => {
    const children = getChildAccounts(account.id);
    const isExpanded = expandedAccounts.includes(account.id);
    const hasChildAccounts = hasChildren(account.id);

    return (
      <React.Fragment key={account.id}>
        <TableRow className={account.level === 1 ? 'bg-muted/50 font-semibold' : account.level === 2 ? 'bg-muted/20' : ''}>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${(account.level - 1) * 24}px` }}>
              {hasChildAccounts && (
                <button onClick={() => toggleExpand(account.id)} className="hover:bg-muted rounded p-1">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
              {!hasChildAccounts && <div className="w-6" />}
              <span className={account.level === 1 ? 'font-bold' : account.level === 2 ? 'font-semibold' : ''}>
                {account.name}
                {account.id === 'COA-6110' && (
                  <Badge variant="destructive" className="ml-2 text-xs">{t('accountingModule.wasteAccount')}</Badge>
                )}
              </span>
            </div>
          </TableCell>
          <TableCell className="text-center">{account.code}</TableCell>
          <TableCell className="text-center">
            <Badge variant={
              account.type === 'asset' ? 'default' :
              account.type === 'liability' ? 'secondary' :
              account.type === 'equity' ? 'outline' :
              account.type === 'revenue' ? 'default' :
              account.type === 'expense' ? 'destructive' :
              'secondary'
            }>
              {account.type.toUpperCase()}
            </Badge>
          </TableCell>
          <TableCell className="text-right font-medium">
            AED {account.balance.toLocaleString()}
          </TableCell>
          <TableCell className="text-center">
            <Badge variant={account.isActive ? 'default' : 'secondary'}>
              {account.isActive ? t('accountingModule.active') : t('dialogs.no')}
            </Badge>
          </TableCell>
        </TableRow>
        {isExpanded && children.map(child => renderAccountRow(child))}
      </React.Fragment>
    );
  };

  const topLevelAccounts = mockChartOfAccounts.filter(acc => acc.level === 1);

  // Calculate totals for P&L preview
  const totalRevenue = mockChartOfAccounts.find(acc => acc.id === 'COA-4000')?.balance || 0;
  const totalCOGS = mockChartOfAccounts.find(acc => acc.id === 'COA-5000')?.balance || 0;
  const totalExpenses = mockChartOfAccounts.find(acc => acc.id === 'COA-6000')?.balance || 0;
  const productionWaste = mockChartOfAccounts.find(acc => acc.id === 'COA-6110')?.balance || 0;
  const netProfit = totalRevenue - totalCOGS - totalExpenses;

  const filteredAccounts = accounts.filter(acc =>
    acc.name.toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
    acc.code.toLowerCase().includes(accountSearchQuery.toLowerCase())
  ).filter(acc => acc.level === 1);

  const filteredEntries = entries.filter(entry =>
    entry.reference.toLowerCase().includes(entrySearchQuery.toLowerCase()) ||
    entry.description.toLowerCase().includes(entrySearchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t('accountingModule.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('accountingModule.subtitle')}</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('accountingModule.totalRevenue')}</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">AED {totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('accountingModule.totalExpenses')}</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-500">AED {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('accountingModule.waste')}: AED {productionWaste.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('accountingModule.cashBalance')}</CardTitle>
            <Wallet className="h-5 w-5 text-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AED 45,500</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">{t('accountingModule.netProfit')}</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">AED {netProfit.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="coa">
        <TabsList>
          <TabsTrigger value="coa">{t('accountingModule.chartOfAccounts')}</TabsTrigger>
          <TabsTrigger value="journal">{t('accountingModule.journalEntries')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="coa" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('accountingModule.chartOfAccounts')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete account hierarchy with Production Waste/Scrap tracking
                </p>
              </div>
              <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-900 hover:bg-blue-800">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('accountingModule.addAccount')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('accountingModule.addAccount')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Account Code *</Label>
                        <Input
                          id="code"
                          placeholder="e.g., COA-1000"
                          value={accountFormData.code}
                          onChange={(e) => setAccountFormData({ ...accountFormData, code: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accName">Account Name *</Label>
                        <Input
                          id="accName"
                          placeholder="Account name"
                          value={accountFormData.name}
                          onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Account Type *</Label>
                        <Select value={accountFormData.type} onValueChange={(value) => setAccountFormData({ ...accountFormData, type: value })}>
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asset">Asset</SelectItem>
                            <SelectItem value="liability">Liability</SelectItem>
                            <SelectItem value="equity">Equity</SelectItem>
                            <SelectItem value="revenue">Revenue</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="cogs">COGS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent">Parent Account</Label>
                        <Select value={accountFormData.parentId} onValueChange={(value) => setAccountFormData({ ...accountFormData, parentId: value })}>
                          <SelectTrigger id="parent">
                            <SelectValue placeholder="Optional" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.filter(acc => acc.level === 1).map(acc => (
                              <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleAddAccount} className="w-full bg-blue-600 hover:bg-blue-700">
                      {t('accountingModule.addAccount')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by account name or code..."
                    value={accountSearchQuery}
                    onChange={(e) => setAccountSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead className="text-center">Code</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-right">Balance (AED)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length > 0 ? filteredAccounts.map(account => renderAccountRow(account)) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No accounts found matching your search
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Journal Entries - Production Waste</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatic entries for production wastage posting
                </p>
              </div>
              <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-900 hover:bg-blue-800">
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Journal Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="entryDate">Date *</Label>
                        <Input
                          id="entryDate"
                          type="date"
                          value={entryFormData.date}
                          onChange={(e) => setEntryFormData({ ...entryFormData, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reference">Reference *</Label>
                        <Input
                          id="reference"
                          placeholder="e.g., WO-001, SCRAP-2024"
                          value={entryFormData.reference}
                          onChange={(e) => setEntryFormData({ ...entryFormData, reference: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Input
                        id="description"
                        placeholder="Entry description"
                        value={entryFormData.description}
                        onChange={(e) => setEntryFormData({ ...entryFormData, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="debit">Debit Amount (AED) *</Label>
                        <Input
                          id="debit"
                          type="number"
                          placeholder="0.00"
                          value={entryFormData.debitAmount}
                          onChange={(e) => setEntryFormData({ ...entryFormData, debitAmount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="credit">Credit Amount (AED) *</Label>
                        <Input
                          id="credit"
                          type="number"
                          placeholder="0.00"
                          value={entryFormData.creditAmount}
                          onChange={(e) => setEntryFormData({ ...entryFormData, creditAmount: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleNewEntry} className="w-full bg-blue-600 hover:bg-blue-700">
                      {t('accounting.addEntry')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reference or description..."
                    value={entrySearchQuery}
                    onChange={(e) => setEntrySearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount (AED)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length > 0 ? filteredEntries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{entry.reference}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {entry.totalDebit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No journal entries found matching your search
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}