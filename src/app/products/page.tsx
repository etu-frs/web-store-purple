
"use client";

import { useMemo } from 'react'; 
import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Heart, PackageOpen } from 'lucide-react'; 
import type { Product, Category, SortOption } from '@/lib/types';
import { ProductGridSkeleton } from '@/components/products/ProductGridSkeleton';
import { PageLoader } from '@/components/shared/PageLoader';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { ProductGrid } from '@/components/products/ProductGrid';


export default function ProductsPage() {
  const { products, categories, wishlist, filterOptions, setFilterOptions, appDataLoaded } = useAppContext();

  const filteredAndSortedProducts = useMemo(() => {
    let displayedProducts = [...products];

    if (filterOptions.showWishlistOnly) {
      displayedProducts = displayedProducts.filter(p => wishlist.includes(p.id));
    }

    if (filterOptions.searchTerm) {
      const searchTermLower = filterOptions.searchTerm.toLowerCase();
      displayedProducts = displayedProducts.filter(p =>
        p.name.toLowerCase().includes(searchTermLower) ||
        p.description.toLowerCase().includes(searchTermLower) ||
        p.keywords.some(k => k.toLowerCase().includes(searchTermLower))
      );
    }

    if (filterOptions.category && filterOptions.category !== 'all') {
      displayedProducts = displayedProducts.filter(p => p.category === filterOptions.category);
    }

    switch (filterOptions.sortOption) {
      case 'price-asc':
        displayedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        displayedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        displayedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        displayedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'likes-desc':
        displayedProducts.sort((a, b) => b.likes - a.likes);
        break;
      case 'rating-desc':
        displayedProducts.sort((a, b) => b.rating - a.rating);
        break;
      default: 
        displayedProducts.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return displayedProducts;
  }, [products, filterOptions, wishlist]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions(prev => ({ ...prev, searchTerm: event.target.value }));
  };

  const handleCategoryChange = (value: string) => {
    setFilterOptions(prev => ({ ...prev, category: value === 'all' ? 'all' : value as Category }));
  };

  const handleSortChange = (value: string) => {
    setFilterOptions(prev => ({ ...prev, sortOption: value as SortOption }));
  };

  const toggleShowWishlistOnly = () => {
    setFilterOptions(prev => ({ ...prev, showWishlistOnly: !prev.showWishlistOnly }));
  };

  if (!appDataLoaded) {
    return <PageLoader message="Loading products..." />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-headline font-bold text-primary">Our Products</h1>
          <p className="text-xl text-foreground/80 mt-2 font-body">Explore our collection of high-quality items.</p>
        </div>

        <div className="bg-card p-4 rounded-lg shadow-md mb-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
            <div className="relative w-full sm:flex-grow lg:max-w-xs xl:max-w-sm">
              <Input
                id="search-products-top"
                type="text"
                placeholder="Search by name, keyword..."
                value={filterOptions.searchTerm || ''}
                onChange={handleSearchChange}
                className="pl-10 w-full"
                aria-label="Search products"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>

            <div className="w-full sm:w-auto sm:min-w-[150px] md:min-w-[180px]">
              <Select value={filterOptions.category || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category-filter-top" className="w-full" aria-label="Filter by category">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto sm:min-w-[150px] md:min-w-[180px]">
              <Select value={filterOptions.sortOption || 'default'} onValueChange={handleSortChange}>
                <SelectTrigger id="sort-order-top" className="w-full" aria-label="Sort products by">
                  <SelectValue placeholder="Sort products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  <SelectItem value="likes-desc">Most Liked</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <Button 
                onClick={toggleShowWishlistOnly} 
                variant={filterOptions.showWishlistOnly ? "default" : "outline"}
                className="w-full sm:w-auto"
                aria-label={filterOptions.showWishlistOnly ? "Show all products" : `Show wishlist items (${wishlist.length})`}
              >
                <Heart className={`mr-2 h-5 w-5 ${filterOptions.showWishlistOnly ? 'fill-current' : ''}`} />
                {filterOptions.showWishlistOnly ? 'Show All' : `Wishlist (${wishlist.length})`}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {appDataLoaded ? (
            filteredAndSortedProducts.length > 0 ? (
              <ProductGrid products={filteredAndSortedProducts} />
            ) : (
              <div className="text-center py-16">
                <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-headline mb-2">No Products Found</h2>
                <p className="text-muted-foreground font-body">
                  {filterOptions.showWishlistOnly && wishlist.length === 0 
                    ? "Your wishlist is empty. Add some products you love!"
                    : "Try adjusting your search or filter criteria, or check back later!"}
                </p>
                {filterOptions.showWishlistOnly && wishlist.length === 0 && (
                  <Button onClick={() => setFilterOptions(prev => ({...prev, showWishlistOnly: false}))} className="mt-4">
                    View All Products
                  </Button>
                )}
              </div>
            )
          ) : <ProductGridSkeleton count={8} /> }
        </div>
      </main>
      <Footer />
    </div>
  );
}
