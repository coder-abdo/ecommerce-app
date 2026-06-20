import { useCustomerOrders } from '../hooks/useCustomerOrders';
import { Card, CardContent, CardHeader } from './ui/card';
import { Calendar, Package, MapPin, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

export default function CustomerOrders() {
  const {
    orders,
    isLoading,
    formatDate,
    getStatusStyles,
    getTimelineStep,
  } = useCustomerOrders();

  return (
    <div className="space-y-6">
      
      {/* Overview Header */}
      <div className="flex justify-between items-center bg-card/45 border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white font-outfit">Your Order Ledger</h3>
          <p className="text-xs text-muted-foreground">Monitor delivery dispatch status and transaction logs.</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-indigo-400 font-outfit">{orders.length}</span>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Placed</p>
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
          <div className="h-14 w-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground mb-4">
            <Package className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-white text-base font-outfit">No purchases logged</h4>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
            You haven't purchased any custom drops yet. Place orders via the shopping cart drawer to get started!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const step = getTimelineStep(order.status);
            const isCancelled = order.status === 'cancelled';

            return (
              <Card 
                key={order.id} 
                className="bg-card/40 border-white/10 backdrop-blur-2xl hover:border-white/15 transition rounded-3xl overflow-hidden shadow-xl"
              >
                
                {/* Header */}
                <CardHeader className="bg-white/5 border-b border-white/5 p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                      <Package className="h-4.5 w-4.5 text-indigo-400" />
                      <span className="font-bold text-sm font-outfit">Order ID: #{order.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div>
                    <span 
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusStyles(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  
                  {/* Order Items List */}
                  <div className="space-y-3.5">
                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Ordered Custom Hardware</h5>
                    <div className="divide-y divide-white/5 space-y-3">
                      {order.items.map((item) => {
                        const hasImg = item.product?.images && item.product.images.length > 0;
                        const itemImg = hasImg ? item.product!.images![0].url : '';
                        
                        return (
                          <div key={item.id} className="flex items-center justify-between gap-4 pt-3 first:pt-0">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                                {hasImg ? (
                                  <img src={itemImg} alt={item.product?.name} className="object-cover h-full w-full" />
                                ) : (
                                  <ShoppingBag className="h-4.5 w-4.5 text-indigo-400/40" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h6 className="text-xs font-bold text-white truncate font-outfit">{item.product?.name || 'Unknown Product'}</h6>
                                <span className="text-[10px] text-muted-foreground">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-white font-outfit">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary & Destination grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                    {/* Destination */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-indigo-400" /> Dispatch Destination
                      </span>
                      <p className="text-xs text-white pl-4 leading-relaxed">{order.address}</p>
                    </div>

                    {/* Total Amount */}
                    <div className="flex justify-between items-end md:justify-end md:text-right gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Settled Total</span>
                        <span className="text-lg font-extrabold text-indigo-400 font-outfit">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Status Tracker Timeline */}
                  {!isCancelled && (
                    <div className="border-t border-white/5 pt-5 space-y-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Delivery Timeline Node</span>
                      
                      <div className="relative flex items-center justify-between w-full max-w-md mx-auto pt-4 pb-2">
                        {/* Connecting track line */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-[12%] right-[12%] h-[2px] bg-zinc-800 z-0">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-500" 
                            style={{ width: `${((step - 1) / 3) * 100}%` }}
                          />
                        </div>

                        {/* Step 1: Received */}
                        <div className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                            step >= 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0b0c15] border-zinc-700 text-muted-foreground'
                          }`}>
                            {step > 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : '1'}
                          </div>
                          <span className={`text-[9px] font-bold tracking-tight uppercase ${step >= 1 ? 'text-white' : 'text-muted-foreground'}`}>Placed</span>
                        </div>

                        {/* Step 2: Processing */}
                        <div className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                            step >= 2 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0b0c15] border-zinc-700 text-muted-foreground'
                          }`}>
                            {step > 2 ? <CheckCircle2 className="h-3.5 w-3.5" /> : '2'}
                          </div>
                          <span className={`text-[9px] font-bold tracking-tight uppercase ${step >= 2 ? 'text-white' : 'text-muted-foreground'}`}>Processing</span>
                        </div>

                        {/* Step 3: Shipped */}
                        <div className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                            step >= 3 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0b0c15] border-zinc-700 text-muted-foreground'
                          }`}>
                            {step > 3 ? <CheckCircle2 className="h-3.5 w-3.5" /> : '3'}
                          </div>
                          <span className={`text-[9px] font-bold tracking-tight uppercase ${step >= 3 ? 'text-white' : 'text-muted-foreground'}`}>Shipped</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                            step >= 4 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0b0c15] border-zinc-700 text-muted-foreground'
                          }`}>
                            {step >= 4 ? <CheckCircle2 className="h-3.5 w-3.5" /> : '4'}
                          </div>
                          <span className={`text-[9px] font-bold tracking-tight uppercase ${step >= 4 ? 'text-white' : 'text-muted-foreground'}`}>Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="bg-red-500/5 border border-dashed border-red-500/20 rounded-2xl p-4 flex items-center gap-2.5 text-xs text-red-400">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      This transaction node has been cancelled. Re-list order drop in cart if required.
                    </div>
                  )}

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
