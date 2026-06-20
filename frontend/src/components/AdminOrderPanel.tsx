import { useAdminOrders } from '../hooks/useAdminOrders';
import { Card } from './ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { 
  Package, MapPin, Calendar, ShieldCheck, Mail, User, 
  ListCollapse, Truck, Landmark, CreditCard, Coins, Check, Copy
} from 'lucide-react';
import { useState } from 'react';

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

  const [trackingNumbers, setTrackingNumbers] = useState<Record<number, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleTrackingChange = (orderId: number, val: string) => {
    setTrackingNumbers(prev => ({
      ...prev,
      [orderId]: val
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateTracking = async (orderId: number, currentStatus: string) => {
    const trackingVal = trackingNumbers[orderId] || '';
    await handleStatusChange(orderId, currentStatus, trackingVal);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-3.5 w-3.5 text-indigo-400" />;
      case 'paypal':
        return <span className="font-outfit text-indigo-400 font-extrabold text-[10px] italic mr-1">PP</span>;
      case 'crypto':
        return <Coins className="h-3.5 w-3.5 text-yellow-400" />;
      case 'cod':
        return <Truck className="h-3.5 w-3.5 text-green-400" />;
      default:
        return <Landmark className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Card';
      case 'paypal': return 'PayPal';
      case 'crypto': return 'Web3';
      case 'cod': return 'COD';
      default: return 'Standard';
    }
  };

  const getShippingLabel = (method: string) => {
    switch (method) {
      case 'express': return 'Express Courier';
      case 'next_day': return 'Next-Day Priority';
      default: return 'Standard Delivery';
    }
  };

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
          {orders.map((order) => {
            const currentTrackingVal = trackingNumbers[order.id] !== undefined 
              ? trackingNumbers[order.id] 
              : (order.trackingNumber || '');

            return (
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
                      onValueChange={(val) => handleStatusChange(order.id, val, currentTrackingVal)}
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

                  {/* Column 3: Logistics (Address, Shipping method, Tracking, Payments) */}
                  <div className="space-y-4 bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between text-xs">
                    
                    {/* Destination Address */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-indigo-400" /> Logistics Destination
                      </span>
                      <div className="pl-4 text-white leading-relaxed text-[11px] space-y-0.5">
                        <p className="font-bold">{order.recipientName || 'Customer'}</p>
                        {order.recipientPhone && <p className="text-muted-foreground text-[10px]">{order.recipientPhone}</p>}
                        {order.addressLine1 ? (
                          <>
                            <p>{order.addressLine1}</p>
                            {order.addressLine2 && <p>{order.addressLine2}</p>}
                            <p>{order.city}, {order.state} {order.postalCode}</p>
                            <p className="text-muted-foreground text-[9px] uppercase font-bold tracking-wider">{order.country}</p>
                          </>
                        ) : (
                          <p>{order.address}</p>
                        )}
                      </div>
                    </div>

                    {/* Shipping Tier Info */}
                    <div className="space-y-1 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Truck className="h-3 w-3 text-indigo-400" /> Shipping Service
                      </span>
                      <div className="pl-4 text-white text-[11px]">
                        <p className="font-bold">{getShippingLabel(order.shippingMethod)}</p>
                        <p className="text-muted-foreground text-[10px]">
                          Cost: ${order.shippingCost ? order.shippingCost.toFixed(2) : '0.00 (Free)'}
                        </p>
                      </div>
                    </div>

                    {/* Tracking ID Controller */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Truck className="h-3 w-3 text-indigo-400" /> Shipment Tracking
                      </span>
                      
                      <div className="flex gap-2 pl-4">
                        <Input 
                          type="text" 
                          placeholder="Tracking Code" 
                          value={currentTrackingVal}
                          onChange={(e) => handleTrackingChange(order.id, e.target.value)}
                          className="bg-background/50 border-muted text-[11px] text-white rounded-lg h-8 flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={() => handleUpdateTracking(order.id, order.status)}
                          disabled={isSubmitting}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 text-[10px] px-2 rounded-lg"
                        >
                          Save
                        </Button>
                      </div>

                      {order.trackingNumber && (
                        <div className="flex items-center gap-2 pl-4 text-[10px]">
                          <span className="text-muted-foreground">Current Tracking ID:</span>
                          <span className="font-mono text-indigo-300 font-bold select-all">{order.trackingNumber}</span>
                          <button 
                            onClick={() => copyToClipboard(order.trackingNumber || '', `admin-track-${order.id}`)}
                            className="text-muted-foreground hover:text-white"
                          >
                            {copiedId === `admin-track-${order.id}` ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Landmark className="h-3 w-3 text-indigo-400" /> Payment & Costs
                      </span>
                      <div className="pl-4 text-white text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5">
                          {getPaymentIcon(order.paymentMethod)}
                          <span className="font-semibold">{getPaymentLabel(order.paymentMethod)}</span>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 rounded border ${
                            order.paymentStatus === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {order.paymentStatus || 'pending'}
                          </span>
                        </div>
                        {order.paymentTransactionId && (
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            Txn: {order.paymentTransactionId}
                          </p>
                        )}
                        <div className="flex justify-between items-end border-t border-white/5 pt-2 font-bold text-white mt-1">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Total Paid</span>
                          <span className="text-sm font-extrabold text-indigo-400 font-outfit">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
