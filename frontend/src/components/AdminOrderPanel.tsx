import { useAdminOrders } from '../hooks/useAdminOrders';
import { Card } from './ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Package, MapPin, Calendar, ShieldCheck, Mail, User, ListCollapse } from 'lucide-react';

interface AdminOrderPanelProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function AdminOrderPanel({ showToast }: AdminOrderPanelProps) {
  const {
    orders,
    isLoading,
    handleStatusChange,
    formatDate,
    getStatusBadgeStyle,
    isSubmitting,
  } = useAdminOrders({ showToast });

  return (
    <div className="space-y-6">
      
      {/* Telemetry Header */}
      <div className="flex justify-between items-center bg-card/45 border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            Global Order Dispatch Log
          </h3>
          <p className="text-xs text-muted-foreground">Modify tracking status nodes and verify shipping logs.</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-amber-400 font-outfit">{orders.length}</span>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Ledger</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <Card key={n} className="bg-card/45 border-white/10 animate-pulse h-[200px] rounded-3xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="bg-card/30 border-white/10 backdrop-blur-xl p-12 text-center rounded-3xl">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-bold text-white text-sm font-outfit">No orders placed globally</h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
            Store accounts have not logged any transaction histories yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card 
              key={order.id} 
              className="bg-card/40 border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden hover:border-white/15 transition shadow-2xl"
            >
              
              {/* Header */}
              <div className="bg-white/5 border-b border-white/5 p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                
                {/* Order ID & User info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-sm text-white font-outfit">Order ID: #{order.id}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  
                  {/* User details */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <User className="h-3.5 w-3.5 text-indigo-400" />
                      {order.user?.name || 'Guest User'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {order.user?.email || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-3 self-start md:self-auto">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-md border ${getStatusBadgeStyle(order.status)}`}>
                    {order.status}
                  </span>
                  
                  <Select 
                    value={order.status} 
                    onValueChange={(val) => handleStatusChange(order.id, val)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-32 bg-background/50 border-muted text-[11px] text-white rounded-lg h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                      <SelectItem value="processing" className="text-xs">Processing</SelectItem>
                      <SelectItem value="shipped" className="text-xs">Shipped</SelectItem>
                      <SelectItem value="delivered" className="text-xs">Delivered</SelectItem>
                      <SelectItem value="cancelled" className="text-xs font-bold text-red-400">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Order Body Details */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1 & 2: Placed Items */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-white/5 pb-2">
                    <ListCollapse className="h-3.5 w-3.5" /> Itemized Ledger
                  </div>
                  
                  <div className="space-y-3">
                    {order.items.map((item) => {
                      const hasImg = item.product?.images && item.product.images.length > 0;
                      const itemImg = hasImg ? item.product!.images![0].url : '';

                      return (
                        <div key={item.id} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                              {hasImg ? (
                                <img src={itemImg} alt={item.product?.name} className="object-cover h-full w-full" />
                              ) : (
                                <Package className="h-4 w-4 text-indigo-400/40" />
                              )}
                            </div>
                            <div>
                              <h6 className="text-xs font-bold text-white font-outfit">{item.product?.name || 'Unknown Product'}</h6>
                              <span className="text-[10px] text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-white font-outfit">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Logistics (Address & Total) */}
                <div className="space-y-5 bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                  {/* Destination */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-indigo-400" /> Logistics Destination
                    </span>
                    <p className="text-xs text-white leading-relaxed">{order.address}</p>
                  </div>

                  {/* Settle Total */}
                  <div className="flex justify-between items-end border-t border-white/5 pt-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Paid</span>
                    <span className="text-base font-extrabold text-indigo-400 font-outfit">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

              </div>

            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
