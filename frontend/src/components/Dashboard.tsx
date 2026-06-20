import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogOut, 
  Database, 
  ShieldAlert, 
  CheckCircle,
  ShoppingCart,
  ListOrdered,
  DollarSign,
  Package
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

// Subcomponents
import CustomerShop from './CustomerShop';
import CartDrawer from './CartDrawer';
import CustomerOrders from './CustomerOrders';
import CustomerProfile from './CustomerProfile';
import AdminProductPanel from './AdminProductPanel';
import AdminOrderPanel from './AdminOrderPanel';

interface DashboardProps {
  onLogout: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function Dashboard({ onLogout, showToast }: DashboardProps) {
  const {
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
    isCategoriesLoading,
    categoriesCount,
    isLogoutPending,
  } = useDashboard({ onLogout });

  return (
    <div className="w-full max-w-6xl px-4 py-8 mx-auto space-y-6">
      
      {/* Top Header / Navigation */}
      <header className="flex justify-between items-center bg-card/45 border border-white/10 p-4 rounded-2xl backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">⚡</span>
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent font-outfit">
            GadgetHub
          </h2>
        </div>

        {/* Dynamic sub navigation tabs based on user role */}
        <nav className="hidden md:flex items-center bg-white/5 border border-white/5 p-1 rounded-xl gap-1">
          {isAdmin ? (
            <>
              <button 
                onClick={() => setActiveTab('overview')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-muted-foreground hover:text-white'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-muted-foreground hover:text-white'}`}
              >
                Products Manager
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-muted-foreground hover:text-white'}`}
              >
                Orders Manager
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('shop')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition ${activeTab === 'shop' ? 'bg-indigo-600 text-white shadow-md' : 'text-muted-foreground hover:text-white'}`}
              >
                Shop Products
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-muted-foreground hover:text-white'}`}
              >
                My Orders
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-muted-foreground hover:text-white'}`}
              >
                Account Profile
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          
          {/* Shopping Cart Trigger icon (Customers only) */}
          {!isAdmin && (
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition group text-white"
            >
              <ShoppingCart className="h-4.5 w-4.5 text-indigo-300 group-hover:scale-105 transition" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 border border-white/20 text-[9px] font-extrabold h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* User profile tags */}
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-white">{user.name || 'Guest User'}</span>
            <span 
              className={`text-[9px] px-2 py-0.5 rounded-full border font-extrabold uppercase tracking-wider ${
                isAdmin 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              }`}
            >
              {user.role || 'customer'}
            </span>
          </div>

          {/* Log Out */}
          <Button 
            onClick={handleLogoutClick} 
            disabled={isLogoutPending}
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-white hover:bg-destructive/10 hover:border-destructive/30 border border-transparent rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            {isLogoutPending ? 'Logging Out...' : 'Log Out'}
          </Button>
        </div>
      </header>

      {/* Mobile Sub Navigation (Horizontal Scrollable menu) */}
      <nav className="flex md:hidden items-center bg-white/5 border border-white/5 p-1 rounded-xl gap-1 overflow-x-auto scrollbar-none">
        {isAdmin ? (
          <>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-lg whitespace-nowrap transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-muted-foreground'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-lg whitespace-nowrap transition ${activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-muted-foreground'}`}
            >
              Products Manager
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-lg whitespace-nowrap transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-muted-foreground'}`}
            >
              Orders Manager
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setActiveTab('shop')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-lg whitespace-nowrap transition ${activeTab === 'shop' ? 'bg-indigo-600 text-white' : 'text-muted-foreground'}`}
            >
              Shop Products
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-lg whitespace-nowrap transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-muted-foreground'}`}
            >
              My Orders
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`text-xs font-semibold px-4 py-2.5 rounded-lg whitespace-nowrap transition ${activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-muted-foreground'}`}
            >
              Account Profile
            </button>
          </>
        )}
      </nav>

      {/* RENDER VIEWS BASED ON TAB */}

      {/* 1. ADMIN OVERVIEW TAB */}
      {isAdmin && activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Stats Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sales Revenue */}
            <Card className="bg-card/45 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Revenue</span>
                  <h4 className="text-2xl font-extrabold text-indigo-400 font-outfit">${adminRevenue.toFixed(2)}</h4>
                </div>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                  <DollarSign className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* Total Products */}
            <Card className="bg-card/45 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Products Listed</span>
                  <h4 className="text-2xl font-extrabold text-purple-400 font-outfit">{totalProducts}</h4>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
                  <Package className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="bg-card/45 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Orders</span>
                  <h4 className="text-2xl font-extrabold text-amber-400 font-outfit">{totalOrders}</h4>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                  <ListOrdered className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Database System Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Database details */}
            <Card className="bg-card/45 border-white/10 backdrop-blur-xl md:col-span-2 flex flex-col justify-between">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-outfit flex items-center gap-1.5">
                  <Database className="h-4.5 w-4.5 text-indigo-400" />
                  Primary GORM SQLite Database Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Active User Nodes:</span>
                    <span className="text-white font-bold font-outfit">Secure</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Category Tables:</span>
                    <span className="text-white font-bold font-outfit">{isCategoriesLoading ? '...' : categoriesCount} Registered Categories</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Product Images Indexed:</span>
                    <span className="text-white font-bold font-outfit">Cascading</span>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] text-muted-foreground mt-4">
                  ⚡ Telemetry node displays real-time statistics pulled from your SQLite engine database schemas.
                </div>
              </CardContent>
            </Card>

            {/* Supervisor system stats */}
            <Card className="bg-card/45 border-white/10 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-outfit flex items-center gap-1.5">
                    <ShieldAlert className="h-4.5 w-4.5 text-amber-400" />
                    Security Broker
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 text-xs text-muted-foreground leading-relaxed">
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-emerald-400 font-semibold mb-2">
                    <CheckCircle className="h-4.5 w-4.5" />
                    Admin Session Validated
                  </div>
                  You are viewing the administration control deck. Restrict token sharing and secure database ports when accessing telemetry views.
                </CardContent>
              </div>
            </Card>
          </div>

        </div>
      )}

      {/* 2. ADMIN PRODUCTS PANEL */}
      {isAdmin && activeTab === 'products' && (
        <AdminProductPanel showToast={showToast} />
      )}

      {/* 3. ADMIN ORDERS PANEL */}
      {isAdmin && activeTab === 'orders' && (
        <AdminOrderPanel showToast={showToast} />
      )}

      {/* 4. CUSTOMER SHOP TAB */}
      {!isAdmin && activeTab === 'shop' && (
        <CustomerShop showToast={showToast} />
      )}

      {/* 5. CUSTOMER ORDERS TAB */}
      {!isAdmin && activeTab === 'orders' && (
        <CustomerOrders />
      )}

      {/* 6. CUSTOMER PROFILE TAB */}
      {!isAdmin && activeTab === 'profile' && (
        <CustomerProfile showToast={showToast} />
      )}

      {/* Customer Shopping Cart Slide drawer */}
      {!isAdmin && (
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          showToast={showToast}
          onOrderPlacedSuccess={handleOrderPlacedSuccess}
        />
      )}

    </div>
  );
}
