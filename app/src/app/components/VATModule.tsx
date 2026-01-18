'use client';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react';
import { mockVATRecords } from '../mockData';
import { useState } from 'react';

export function VATModule() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const currentPeriod = mockVATRecords[mockVATRecords.length - 1];
  const totalSalesVAT = mockVATRecords.reduce((sum, v) => sum + v.salesVAT, 0);
  const totalPurchaseVAT = mockVATRecords.reduce((sum, v) => sum + v.purchaseVAT, 0);
  const totalNetVAT = totalSalesVAT - totalPurchaseVAT;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'filed':
        return <Badge className="bg-green-600">{t('vat.filed')}</Badge>;
      case 'paid':
        return <Badge className="bg-blue-600">{t('purchases.paid')}</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">{t('purchases.pending')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredVATRecords = mockVATRecords.filter(record =>
    record.period.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">VAT (UAE) - 5%</h1>
          <p className="text-muted-foreground mt-1">Value Added Tax compliance and reporting</p>
        </div>
        <Button className="bg-blue-900 hover:bg-blue-800">
          <Download className="h-4 w-4 mr-2" />
          Generate VAT Return
        </Button>
      </div>

      {/* Current Period Summary */}
      <Card className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">Current Period: {currentPeriod.period}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 opacity-80">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">VAT on Sales (Output Tax)</span>
              </div>
              <p className="text-3xl font-semibold">AED {currentPeriod.salesVAT.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 opacity-80">
                <TrendingDown className="h-5 w-5" />
                <span className="text-sm">VAT on Purchases (Input Tax)</span>
              </div>
              <p className="text-3xl font-semibold">AED {currentPeriod.purchaseVAT.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 opacity-80">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm">Net VAT {currentPeriod.netVAT >= 0 ? 'Payable' : 'Refundable'}</span>
              </div>
              <p className={`text-3xl font-semibold ${currentPeriod.netVAT >= 0 ? 'text-red-300' : 'text-green-300'}`}>
                AED {Math.abs(currentPeriod.netVAT).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-600">
          <CardHeader>
            <CardTitle className="text-sm">Total VAT Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              AED {totalSalesVAT.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All periods</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="text-sm">Total VAT Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">
              AED {totalPurchaseVAT.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All periods</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-600">
          <CardHeader>
            <CardTitle className="text-sm">Net VAT Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${totalNetVAT >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              AED {totalNetVAT.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalNetVAT >= 0 ? 'Payable to FTA' : 'Refundable from FTA'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* VAT Period Table */}
      <Card>
        <CardHeader>
          <CardTitle>VAT Return History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by period..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">VAT on Sales (AED)</TableHead>
                <TableHead className="text-right">VAT on Purchases (AED)</TableHead>
                <TableHead className="text-right">Net VAT (AED)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVATRecords.length > 0 ? filteredVATRecords.map((record, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{record.period}</TableCell>
                  <TableCell className="text-right text-green-600 font-semibold">
                    {record.salesVAT.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-blue-600 font-semibold">
                    {record.purchaseVAT.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${record.netVAT >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {record.netVAT >= 0 ? '+' : ''}{record.netVAT.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No VAT records found matching your search
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* UAE VAT Compliance Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">UAE VAT Compliance Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="font-semibold text-blue-900">Standard Rate:</span>
            <span>5% VAT applicable on all goods and services</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-blue-900">Filing Frequency:</span>
            <span>Quarterly or Monthly (based on annual turnover)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-blue-900">Payment Deadline:</span>
            <span>Within 28 days after the end of the tax period</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-blue-900">Maintained by:</span>
            <span>Federal Tax Authority (FTA) - UAE</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
