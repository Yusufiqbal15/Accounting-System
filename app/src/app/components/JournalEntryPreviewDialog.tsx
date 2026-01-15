import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { mockJournalEntries } from '../mockData';

interface JournalEntryPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journalEntryId: string | null;
  productionOrder: any;
}

export function JournalEntryPreviewDialog({ 
  open, 
  onOpenChange, 
  journalEntryId,
  productionOrder 
}: JournalEntryPreviewDialogProps) {
  const journalEntry = journalEntryId ? mockJournalEntries.find(je => je.id === journalEntryId) : null;

  if (!journalEntry || !productionOrder) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-900" />
            </div>
            <div>
              <DialogTitle>Journal Entry - Production Wastage</DialogTitle>
              <DialogDescription>
                Automatic posting for {journalEntry.reference}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Entry Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Entry ID</p>
              <p className="font-medium">{journalEntry.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date(journalEntry.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reference</p>
              <p className="font-medium">{journalEntry.reference}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={journalEntry.status === 'posted' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                {journalEntry.status === 'posted' ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Posted
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    Draft
                  </>
                )}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="font-medium">{journalEntry.description}</p>
          </div>

          <Separator />

          {/* Production Order Context */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-3">Production Order Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Product</p>
                <p className="font-medium">{productionOrder.productName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Quantity</p>
                <p className="font-medium">{productionOrder.quantity} units</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Production Cost</p>
                <p className="font-medium">AED {productionOrder.totalProductionCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Wastage Value</p>
                <p className="font-medium text-red-600">AED {productionOrder.totalWastageValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Journal Entries Table */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Journal Entries</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit (AED)</TableHead>
                  <TableHead className="text-right">Credit (AED)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journalEntry.entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.accountName}</p>
                        <p className="text-xs text-muted-foreground">Account ID: {entry.accountId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.debit > 0 ? (
                        <span className="font-medium">
                          {entry.debit.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.credit > 0 ? (
                        <span className="font-medium">
                          {entry.credit.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {journalEntry.totalDebit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {journalEntry.totalCredit.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Accounting Impact Explanation */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Accounting Impact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>
                  <strong>Production Waste / Scrap</strong> expense account is debited by AED {journalEntry.totalDebit.toLocaleString()}, 
                  increasing production expenses in P&L
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Raw Material Inventory</strong> asset account is credited by AED {journalEntry.totalCredit.toLocaleString()}, 
                  reducing inventory value on the balance sheet
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>
                  This entry ensures wastage costs are accurately tracked and reflected in financial statements
                </span>
              </li>
            </ul>
          </div>

          {/* Balancing Check */}
          <div className={`border rounded-lg p-4 ${
            journalEntry.totalDebit === journalEntry.totalCredit 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {journalEntry.totalDebit === journalEntry.totalCredit ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-600">Entry is Balanced</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-600">Entry is Not Balanced</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Debit: AED {journalEntry.totalDebit.toLocaleString()} | 
              Credit: AED {journalEntry.totalCredit.toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}