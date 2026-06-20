import { useAllOrdersQuery, useUpdateOrderStatusMutation, Order } from '../api/orderQueries';

interface UseAdminOrdersOptions {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function useAdminOrders({ showToast }: UseAdminOrdersOptions) {
  const allOrdersQuery = useAllOrdersQuery();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const orders = allOrdersQuery.data || [];

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus });
      showToast(`Order #${orderId} transitioned to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return {
    orders,
    isLoading: allOrdersQuery.isLoading,
    handleStatusChange,
    formatDate,
    getStatusBadgeStyle,
    isSubmitting: updateStatusMutation.isPending,
  };
}
