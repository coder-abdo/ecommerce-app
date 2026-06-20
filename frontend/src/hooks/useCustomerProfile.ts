import React, { useState } from 'react';
import { useAppSelector } from '../store';
import { useUpdateProfileMutation } from '../api/authQueries';
import { useMyOrdersQuery } from '../api/orderQueries';

interface UseCustomerProfileOptions {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function useCustomerProfile({ showToast }: UseCustomerProfileOptions) {
  const user = useAppSelector((state) => state.auth);

  const [displayName, setDisplayName] = useState(user.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const myOrdersQuery = useMyOrdersQuery();
  const orders = myOrdersQuery.data || [];

  const updateProfileMutation = useUpdateProfileMutation();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }

    const payload: { name?: string; password?: string } = {};

    if (displayName.trim() !== user.name) {
      payload.name = displayName.trim();
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
      }
      payload.password = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      showToast('No modifications specified.', 'error');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync(payload);
      showToast('Account profile updated successfully!', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Compute metrics
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const totalSpent = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, order) => acc + order.totalAmount, 0);

  return {
    user,
    displayName,
    setDisplayName,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    ordersCount: orders.length,
    activeOrders,
    totalSpent,
    handleUpdateProfile,
    isSubmitting: updateProfileMutation.isPending,
    isGoogleUser: user.authMethod === 'Google',
  };
}
