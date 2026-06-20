import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { removeItem, updateQuantity, clearCart } from '../store/cartSlice';
import { useCreateOrderMutation } from '../api/orderQueries';

interface UseCartDrawerOptions {
  showToast: (message: string, type?: 'success' | 'error') => void;
  onOrderPlacedSuccess: () => void;
}

export function useCartDrawer({ showToast, onOrderPlacedSuccess }: UseCartDrawerOptions) {
  const [step, setStep] = useState(1); // 1: Cart, 2: Shipping, 3: Payment, 4: Success
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'next_day'>('standard');

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'crypto' | 'cod'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

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

  const getShippingCost = (method: string) => {
    switch (method) {
      case 'express':
        return 15;
      case 'next_day':
        return 35;
      default:
        return 0;
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() + getShippingCost(shippingMethod);
  };

  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    const limited = clean.substring(0, 16);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    const limited = clean.substring(0, 4);
    let formatted = limited;
    if (limited.length > 2) {
      formatted = limited.substring(0, 2) + '/' + limited.substring(2);
    }
    setCardExpiry(formatted);
  };

  const handleCardCvvChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setCardCvv(clean.substring(0, 4));
  };

  const validateShipping = () => {
    if (!recipientName.trim()) {
      showToast('Recipient Name is required.', 'error');
      return false;
    }
    if (!recipientPhone.trim()) {
      showToast('Recipient Phone is required.', 'error');
      return false;
    }
    if (!addressLine1.trim()) {
      showToast('Address Line 1 is required.', 'error');
      return false;
    }
    if (!city.trim()) {
      showToast('City is required.', 'error');
      return false;
    }
    if (!state.trim()) {
      showToast('State/Province is required.', 'error');
      return false;
    }
    if (!postalCode.trim()) {
      showToast('ZIP/Postal Code is required.', 'error');
      return false;
    }
    if (!country.trim()) {
      showToast('Country is required.', 'error');
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (paymentMethod === 'credit_card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 16) {
        showToast('Please enter a valid 16-digit card number.', 'error');
        return false;
      }
      if (cardExpiry.length < 5) {
        showToast('Please enter expiry in MM/YY format.', 'error');
        return false;
      }
      if (cardCvv.length < 3) {
        showToast('Please enter a valid CVV (3-4 digits).', 'error');
        return false;
      }
      if (!cardHolder.trim()) {
        showToast('Cardholder Name is required.', 'error');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1) {
      if (cartItems.length === 0) {
        showToast('Your shopping cart is empty.', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (validateShipping()) {
        setStep(3);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (cartItems.length === 0) {
      showToast('Your shopping cart is empty.', 'error');
      return;
    }

    if (!validateShipping() || !validatePayment()) {
      return;
    }

    const payload = {
      recipientName,
      recipientPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      shippingMethod,
      shippingCost: getShippingCost(shippingMethod),
      paymentMethod,
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      await createOrderMutation.mutateAsync(payload);
      showToast('Order placed successfully!', 'success');
      dispatch(clearCart());
      onOrderPlacedSuccess();
      setStep(4);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const resetCheckout = () => {
    setStep(1);
    setRecipientName('');
    setRecipientPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('United States');
    setShippingMethod('standard');
    setPaymentMethod('credit_card');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardHolder('');
  };

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    resetCheckout,
    recipientName,
    setRecipientName,
    recipientPhone,
    setRecipientPhone,
    addressLine1,
    setAddressLine1,
    addressLine2,
    setAddressLine2,
    city,
    setCity,
    state,
    setState,
    postalCode,
    setPostalCode,
    country,
    setCountry,
    shippingMethod,
    setShippingMethod,
    paymentMethod,
    setPaymentMethod,
    cardNumber,
    handleCardNumberChange,
    cardExpiry,
    handleCardExpiryChange,
    cardCvv,
    handleCardCvvChange,
    cardHolder,
    setCardHolder,
    cartItems,
    handleUpdateQty,
    handleRemove,
    calculateSubtotal,
    getShippingCost,
    calculateTotal,
    handleCheckout,
    isSubmitting: createOrderMutation.isPending,
  };
}
