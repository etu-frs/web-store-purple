
"use client";

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { Order, OrderStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Edit3, ListOrdered, Package, PackageCheck, Truck, CheckSquare, XCircle, ClipboardList, Search, Filter, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const OrderDetailsView = dynamic(() => import('@/components/admin/orders/OrderDetailsView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 min-h-[300px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading details...
    </div>
  ),
});


const ORDER_STATUSES: OrderStatus[] = ['Pending Approval', 'Processing', 'Ready for Shipment', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'];

const statusMeta: Record<OrderStatus, { icon: React.ElementType, colorClass: string, badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    'Pending Approval': { icon: ClipboardList, colorClass: 'text-yellow-600', badgeVariant: 'outline' },
    'Processing': { icon: Package, colorClass: 'text-blue-600', badgeVariant: 'secondary' },
    'Ready for Shipment': { icon: PackageCheck, colorClass: 'text-sky-600', badgeVariant: 'secondary' },
    'Shipped': { icon: Truck, colorClass: 'text-indigo-600', badgeVariant: 'secondary' },
    'Out for Delivery': { icon: Truck, colorClass: 'text-purple-600', badgeVariant: 'secondary' },
    'Delivered': { icon: CheckSquare, colorClass: 'text-green-600', badgeVariant: 'default' },
    'Cancelled': { icon: XCircle, colorClass: 'text-red-600', badgeVariant: 'destructive' },
    'Refunded': { icon: XCircle, colorClass: 'text-pink-600', badgeVariant: 'destructive' },
};


export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useAppContext();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [currentUpdatingStatus, setCurrentUpdatingStatus] = useState<OrderStatus | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');


  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
        const matchesSearchTerm = 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.currentStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatusFilter = statusFilter === 'all' || order.currentStatus === statusFilter;

        return matchesSearchTerm && matchesStatusFilter;
    }).sort((a,b) => b.createdAt - a.createdAt);
  }, [orders, searchTerm, statusFilter]);


  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };
  
  const openStatusUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setCurrentUpdatingStatus(order.currentStatus); 
    setStatusUpdateNote(''); 
  };

  const handleDetailedStatusUpdate = () => {
    if (selectedOrder && currentUpdatingStatus) { 
      updateOrderStatus(selectedOrder.id, currentUpdatingStatus, statusUpdateNote || undefined);
      setSelectedOrder(null); 
      setCurrentUpdatingStatus(undefined);
      setStatusUpdateNote('');
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary flex items-center"><ListOrdered className="mr-3 h-8 w-8"/>Manage Orders</h1>
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-body">All Customer Orders</CardTitle>
          <CardDescription>View and manage customer orders. Update status as needed.</CardDescription>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Input 
                        placeholder="Search by Order ID, Customer, Status, Item..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10"
                        aria-label="Search orders"
                    />
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-muted-foreground"/>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
                        <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter orders by status">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {ORDER_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>
                                    <Badge 
                                        variant={statusMeta[status].badgeVariant}
                                        className="capitalize text-xs"
                                    >
                                        {status}
                                    </Badge>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
                {orders.length === 0 ? "No orders found yet." : "No orders match your search or filter criteria."}
            </p>
          ) : (
            <ScrollArea className="h-[60vh] xl:h-[65vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-card">Order ID</TableHead>
                    <TableHead className="sticky top-0 bg-card">Customer</TableHead>
                    <TableHead className="sticky top-0 bg-card">Date</TableHead>
                    <TableHead className="sticky top-0 bg-card">Total</TableHead>
                    <TableHead className="sticky top-0 bg-card">Status</TableHead>
                    <TableHead className="sticky top-0 bg-card text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                           <Button variant="link" className="p-0 h-auto text-primary hover:underline" onClick={() => setSelectedOrder(order)} aria-label={`View details for order ${order.id}`}>
                            {order.id.substring(0,15)}...
                           </Button>
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy, HH:mm')}</TableCell>
                      <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.currentStatus}
                          onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                          aria-label={`Change status for order ${order.id}`}
                        >
                          <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs sm:text-sm">
                            <SelectValue placeholder="Set status" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map(status => (
                              <SelectItem key={status} value={status}>
                                <Badge 
                                  variant={statusMeta[status].badgeVariant}
                                  className="capitalize"
                                >
                                  {status}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                            <Button variant="outline" size="icon" onClick={() => setSelectedOrder(order)} title="View Details" aria-label={`View details for order ${order.id}`}>
                               <Eye className="h-4 w-4" />
                            </Button>
                         <Button variant="outline" size="icon" className="ml-2" onClick={() => openStatusUpdateModal(order)} title="Update Status & Add Note" aria-label={`Update status and add note for order ${order.id}`}>
                            <Edit3 className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => { if(!isOpen) { setSelectedOrder(null); setStatusUpdateNote(''); setCurrentUpdatingStatus(undefined); } }}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Order Details: {selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
                <OrderDetailsView
                    order={selectedOrder}
                    statusMeta={statusMeta}
                    ORDER_STATUSES={ORDER_STATUSES}
                    currentUpdatingStatus={currentUpdatingStatus}
                    setCurrentUpdatingStatus={setCurrentUpdatingStatus}
                    statusUpdateNote={statusUpdateNote}
                    setStatusUpdateNote={setStatusUpdateNote}
                />
            )}
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Close</Button>
                </DialogClose>
                 <Button 
                    type="button" 
                    onClick={handleDetailedStatusUpdate} 
                    disabled={!selectedOrder || !currentUpdatingStatus || (currentUpdatingStatus === selectedOrder.currentStatus && !statusUpdateNote.trim())}
                 >
                    Update Status
                 </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
