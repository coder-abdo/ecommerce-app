import { useCartDrawer } from '../hooks/useCartDrawer';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, ShoppingBag, Plus, Minus, Trash2, MapPin, Send, Loader2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onOrderPlacedSuccess: () => void;
}

export default function CartDrawer({ isOpen, onClose, showToast, onOrderPlacedSuccess }: CartDrawerProps) {
  const {
    shippingAddress,
    setShippingAddress,
    cartItems,
    handleUpdateQty,
    handleRemove,
    calculateSubtotal,
    handleCheckout,
    isSubmitting,
  } = useCartDrawer({ onClose, showToast, onOrderPlacedSuccess });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Wrapper */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b0c15]/95 border-l border-white/10 backdrop-blur-2xl flex flex-col shadow-2xl relative">
          
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white font-outfit">Your Shopping Cart</h3>
              <span className="text-xs bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full text-indigo-300 font-bold">
                {cartItems.length} items
              </span>
            </div>
            <button 
              onClick={onClose} 
              className="text-muted-foreground hover:text-white p-1 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="h-16 w-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-outfit">Your cart is empty</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 leading-relaxed">
                    You haven't added any custom drops to your cart yet. Explore the shop panel to browse tech drops.
                  </p>
                </div>
                <Button onClick={onClose} size="sm" className="rounded-xl">Browse Drops</Button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-2xl gap-4 hover:border-white/10 transition"
                >
                  {/* Thumbnail */}
                  <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="object-cover h-full w-full" />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-indigo-400/40" />
                    )}
                  </div>

                  {/* Title & Quantity */}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate font-outfit">{item.name}</h5>
                    <span className="text-[10px] text-indigo-300 font-semibold">${item.price.toFixed(2)} each</span>
                    
                    {/* Quantity selectors */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <button 
                        onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                        className="h-5 w-5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-extrabold text-white w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                        className="h-5 w-5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Delete & Total Price */}
                  <div className="flex flex-col items-end justify-between self-stretch">
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="text-muted-foreground hover:text-red-400 p-1 hover:bg-red-500/10 rounded-md transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-extrabold text-white font-outfit">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout & Summary Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-black/40 space-y-6">
              
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-semibold">FREE (Beta Release)</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-white/5">
                  <span className="font-outfit">Estimated Total</span>
                  <span className="font-outfit text-indigo-400 text-lg">${calculateSubtotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Address Form */}
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checkout-address" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    Delivery Destination Address
                  </Label>
                  <Input 
                    type="text" 
                    id="checkout-address"
                    placeholder="123 Cyberpunk Blvd, Apt 404"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    className="bg-background/50 border-muted text-white text-xs rounded-xl"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Securing Transaction...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Place Secure Order
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
