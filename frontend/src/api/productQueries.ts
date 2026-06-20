import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockStatus: 'instock' | 'outstock';
  categoryId: number;
  category?: Category;
  images?: ProductImage[];
  adminId: number;
  createdAt: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stockStatus: 'instock' | 'outstock';
  categoryId: number;
  imageUrls: string[];
}

export function useCategoriesQuery() {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, { name: string }>({
    mutationFn: async (data) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useProductsQuery(filters?: { categoryId?: number; search?: string }) {
  return useQuery<Product[], Error>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.categoryId) {
        params.append('categoryId', filters.categoryId.toString());
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });
}

export function useProductQuery(id: number) {
  return useQuery<Product, Error>({
    queryKey: ['products', id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateProductInput>({
    mutationFn: async (productData) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: number; data: CreateProductInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update product');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUploadImageMutation() {
  return useMutation<{ url: string }, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Image upload failed');
      }

      return response.json();
    },
  });
}
