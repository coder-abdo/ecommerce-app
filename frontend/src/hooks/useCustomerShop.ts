import React, { useState } from 'react';
import { useProductsQuery, useCategoriesQuery, Product } from '../api/productQueries';
import { useAppDispatch } from '../store';
import { addItem } from '../store/cartSlice';

interface UseCustomerShopOptions {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function useCustomerShop({ showToast }: UseCustomerShopOptions) {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const dispatch = useAppDispatch();

  // Queries
  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductsQuery({
    categoryId: selectedCategory,
    search: debouncedSearch,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const handler = setTimeout(() => {
      setDebouncedSearch(e.target.value);
    }, 400);
    return () => clearTimeout(handler);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stockStatus === 'outstock') {
      showToast('Product is currently out of stock', 'error');
      return;
    }

    const firstImageUrl = product.images && product.images.length > 0 ? product.images[0].url : undefined;
    
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: firstImageUrl,
      })
    );
    showToast(`Added ${product.name} to cart!`, 'success');
  };

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    handleSearchChange,
    categories: categoriesQuery.data || [],
    isCategoriesLoading: categoriesQuery.isLoading,
    products: productsQuery.data || [],
    isProductsLoading: productsQuery.isLoading,
    handleAddToCart,
  };
}
