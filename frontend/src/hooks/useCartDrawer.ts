import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { removeItem, updateQuantity, clearCart } from '../store/cartSlice';
import { useCreateOrderMutation } from '../api/orderQueries';

interface UseCartDrawerOptions {
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onOrderPlacedSuccess: () => void;
}

export function useCartDrawer({ onClose, showToast, onOrderPlacedSuccess }: UseCartDrawerOptions) {
  const [shippingAddress, setShippingAddress] = useState('');
  const cartItems = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const createOrderMutation = useCreateOrderMutation();

  const handleUpdateQty = (id: number, currentQty: number, delta: number) => {
    dispatch(updateQuantity({ id, quantity: currentQty + delta }));
  };

  const handleRemove = (id: number) => {
    dispatch(removeItem(id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast('Your shopping cart is empty.', 'error');
      return;
    }

    if (!shippingAddress.trim()) {
      showToast('Please enter a valid shipping address.', 'error');
      return;
    }

    const payload = {
      address: shippingAddress,
      items: cartItems.map((item) => ({
        productId: item.id,
        copyId: item.id, // compatibility
        quantity: item.quantity,
      })),
    };

    try {
      await createOrderMutation.mutateAsync({
        address: payload.address,
        items: payload.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });
      showToast('Order placed successfully!', 'success');
      dispatch(clearCart());
      setShippingAddress('');
      onOrderPlacedSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return {
    shippingAddress,
    setShippingAddress,
    cartItems,
    handleUpdateQty,
    handleRemove,
    calculateSubtotal,
    handleCheckout,
    isSubmitting: createOrderMutation.isPending,
  };
}
