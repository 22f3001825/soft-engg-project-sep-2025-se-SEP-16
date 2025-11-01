import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { ArrowUpRight } from 'lucide-react';

export const TicketsTable = ({ tickets = [], onOpen }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-info text-info-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="overflow-hidden w-full shadow-lg">
      <CardContent className="p-0">
        <Table>
          <TableCaption>Recent support tickets</TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Ticket Id</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Subject</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Priority</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="font-semibold">AI Summary</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map(t => (
              <TableRow key={t.id} className="hover:bg-accent/30 transition-colors cursor-pointer">
                <TableCell className="font-medium">{t.id}</TableCell>
                <TableCell>{t.messages[0]?.senderName || 'Customer'}</TableCell>
                <TableCell className="max-w-md truncate">{t.subject}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(t.priority)}>{t.priority}</Badge>
                </TableCell>
                <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  Customer sees issue related to order {t.orderId || 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => onOpen?.(t)} className="hover:bg-primary hover:text-primary-foreground transition-colors">
                    Open <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};


