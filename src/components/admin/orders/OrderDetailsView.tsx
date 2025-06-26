
"use client";

import React from 'react';
import type { Order, OrderStatus, OrderStatusUpdate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, Package, PackageCheck, Truck, CheckSquare, XCircle } from 'lucide-react'; // Added specific icons

interface OrderDetailsViewProps {
  order: Order;
  statusMeta: Record<OrderStatus, { icon: React.ElementType, colorClass: string, badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }>;
  ORDER_STATUSES: OrderStatus[];
  currentUpdatingStatus?: OrderStatus;
  setCurrentUpdatingStatus: (status?: OrderStatus) => void;
  statusUpdateNote: string;
  setStatusUpdateNote: (note: string) => void;
}

const statusIconsInternal: Record<OrderStatusUpdate['status'], React.ElementType> = {
  'Pending Approval': ClipboardList,
  'Processing': Package,
  'Ready for Shipment': PackageCheck,
  'Shipped': Truck,
  'Out for Delivery': Truck,
  'Delivered': CheckSquare,
  'Cancelled': XCircle,
  'Refunded': XCircle, 
};


const OrderDetailsViewComponent: React.FC<OrderDetailsViewProps> = ({
  order,
  statusMeta,
  ORDER_STATUSES,
  currentUpdatingStatus,
  setCurrentUpdatingStatus,
  statusUpdateNote,
  setStatusUpdateNote,
}) => {
  return (
    <ScrollArea className="max-h-[70vh] p-1 pr-4">
        <div className="space-y-4">
        <div><strong>Customer:</strong> {order.customerName}</div>
        <div><strong>Date:</strong> {format(new Date(order.createdAt), 'PPPp')}</div>
        <div><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</div>
         {order.discountAmount && order.discountAmount > 0 && (
            <div><strong>Discount Applied:</strong> -${order.discountAmount.toFixed(2)} ({order.discountCode})</div>
        )}
        <div><strong>Payment Method:</strong> {order.paymentMethod}</div>
        
        <div className="mt-2">
            <h4 className="font-semibold mb-1">Shipping Address:</h4>
            <address className="not-italic text-sm">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.streetAddress}</p>
                <p>{order.shippingAddress.district}, {order.shippingAddress.state}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
            </address>
        </div>

        <div className="mt-2">
            <h4 className="font-semibold mb-1">Items ({order.items.reduce((acc, item) => acc + item.quantity, 0)}):</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
            {order.items.map(item => (
                <li key={item.productId}>
                    {item.name} (x{item.quantity}) - ${item.price.toFixed(2)} each
                    {item.originalPrice && item.originalPrice > item.price && <span className="text-xs text-muted-foreground ml-1">(was ${item.originalPrice.toFixed(2)})</span>}
                </li>
            ))}
            </ul>
        </div>
        
        <div className="mt-2">
            <h4 className="font-semibold mb-1">Status History:</h4>
            <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">                  
            {order.statusHistory.sort((a,b) => b.timestamp - a.timestamp).map((sh, index) => { 
                 const Icon = statusIconsInternal[sh.status] || ClipboardList;
                return(
                <li key={index} className="mb-4 ml-6 last:mb-0">            
                    <span className={`absolute flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full -left-3 ring-4 ring-background ${statusMeta[sh.status]?.colorClass.replace('text-','bg-')}/20`}>
                        <Icon className={`w-3 h-3 ${statusMeta[sh.status]?.colorClass || 'text-primary'}`} />
                    </span>
                    <h5 className="flex items-center mb-0.5 text-sm font-semibold">
                        {sh.status}
                    </h5>
                    <time className="block mb-1 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">
                        {format(new Date(sh.timestamp), 'MMM d, yyyy, HH:mm')}
                    </time>
                    {sh.notes && <p className="text-xs font-normal text-gray-500 dark:text-gray-400 bg-muted/30 p-1.5 rounded-md">{sh.notes}</p>}
                </li>
                )
            })}
            </ol>
        </div>

        <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="order-status-select">Update Current Status</Label>
             <Select
                value={currentUpdatingStatus || order.currentStatus}
                onValueChange={(value) => setCurrentUpdatingStatus(value as OrderStatus)}
              >
                <SelectTrigger id="order-status-select">
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
            <Label htmlFor="status-update-note">Add Note for Status Update (Optional)</Label>
            <Textarea 
                id="status-update-note"
                placeholder="e.g., Shipped via XYZ, tracking #123. Customer contacted."
                value={statusUpdateNote}
                onChange={(e) => setStatusUpdateNote(e.target.value)}
                rows={2}
            />
        </div>
        </div>
    </ScrollArea>
  );
}

OrderDetailsViewComponent.displayName = 'OrderDetailsView';
export default React.memo(OrderDetailsViewComponent);
