import { useMyOrdersQuery, Order } from '../api/orderQueries';

export function useCustomerOrders() {
  const myOrdersQuery = useMyOrdersQuery();
  const orders = myOrdersQuery.data || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyles = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'shipped':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
    }
  };

  const getTimelineStep = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  return {
    orders,
    isLoading: myOrdersQuery.isLoading,
    formatDate,
    getStatusStyles,
    getTimelineStep,
  };
}
