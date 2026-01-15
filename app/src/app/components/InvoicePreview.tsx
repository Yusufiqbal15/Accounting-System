import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Printer, Download, Mail } from 'lucide-react';
import { mockSales } from '../mockData';

export function InvoicePreview() {
  const invoice = mockSales[0]; // Using first sale as example
  const invoiceDate = new Date(invoice.date);

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button className="bg-blue-900 hover:bg-blue-800">
          <Mail className="h-4 w-4 mr-2" />
          Email to Customer
        </Button>
      </div>

      {/* Invoice */}
      <Card className="shadow-xl">
        <CardContent className="p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">INVOICE</h1>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Manufacturing ERP System</p>
                <p className="text-muted-foreground">Wood & Production</p>
                <p className="text-muted-foreground">Industrial Area, Dubai, UAE</p>
                <p className="text-muted-foreground">TRN: 100123456700003</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-900 mb-2">{invoice.invoiceNumber}</div>
              <div className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-semibold">{invoiceDate.toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold capitalize">{invoice.type}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Bill To */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">BILL TO:</h3>
            <div className="text-lg font-semibold mb-1">{invoice.customerName}</div>
            <div className="text-sm text-muted-foreground">Customer ID: {invoice.customerId}</div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-blue-900">
                  <th className="text-left py-3 text-sm font-semibold">ITEM DESCRIPTION</th>
                  <th className="text-center py-3 text-sm font-semibold">QTY</th>
                  <th className="text-center py-3 text-sm font-semibold">DIMENSIONS (cm)</th>
                  <th className="text-center py-3 text-sm font-semibold">VOLUME (m³)</th>
                  <th className="text-right py-3 text-sm font-semibold">RATE/UNIT</th>
                  <th className="text-right py-3 text-sm font-semibold">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-4 text-sm">{item.itemName}</td>
                    <td className="py-4 text-center text-sm">{item.quantity}</td>
                    <td className="py-4 text-center text-sm">
                      {item.dimensions 
                        ? `${item.dimensions.length} × ${item.dimensions.width} × ${item.dimensions.height}`
                        : '-'}
                    </td>
                    <td className="py-4 text-center text-sm font-semibold bg-blue-50">
                      {item.volume ? item.volume.toFixed(4) : '-'}
                    </td>
                    <td className="py-4 text-right text-sm">AED {item.ratePerUnit.toLocaleString()}</td>
                    <td className="py-4 text-right text-sm font-semibold">
                      AED {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-sm">Subtotal:</span>
                <span className="text-sm font-semibold">AED {invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 bg-blue-50 px-3 rounded">
                <span className="text-sm">VAT (5%):</span>
                <span className="text-sm font-semibold">AED {invoice.vatAmount.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between py-3 bg-blue-900 text-white px-4 rounded-lg">
                <span className="text-base font-semibold">TOTAL DUE:</span>
                <span className="text-2xl font-bold">AED {invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-green-900">Payment Status:</span>
              <span className="text-lg font-bold text-green-900 capitalize">{invoice.paymentStatus}</span>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-12 pt-8 border-t">
            <div className="grid grid-cols-2 gap-8 text-xs text-muted-foreground">
              <div>
                <p className="font-semibold mb-2">Terms & Conditions:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Payment due within 30 days</li>
                  <li>All prices include 5% UAE VAT</li>
                  <li>Dimensions and volumes as specified</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Bank Details:</p>
                <p>Bank: Emirates NBD</p>
                <p>Account: 1234567890</p>
                <p>IBAN: AE12 0123 4567 8901 2345 678</p>
              </div>
            </div>
          </div>

          {/* Thank You */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Thank you for your business!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              For any queries, contact us at info@manufacturing.ae or +971 4 123 4567
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
