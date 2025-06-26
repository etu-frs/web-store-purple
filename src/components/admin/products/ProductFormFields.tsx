
"use client";

import React from 'react';
import Image from 'next/image';
import type { Product as ProductType, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Info, UploadCloud, X, Trash2 } from 'lucide-react';

interface ProductFormFieldsProps {
  formData: Partial<ProductType>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<ProductType>>>;
  formImages: string[];
  setFormImages: React.Dispatch<React.SetStateAction<string[]>>;
  formKeywords: string[];
  setFormKeywords: React.Dispatch<React.SetStateAction<string[]>>;
  newKeywordInput: string;
  setNewKeywordInput: React.Dispatch<React.SetStateAction<string>>;
  calculatedDiscount: number | null;
  categories: Category[];
  handleFormInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCategoryChange: (value: string) => void;
  handleImageFilesSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFormImage: (indexToRemove: number) => void;
  handleAddKeyword: () => void;
  handleRemoveKeyword: (kw: string) => void;
  onSubmit: (e: React.FormEvent) => void; // This prop is handleFormSubmit from AdminProductsPage
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ProductFormFieldsComponent: React.FC<ProductFormFieldsProps> = ({
  formData,
  setFormData,
  formImages,
  setFormImages,
  formKeywords,
  setFormKeywords,
  newKeywordInput,
  setNewKeywordInput,
  calculatedDiscount,
  categories,
  handleFormInputChange,
  handleCategoryChange,
  handleImageFilesSelected,
  handleRemoveFormImage,
  handleAddKeyword,
  handleRemoveKeyword,
  onSubmit, // Prop received
  fileInputRef,
}) => {
  const handleInternalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default HTML form submission
    // The actual submission logic is handled by the button's onClick in the parent Dialog (via the onSubmit prop if it were used as a direct form handler)
    // In this setup, the `onSubmit` prop which IS `handleFormSubmit` is called by an external button's onClick.
    // So, this primarily prevents accidental Enter-key submissions if any input field was focused.
  };

  return (
    <form className="space-y-6 pb-4" onSubmit={handleInternalFormSubmit}> {/* Added onSubmit to prevent default */}
      <div>
        <Label htmlFor="name" className="font-body">Product Name *</Label>
        <Input id="name" name="name" value={formData.name || ''} onChange={handleFormInputChange} required />
      </div>

      <div>
        <Label htmlFor="description" className="font-body">Description</Label>
        <Textarea id="description" name="description" value={formData.description || ''} onChange={handleFormInputChange} rows={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="font-body">Current Price *</Label>
          <Input id="price" name="price" type="number" value={formData.price === undefined ? '' : formData.price} onChange={handleFormInputChange} required step="0.01" min="0"/>
        </div>
        <div>
          <Label htmlFor="originalPrice" className="font-body">Original Price (Optional)</Label>
          <Input id="originalPrice" name="originalPrice" type="number" value={formData.originalPrice === undefined ? '' : formData.originalPrice} onChange={handleFormInputChange} step="0.01" min="0"/>
          {calculatedDiscount !== null && (
              <p className="text-xs text-green-600 mt-1 flex items-center">
                  <Info className="h-3 w-3 mr-1" /> Discount: {calculatedDiscount}%
              </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock" className="font-body">Stock Quantity *</Label>
          <Input id="stock" name="stock" type="number" value={formData.stock === undefined ? '' : formData.stock} onChange={handleFormInputChange} required step="1" min="0"/>
        </div>
        <div>
          <Label htmlFor="category" className="font-body">Category *</Label>
          <Select name="category" value={formData.category || ''} onValueChange={handleCategoryChange} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </div>

      <div>
        <Label className="font-body">Keywords</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formKeywords.map(kw => (
            <Badge key={kw} variant="secondary" className="flex items-center">
              {kw}
              <Button type="button" variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-destructive/20" onClick={() => handleRemoveKeyword(kw)} aria-label={`Remove keyword ${kw}`}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add keyword"
            value={newKeywordInput}
            onChange={(e) => setNewKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword();}}}
          />
          <Button type="button" onClick={handleAddKeyword} variant="outline">Add</Button>
        </div>
      </div>

      <div>
        <Label className="font-body mb-2 block">Product Images *</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
          {formImages.map((imgSrc, idx) => (
            <div key={idx} className="relative group aspect-square border rounded-md overflow-hidden">
              <Image
                src={imgSrc}
                alt={`Product image ${idx + 1}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint="product image form"
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100.png?text=Error')}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveFormImage(idx)}
                aria-label={`Remove image ${idx + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <UploadCloud className="mr-2 h-5 w-5" /> Add Images from Device
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleImageFilesSelected}
          className="hidden"
        />
        {formImages.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">No images selected. At least one image is required.</p>
        )}
         <p className="text-xs text-muted-foreground mt-1">First image will be the primary display image.</p>
      </div>
    </form>
  );
}

ProductFormFieldsComponent.displayName = 'ProductFormFields';
export default React.memo(ProductFormFieldsComponent);
