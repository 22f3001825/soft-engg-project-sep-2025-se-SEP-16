import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { ArrowUpRight } from 'lucide-react';

export const TicketsTable = ({ tickets = [], onOpen }) => {
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map(t => (
              <TableRow key={t.id} className="hover:bg-accent/30 transition-colors cursor-pointer">
                <TableCell className="font-medium">{t.id}</TableCell>
                <TableCell>{t.customer_name || 'Customer'}</TableCell>
                <TableCell className="max-w-md truncate">{t.subject}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(t.status)}>{t.status?.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(t.priority)}>{t.priority}</Badge>
                </TableCell>
                <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>

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


