import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppDispatch } from '../store';
import { setCart, CartItem } from '../store/cartSlice';

export function useCartQuery(enabled: boolean = true) {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to load cart');
      }
      const data = await response.json();
      const items: CartItem[] = data.map((item: any) => ({
        id: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.images && item.product.images.length > 0 ? item.product.images[0].url : undefined,
      }));
      dispatch(setCart(items));
      return items;
    },
    enabled,
    retry: false,
    staleTime: Infinity,
  });
}

export function useSyncCartMutation() {
  return useMutation({
    mutationFn: async (items: CartItem[]) => {
      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to sync cart to server');
      }
      return response.json();
    },
  });
}
