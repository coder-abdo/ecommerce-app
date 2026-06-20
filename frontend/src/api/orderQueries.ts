import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Product } from './productQueries';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  address: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export function useMyOrdersQuery() {
  return useQuery<Order[], Error>({
    queryKey: ['orders', 'my'],
    queryFn: async () => {
      const response = await fetch('/api/orders/my');
      if (!response.ok) {
        throw new Error('Failed to retrieve order history');
      }
      return response.json();
    },
  });
}

export function useAllOrdersQuery() {
  return useQuery<Order[], Error>({
    queryKey: ['orders', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/orders/all');
      if (!response.ok) {
        throw new Error('Failed to retrieve system orders');
      }
      return response.json();
    },
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, CreateOrderInput>({
    mutationFn: async (orderData) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to place order');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refetch products to sync stock status
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; status: string }, Error, { id: number; status: string }>({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update order status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] });
    },
  });
}
