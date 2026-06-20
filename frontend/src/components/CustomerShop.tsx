import { useCustomerShop } from '../hooks/useCustomerShop';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Search, Sparkles, Filter, AlertCircle, ShoppingCart } from 'lucide-react';

interface CustomerShopProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function CustomerShop({ showToast }: CustomerShopProps) {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    handleSearchChange,
    categories,
    isCategoriesLoading,
    products,
    isProductsLoading,
    handleAddToCart,
  } = useCustomerShop({ showToast });

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card/45 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search custom drops..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-background/50 border-muted text-white w-full rounded-xl"
          />
        </div>

        {/* Category Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0 mr-1" />
          <Button
            size="sm"
            variant={selectedCategory === undefined ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(undefined)}
            className="rounded-full text-xs"
          >
            All Drops
          </Button>
          {isCategoriesLoading ? (
            <span className="text-xs text-muted-foreground">Loading categories...</span>
          ) : (
            categories.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.id)}
                className="rounded-full text-xs whitespace-nowrap"
              >
                {cat.name}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Products Grid */}
      {isProductsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="bg-card/45 border-white/10 animate-pulse h-[360px] rounded-3xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-card/25 border border-white/5 rounded-3xl backdrop-blur-md space-y-3">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h4 className="text-lg font-bold text-white font-outfit">No products found</h4>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We couldn't find any products matching your selection. Try a different search query or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const hasImage = product.images && product.images.length > 0;
            const primaryImage = hasImage ? product.images![0].url : '';
            const isOutOfStock = product.stockStatus === 'outstock';

            return (
              <Card
                key={product.id}
                className="group bg-card/40 border-white/10 backdrop-blur-2xl hover:border-indigo-500/30 shadow-xl hover:shadow-indigo-500/5 transition duration-300 rounded-3xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image Zone */}
                  <div className="relative aspect-video w-full bg-white/5 flex items-center justify-center overflow-hidden border-b border-white/5">
                    {hasImage ? (
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <Sparkles className="h-10 w-10 text-indigo-400/40 animate-pulse" />
                    )}

                    {/* Stock status indicator */}
                    <span
                      className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isOutOfStock
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {isOutOfStock ? 'Sold Out' : 'In Stock'}
                    </span>

                    {/* Category Label */}
                    {product.category && (
                      <span className="absolute bottom-3 left-3 text-[9px] bg-black/60 backdrop-blur-md text-indigo-300 border border-white/10 px-2 py-0.5 rounded-md font-medium">
                        {product.category.name}
                      </span>
                    )}
                  </div>

                  {/* Details Zone */}
                  <div className="p-5 space-y-2">
                    <h4 className="font-bold text-white text-base font-outfit truncate group-hover:text-indigo-300 transition duration-200">
                      {product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]">
                      {product.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Purchase Button Zone */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-4 border-t border-white/5 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Price</span>
                    <span className="text-lg font-extrabold text-white font-outfit">${product.price.toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    size="sm"
                    className={`rounded-xl shadow-md transition duration-200 ${
                      isOutOfStock
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Drop
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
