
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import type { Product as ProductType, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Search, ChevronDown, ChevronUp, Package, Loader2, Tag, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { Badge } from '@/components/ui/badge'; 
import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';

const ProductFormFields = dynamic(() => import('@/components/admin/products/ProductFormFields'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 min-h-[300px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading form...
    </div>
  ),
});

const ConfirmationModal = dynamic(() => import('@/components/common/ConfirmationModal').then(mod => mod.ConfirmationModal), {
  ssr: false,
  loading: () => <Button variant="destructive" size="icon" disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>,
});


export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, homepageSettings, setHomepageSettings } = useAppContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ProductType | 'name' | 'category' | 'price' | 'originalPrice' | 'stock'; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  
  const [formData, setFormData] = useState<Partial<ProductType>>({});
  const [formImages, setFormImages] = useState<string[]>([]); 
  const [formKeywords, setFormKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [calculatedDiscount, setCalculatedDiscount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');


  useEffect(() => {
    if (editingProduct) {
        setFormData({ ...editingProduct });
        setFormImages(editingProduct.images.length > 0 ? [...editingProduct.images] : []);
        setFormKeywords([...editingProduct.keywords]);
        if (editingProduct.price && editingProduct.originalPrice && editingProduct.originalPrice > editingProduct.price) {
            const discount = ((editingProduct.originalPrice - editingProduct.price) / editingProduct.originalPrice) * 100;
            setCalculatedDiscount(parseFloat(discount.toFixed(1)));
        } else {
            setCalculatedDiscount(null);
        }
    } else {
        setFormData({ name: '', description: '', price: 0, originalPrice: undefined, category: categories[0] || undefined, stock: 0 });
        setFormImages([]);
        setFormKeywords([]);
        setCalculatedDiscount(null);
    }
  }, [editingProduct, categories]);

   useEffect(() => { 
    if (formData.price && formData.originalPrice && formData.originalPrice > formData.price) {
      const discount = ((formData.originalPrice - formData.price) / formData.originalPrice) * 100;
      setCalculatedDiscount(parseFloat(discount.toFixed(1)));
    } else {
      setCalculatedDiscount(null);
    }
  }, [formData.price, formData.originalPrice]);


  const filteredProducts = useMemo(() => {
    let sortableProducts = [...products];
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        const valA = a[sortConfig.key as keyof ProductType];
        const valB = b[sortConfig.key as keyof ProductType];
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          return sortConfig.direction === 'ascending' ? (valA === valB ? 0 : valA ? -1 : 1) : (valA === valB ? 0 : valA ? 1 : -1)
        }
        if (valA === undefined && valB !== undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA !== undefined && valB === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        
        return 0;
      });
    }
    return sortableProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.keywords.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm, sortConfig]);

  const requestSort = (key: keyof ProductType | 'name' | 'category' | 'price' | 'originalPrice' | 'stock') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof ProductType | 'name' | 'category' | 'price' | 'originalPrice' | 'stock') => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };
  
  const openFormForNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (product: ProductType) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };
  
  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number | undefined = value;
    if (name === 'price' || name === 'originalPrice' || name === 'stock') {
      parsedValue = value === '' ? undefined : parseFloat(value);
      if (parsedValue !== undefined && isNaN(parsedValue)) parsedValue = name === 'stock' ? 0 : undefined;
    }
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value as Category }));
  };

  const handleImageFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImagePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
        });
      });
      try {
        const newImageDataUris = await Promise.all(newImagePromises);
        setFormImages(prevImages => [...prevImages, ...newImageDataUris]);
      } catch (error) {
        console.error("Error reading files:", error);
        toast({ title: "Error Reading Files", description: "Could not process some selected images.", variant: "destructive" });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
    }
  };

  const handleRemoveFormImage = (indexToRemove: number) => {
    setFormImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleAddKeyword = () => {
    if (newKeywordInput && !formKeywords.includes(newKeywordInput.trim().toLowerCase())) {
      setFormKeywords(prev => [...prev, newKeywordInput.trim().toLowerCase()]);
      setNewKeywordInput('');
    }
  };
  const handleRemoveKeyword = (kw: string) => {
    setFormKeywords(prev => prev.filter(k => k !== kw));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price == null || formData.stock == null || !formData.category) {
      toast({ title: "Validation Error", description: "Please fill all required fields (Name, Price, Stock, Category).", variant: "destructive"});
      return;
    }
    if (formData.originalPrice !== undefined && formData.price !== undefined && formData.originalPrice <= formData.price) {
        toast({ title: "Pricing Error", description: "Original price must be greater than the current price if specified.", variant: "destructive"});
        return;
    }

    if (formImages.length === 0) {
        toast({ title: "Validation Error", description: "At least one image is required.", variant: "destructive"});
        return;
    }

    const productDataToSave: Omit<ProductType, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'numReviews' | 'likes'> & { originalPrice?: number } = {
      name: formData.name,
      description: formData.description || '',
      price: formData.price!,
      originalPrice: formData.originalPrice === undefined || formData.originalPrice === null || isNaN(formData.originalPrice) ? undefined : formData.originalPrice,
      category: formData.category!,
      stock: formData.stock!,
      images: formImages, 
      keywords: formKeywords,
    };

    try {
        if (editingProduct) {
          updateProduct({ ...editingProduct, ...productDataToSave });
        } else {
          addProduct(productDataToSave as Omit<ProductType, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'numReviews' | 'likes'>);
        }
        setIsFormOpen(false);
        setEditingProduct(null); 
    } catch (error: any) {
         toast({ title: "Error Saving Product", description: error.message || "An unexpected error occurred.", variant: "destructive"});
    }
  };

    const handleAddCategory = () => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory && !categories.find(c => c.toLowerCase() === trimmedCategory.toLowerCase())) {
        const updatedSettings = {
            ...homepageSettings,
            categories: [...categories, trimmedCategory].sort()
        };
        setHomepageSettings(updatedSettings);
        setNewCategory('');
    } else {
      toast({ title: "Cannot Add Category", description: "Category is empty or already exists.", variant: "destructive" });
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    if (products.some(p => p.category === categoryToRemove)) {
      toast({
        title: "Cannot Delete Category",
        description: `This category is in use by products. Please reassign products before deleting.`,
        variant: "destructive",
        duration: 7000,
      });
      return;
    }
    const updatedSettings = {
        ...homepageSettings,
        categories: categories.filter(c => c !== categoryToRemove)
    };
    setHomepageSettings(updatedSettings);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center"><Package className="mr-3 h-8 w-8"/>Manage Products</h1>
        <div className="flex items-center gap-2">
            <Button onClick={openFormForNew} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
            </Button>
            <Button onClick={() => setIsCategoryManagerOpen(true)} variant="outline">
                <Tag className="mr-2 h-5 w-5" /> Manage Categories
            </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-body">Product List</CardTitle>
           <CardDescription>Add, edit, or delete products from your store.</CardDescription>
          <div className="mt-4">
            <div className="relative">
                 <Input
                  placeholder="Search products by name or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm pl-10"
                  aria-label="Search products"
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
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground cursor-pointer" onClick={() => requestSort('name')}>
                    <div className="flex items-center">Name {getSortIndicator('name')}</div>
                  </th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground cursor-pointer hidden md:table-cell" onClick={() => requestSort('category')}>
                     <div className="flex items-center">Category {getSortIndicator('category')}</div>
                  </th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground cursor-pointer" onClick={() => requestSort('price')}>
                     <div className="flex items-center">Price {getSortIndicator('price')}</div>
                  </th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground cursor-pointer hidden md:table-cell" onClick={() => requestSort('originalPrice')}>
                    <div className="flex items-center">Orig. Price {getSortIndicator('originalPrice')}</div>
                  </th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground cursor-pointer" onClick={() => requestSort('stock')}>
                    <div className="flex items-center">Stock {getSortIndicator('stock')}</div>
                  </th>
                   <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground hidden lg:table-cell">Rating</th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground hidden lg:table-cell">Likes</th>
                  <th className="p-3 text-left text-xs sm:text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 align-top">
                      <div className="flex items-center space-x-3">
                        <Image 
                            src={product.images[0] || 'https://placehold.co/40x40.png?text=N/A'} 
                            alt={product.name} 
                            width={40} 
                            height={40} 
                            className="rounded-md object-cover flex-shrink-0"
                            data-ai-hint={product.images[0]?.startsWith('https://placehold.co') ? `${product.category} thumbnail` : undefined}
                        />
                        <div>
                          <div className="font-medium text-sm sm:text-base">{product.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-[150px] md:max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 align-top text-sm sm:text-base hidden md:table-cell">{product.category}</td>
                    <td className="p-3 align-top text-sm sm:text-base">
                      ${product.price.toFixed(2)}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          -{(((product.originalPrice - product.price) / product.originalPrice) * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 align-top text-sm sm:text-base hidden md:table-cell">
                      {product.originalPrice ? `$${product.originalPrice.toFixed(2)}` : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="p-3 align-top text-sm sm:text-base">{product.stock}</td>
                    <td className="p-3 align-top text-sm sm:text-base hidden lg:table-cell">{product.rating.toFixed(1)} ({product.numReviews})</td>
                    <td className="p-3 align-top text-sm sm:text-base hidden lg:table-cell">{product.likes}</td>
                    <td className="p-3 align-top">
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button variant="outline" size="icon" onClick={() => openFormForEdit(product)} title={`Edit ${product.name}`} aria-label={`Edit product ${product.name}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmationModal
                          triggerText={<Button variant="destructive" size="icon" title={`Delete ${product.name}`} aria-label={`Delete product ${product.name}`}><Trash2 className="h-4 w-4" /></Button>}
                          title="Delete Product"
                          description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                          onConfirm={() => deleteProduct(product.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
          {filteredProducts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
                {products.length === 0 ? "No products created yet." : "No products found matching your criteria."}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if(!isOpen) { setEditingProduct(null); } }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4"> 
            <ScrollArea className="max-h-[60vh] w-full pr-3">
              {isFormOpen && ( 
                <ProductFormFields
                    formData={formData}
                    setFormData={setFormData}
                    formImages={formImages}
                    setFormImages={setFormImages}
                    formKeywords={formKeywords}
                    setFormKeywords={setFormKeywords}
                    newKeywordInput={newKeywordInput}
                    setNewKeywordInput={setNewKeywordInput}
                    calculatedDiscount={calculatedDiscount}
                    categories={categories}
                    handleFormInputChange={handleFormInputChange}
                    handleCategoryChange={handleCategoryChange}
                    handleImageFilesSelected={handleImageFilesSelected}
                    handleRemoveFormImage={handleRemoveFormImage}
                    handleAddKeyword={handleAddKeyword}
                    handleRemoveKeyword={handleRemoveKeyword}
                    onSubmit={handleFormSubmit}
                    fileInputRef={fileInputRef}
                />
              )}
            </ScrollArea>
          </div>

          <DialogFooter> 
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={()=> { setIsFormOpen(false); setEditingProduct(null); }}>Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleFormSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryManagerOpen} onOpenChange={setIsCategoryManagerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center"><Tag className="mr-2 h-6 w-6"/>Category Management</DialogTitle>
            <CardDescription>Add or remove product categories for your store.</CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div>
                  <Label>Existing Categories</Label>
                  <ScrollArea className="h-32 w-full rounded-md border p-2 mt-1">
                      <div className="flex flex-wrap gap-2">
                          {categories.map(cat => (
                          <Badge key={cat} variant="secondary">
                              {cat}
                              <button onClick={() => handleRemoveCategory(cat)} className="ml-1.5 rounded-full p-0.5 hover:bg-destructive/20 text-destructive outline-none focus-visible:ring-1 focus-visible:ring-ring">
                              <span className="sr-only">Remove {cat}</span>
                              <X className="h-3 w-3" />
                              </button>
                          </Badge>
                          ))}
                      </div>
                  </ScrollArea>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="newCategory">Add New Category</Label>
                  <div className="flex gap-2">
                  <Input id="newCategory" value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => {if(e.key === 'Enter'){ e.preventDefault(); handleAddCategory()}}} placeholder="E.g. Sports Equipment"/>
                  <Button type="button" onClick={handleAddCategory}><PlusCircle className="mr-2 h-4 w-4"/>Add</Button>
                  </div>
              </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
