
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { DiscountCoupon } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

interface CouponFormFieldsProps {
  formData: Partial<DiscountCoupon>;
  handleFormInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateChange: (date: Date | undefined) => void;
  isEditing: boolean;
}

const CouponFormFieldsComponent: React.FC<CouponFormFieldsProps> = ({
  formData,
  handleFormInputChange,
  handleDateChange,
  isEditing,
}) => {
  return (
    <form className="space-y-6 pb-4">
      <div>
        <Label htmlFor="code" className="font-body">Coupon Code *</Label>
        <Input
          id="code"
          name="code"
          value={formData.code || ''}
          onChange={handleFormInputChange}
          required
          placeholder="E.g., SUMMER25"
          disabled={isEditing} // Code cannot be edited after creation
          className={isEditing ? "bg-muted/50 cursor-not-allowed" : ""}
        />
        {isEditing && <p className="text-xs text-muted-foreground mt-1">Coupon code cannot be changed after creation.</p>}
      </div>

      <div>
        <Label htmlFor="discountPercentage" className="font-body">Discount Percentage *</Label>
        <Input
          id="discountPercentage"
          name="discountPercentage"
          type="number"
          value={formData.discountPercentage === undefined ? '' : formData.discountPercentage}
          onChange={handleFormInputChange}
          required
          min="1"
          max="100"
          placeholder="E.g., 10 for 10%"
        />
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="usageLimit" className="font-body">Total Usage Limit (Optional)</Label>
          <Input
            id="usageLimit"
            name="usageLimit"
            type="number"
            value={formData.usageLimit === undefined ? '' : formData.usageLimit}
            onChange={handleFormInputChange}
            min="1"
            placeholder="E.g., 100"
          />
           <p className="text-xs text-muted-foreground mt-1">Leave blank for unlimited uses.</p>
        </div>
        <div>
          <Label htmlFor="expiresAt" className="font-body">Expiry Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.expiresAt && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.expiresAt ? format(new Date(formData.expiresAt), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.expiresAt ? new Date(formData.expiresAt) : undefined}
                onSelect={handleDateChange}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground mt-1">Leave blank for no expiry.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="isActive"
          name="isActive"
          checked={formData.isActive ?? true}
          onCheckedChange={(checked) => handleFormInputChange({ target: { name: 'isActive', value: '', type: 'checkbox', checked } } as any)}
        />
        <Label htmlFor="isActive" className="font-body">Active</Label>
      </div>
    </form>
  );
}

CouponFormFieldsComponent.displayName = 'CouponFormFields';
export default React.memo(CouponFormFieldsComponent);
