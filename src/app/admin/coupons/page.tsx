
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { DiscountCoupon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Search, TicketPercent, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const CouponFormFields = dynamic(() => import('@/components/admin/coupons/CouponFormFields'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading form...
    </div>
  ),
});

export default function AdminCouponsPage() {
  const { discountCoupons, addDiscountCoupon, updateDiscountCoupon, deleteDiscountCoupon } = useAppContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null);
  const [formData, setFormData] = useState<Partial<DiscountCoupon>>({ 
      code: '', 
      discountPercentage: 10, 
      isActive: true,
      usageLimit: undefined,
      expiresAt: undefined,
  });

  useEffect(() => {
    if (editingCoupon) {
      setFormData({ ...editingCoupon });
    } else {
      // Reset for new coupon
      setFormData({ code: '', discountPercentage: 10, isActive: true, usageLimit: undefined, expiresAt: undefined });
    }
  }, [editingCoupon]);

  const filteredCoupons = useMemo(() => {
    return discountCoupons.filter(coupon =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [discountCoupons, searchTerm]);

  const openFormForNew = () => {
    setEditingCoupon(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (coupon: DiscountCoupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let parsedValue: string | number | boolean | undefined = value;
    if (type === 'checkbox') {
        parsedValue = checked;
    } else if (name === 'discountPercentage' || name === 'usageLimit') {
        parsedValue = value === '' ? undefined : parseInt(value, 10);
    }
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, expiresAt: date ? date.getTime() : undefined }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code?.trim() || formData.discountPercentage == null) {
      toast({ title: "Validation Error", description: "Coupon code and discount percentage are required.", variant: "destructive" });
      return;
    }
    if (formData.discountPercentage < 1 || formData.discountPercentage > 100) {
      toast({ title: "Validation Error", description: "Discount percentage must be between 1 and 100.", variant: "destructive" });
      return;
    }
    if (formData.usageLimit !== undefined && formData.usageLimit < 1) {
        toast({ title: "Validation Error", description: "Usage limit must be at least 1.", variant: "destructive" });
        return;
    }

    const couponDataToSave: Omit<DiscountCoupon, 'id' | 'createdAt' | 'updatedAt'> = {
      code: formData.code.trim().toUpperCase(),
      discountPercentage: formData.discountPercentage,
      isActive: formData.isActive ?? true,
      expiresAt: formData.expiresAt,
      usageLimit: formData.usageLimit,
      timesUsed: editingCoupon ? editingCoupon.timesUsed : 0,
    };

    let success = false;
    if (editingCoupon) {
      updateDiscountCoupon({ ...editingCoupon, ...couponDataToSave, code: editingCoupon.code });
      success = true;
    } else {
      success = addDiscountCoupon(couponDataToSave);
    }

    if (success) {
      setIsFormOpen(false);
      setEditingCoupon(null);
    }
  };
  
  const getCouponStatus = (coupon: DiscountCoupon): { text: string; icon: React.ElementType, badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    if (!coupon.isActive) return { text: 'Inactive', icon: XCircle, badgeVariant: 'secondary' };
    if (coupon.expiresAt && coupon.expiresAt < Date.now()) return { text: 'Expired', icon: AlertTriangle, badgeVariant: 'destructive' };
    if (coupon.usageLimit && (coupon.timesUsed ?? 0) >= coupon.usageLimit) return { text: 'Used Up', icon: XCircle, badgeVariant: 'destructive' };
    return { text: 'Active', icon: CheckCircle, badgeVariant: 'default' };
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center"><TicketPercent className="mr-3 h-8 w-8" />Manage Discount Coupons</h1>
        <Button onClick={openFormForNew} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Coupon
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-body">Coupon List</CardTitle>
          <CardDescription>Add, edit, or delete discount coupons for your store.</CardDescription>
          <div className="mt-4">
            <div className="relative">
              <Input
                placeholder="Search coupons by code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm pl-10"
                aria-label="Search coupons"
              />
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] xl:h-[65vh]">
            <table className="w-full">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b">
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Code</th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Discount</th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground hidden md:table-cell">Usage</th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground hidden md:table-cell">Expires</th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map(coupon => {
                  const status = getCouponStatus(coupon);
                  const Icon = status.icon;
                  return (
                  <tr key={coupon.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 align-top">
                      <Badge variant="outline" className="font-mono text-base">{coupon.code}</Badge>
                    </td>
                    <td className="p-3 align-top text-sm sm:text-base">{coupon.discountPercentage}%</td>
                    <td className="p-3 align-top">
                      <Badge variant={status.badgeVariant} className={status.badgeVariant === 'default' ? 'bg-green-500 hover:bg-green-600' : ''}>
                          <Icon className="mr-1 h-3 w-3" /> {status.text}
                      </Badge>
                    </td>
                    <td className="p-3 align-top text-sm sm:text-base hidden md:table-cell">
                        {coupon.timesUsed ?? 0} / {coupon.usageLimit ?? '∞'}
                    </td>
                    <td className="p-3 align-top text-sm sm:text-base hidden md:table-cell">
                      {coupon.expiresAt ? format(new Date(coupon.expiresAt), 'MMM d, yyyy') : 'Never'}
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button variant="outline" size="icon" onClick={() => openFormForEdit(coupon)} title={`Edit ${coupon.code}`} aria-label={`Edit coupon ${coupon.code}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmationModal
                          triggerText={<Button variant="destructive" size="icon" title={`Delete ${coupon.code}`} aria-label={`Delete coupon ${coupon.code}`}><Trash2 className="h-4 w-4" /></Button>}
                          title="Delete Coupon"
                          description={`Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`}
                          onConfirm={() => deleteDiscountCoupon(coupon.id)}
                        />
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </ScrollArea>
          {filteredCoupons.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {discountCoupons.length === 0 ? "No coupons created yet." : "No coupons found matching your criteria."}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) { setEditingCoupon(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <CouponFormFields
              formData={formData}
              handleFormInputChange={handleFormInputChange}
              handleDateChange={handleDateChange}
              isEditing={!!editingCoupon}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setEditingCoupon(null); }}>Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleFormSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingCoupon ? 'Save Changes' : 'Create Coupon'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
