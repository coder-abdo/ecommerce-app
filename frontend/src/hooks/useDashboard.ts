import { useState } from 'react';
import { useAppSelector } from '../store';
import { useLogoutMutation } from '../api/authQueries';
import { useProductsQuery, useCategoriesQuery } from '../api/productQueries';
import { useAllOrdersQuery } from '../api/orderQueries';

interface UseDashboardOptions {
  onLogout: () => void;
}

export function useDashboard({ onLogout }: UseDashboardOptions) {
  const user = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const logoutMutation = useLogoutMutation(onLogout);

  const isAdmin = user.role === 'admin';
  const [activeTab, setActiveTab] = useState<string>(isAdmin ? 'overview' : 'shop');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Stats queries (only active/loaded if needed)
  const productsQuery = useProductsQuery();
  const categoriesQuery = useCategoriesQuery();
  const allOrdersQuery = useAllOrdersQuery();

  const handleLogoutClick = () => {
    logoutMutation.mutate();
  };

  const handleOrderPlacedSuccess = () => {
    setActiveTab('orders');
  };

  // Compute Cart Item Count
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Compute Admin Stats
  const allOrders = allOrdersQuery.data || [];
  const adminRevenue = allOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);
  const totalProducts = productsQuery.data?.length || 0;
  const totalOrders = allOrders.length;

  return {
    user,
    isAdmin,
    activeTab,
    setActiveTab,
    isCartOpen,
    setIsCartOpen,
    cartItemCount,
    handleLogoutClick,
    handleOrderPlacedSuccess,
    adminRevenue,
    totalProducts,
    totalOrders,
    isCategoriesLoading: categoriesQuery.isLoading,
    categoriesCount: categoriesQuery.data?.length || 0,
    isLogoutPending: logoutMutation.isPending,
  };
}
