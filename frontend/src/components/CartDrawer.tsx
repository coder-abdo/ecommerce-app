import { useCartDrawer } from '../hooks/useCartDrawer';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  X, ShoppingBag, Plus, Minus, Trash2, MapPin, 
  ArrowRight, ArrowLeft, CreditCard, ShieldCheck, 
  CheckCircle2, Loader2, Sparkles, Truck, Coins
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onOrderPlacedSuccess: () => void;
}

export default function CartDrawer({ isOpen, onClose, showToast, onOrderPlacedSuccess }: CartDrawerProps) {
  const {
    step,
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
    isSubmitting,
  } = useCartDrawer({ showToast, onOrderPlacedSuccess });

  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    resetCheckout();
    onClose();
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'paypal') {
      setIsSimulatingPayment(true);
      setTimeout(async () => {
        setIsSimulatingPayment(false);
        await handleCheckout();
      }, 2000);
    } else if (paymentMethod === 'crypto') {
      setIsSimulatingPayment(true);
      setTimeout(async () => {
        setIsSimulatingPayment(false);
        await handleCheckout();
      }, 2500);
    } else {
      await handleCheckout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />

      {/* Drawer Wrapper */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b0c15]/95 border-l border-white/10 backdrop-blur-2xl flex flex-col shadow-2xl relative">
          
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white font-outfit">
                {step === 4 ? 'Order Placed!' : 'Your Shopping Cart'}
              </h3>
              {step < 4 && (
                <span className="text-xs bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full text-indigo-300 font-bold">
                  {cartItems.length} items
                </span>
              )}
            </div>
            <button 
              onClick={handleClose} 
              className="text-muted-foreground hover:text-white p-1 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Checkout Steps Progress Bar */}
          {step < 4 && (
            <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <span className={step >= 1 ? 'text-indigo-400 font-bold' : ''}>1. Review</span>
              <div className={`h-[1px] flex-1 mx-2 ${step >= 2 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
              <span className={step >= 2 ? 'text-indigo-400 font-bold' : ''}>2. Shipping</span>
              <div className={`h-[1px] flex-1 mx-2 ${step >= 3 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
              <span className={step >= 3 ? 'text-indigo-400 font-bold' : ''}>3. Payment</span>
            </div>
          )}

          {/* Content Wrapper */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* STEP 1: REVIEW CART ITEMS */}
            {step === 1 && (
              <>
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
                    <Button onClick={handleClose} size="sm" className="rounded-xl">Browse Drops</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
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
                    ))}
                  </div>
                )}
              </>
            )}

            {/* STEP 2: SHIPPING DETAILS FORM */}
            {step === 2 && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <MapPin className="h-4 w-4" /> Delivery Destination
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="recipientName" className="text-[10px] uppercase text-muted-foreground">Recipient Name</Label>
                    <Input 
                      type="text" 
                      id="recipientName" 
                      placeholder="Jane Doe" 
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="recipientPhone" className="text-[10px] uppercase text-muted-foreground">Contact Phone</Label>
                    <Input 
                      type="tel" 
                      id="recipientPhone" 
                      placeholder="+1 (555) 019-2834" 
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="addressLine1" className="text-[10px] uppercase text-muted-foreground">Address Line 1</Label>
                  <Input 
                    type="text" 
                    id="addressLine1" 
                    placeholder="123 Cyberpunk Blvd" 
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="addressLine2" className="text-[10px] uppercase text-muted-foreground">Address Line 2 (Optional)</Label>
                  <Input 
                    type="text" 
                    id="addressLine2" 
                    placeholder="Apt, Suite, Unit" 
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-[10px] uppercase text-muted-foreground">City</Label>
                    <Input 
                      type="text" 
                      id="city" 
                      placeholder="Neo Metropolis" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-[10px] uppercase text-muted-foreground">State / Region</Label>
                    <Input 
                      type="text" 
                      id="state" 
                      placeholder="California" 
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="postalCode" className="text-[10px] uppercase text-muted-foreground">Postal Code / ZIP</Label>
                    <Input 
                      type="text" 
                      id="postalCode" 
                      placeholder="90210" 
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-[10px] uppercase text-muted-foreground">Country</Label>
                    <Input 
                      type="text" 
                      id="country" 
                      placeholder="United States" 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Shipping Method Tiers */}
                <div className="space-y-3.5 pt-2">
                  <Label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-indigo-400" /> Choose Shipping Tier
                  </Label>
                  <div className="space-y-2">
                    {/* Standard */}
                    <div 
                      onClick={() => setShippingMethod('standard')}
                      className={`p-3 bg-white/5 border rounded-2xl flex items-center justify-between cursor-pointer transition ${
                        shippingMethod === 'standard' ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="radio" 
                          checked={shippingMethod === 'standard'} 
                          onChange={() => {}} 
                          className="accent-indigo-500"
                        />
                        <div>
                          <h6 className="text-xs font-bold text-white">Standard Delivery</h6>
                          <p className="text-[9px] text-muted-foreground">Delivered in 3 to 5 business days.</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">FREE</span>
                    </div>

                    {/* Express */}
                    <div 
                      onClick={() => setShippingMethod('express')}
                      className={`p-3 bg-white/5 border rounded-2xl flex items-center justify-between cursor-pointer transition ${
                        shippingMethod === 'express' ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="radio" 
                          checked={shippingMethod === 'express'} 
                          onChange={() => {}} 
                          className="accent-indigo-500"
                        />
                        <div>
                          <h6 className="text-xs font-bold text-white">Express Courier</h6>
                          <p className="text-[9px] text-muted-foreground">Delivered in 1 to 2 business days.</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white">$15.00</span>
                    </div>

                    {/* Next-Day */}
                    <div 
                      onClick={() => setShippingMethod('next_day')}
                      className={`p-3 bg-white/5 border rounded-2xl flex items-center justify-between cursor-pointer transition ${
                        shippingMethod === 'next_day' ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="radio" 
                          checked={shippingMethod === 'next_day'} 
                          onChange={() => {}} 
                          className="accent-indigo-500"
                        />
                        <div>
                          <h6 className="text-xs font-bold text-white">Next-Day Priority</h6>
                          <p className="text-[9px] text-muted-foreground">Delivered in 24 hours guaranteed.</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white">$35.00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SECURE PAYMENT GATEWAY */}
            {step === 3 && (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="h-4 w-4" /> Secure Gateway Payment
                </h4>

                {/* Payment Selection tabs */}
                <div className="grid grid-cols-4 gap-1.5 bg-white/5 border border-white/5 p-1 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`py-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'credit_card' ? 'bg-white/10 text-white border border-white/5' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Card</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`py-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'paypal' ? 'bg-white/10 text-white border border-white/5' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    <span className="italic font-outfit text-indigo-400 font-extrabold text-[11px] leading-tight">PayPal</span>
                    <span>PayPal</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`py-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'crypto' ? 'bg-white/10 text-white border border-white/5' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    <Coins className="h-3.5 w-3.5 text-yellow-400" />
                    <span>Web3</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === 'cod' ? 'bg-white/10 text-white border border-white/5' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    <Truck className="h-3.5 w-3.5 text-indigo-400" />
                    <span>COD</span>
                  </button>
                </div>

                {/* Subforms based on method */}
                {paymentMethod === 'credit_card' && (
                  <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
                    
                    {/* Glassmorphic Credit Card Preview */}
                    <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-5 text-white flex flex-col justify-between shadow-xl overflow-hidden mb-6 border border-white/10">
                      {/* Top banner */}
                      <div className="flex justify-between items-start">
                        <div className="h-7 w-9 bg-yellow-500/80 rounded-md opacity-90 shadow flex items-center justify-center">
                          <div className="h-4 w-6 border border-yellow-600/40 rounded bg-yellow-400/20" />
                        </div>
                        <span className="font-extrabold tracking-wider text-xs italic font-outfit text-white/80">SECURE CYBER CARD</span>
                      </div>
                      
                      {/* Card Number */}
                      <div className="text-base md:text-lg font-bold tracking-[0.2em] font-mono text-center my-2 select-all">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      
                      {/* Card Details Bottom */}
                      <div className="flex justify-between text-[10px] font-mono uppercase">
                        <div className="min-w-0 flex-1 pr-4">
                          <div className="text-[7px] text-white/50">Card Holder</div>
                          <div className="truncate font-semibold tracking-wider">{cardHolder || 'VALUED CUSTOMER'}</div>
                        </div>
                        <div className="shrink-0 text-center px-2">
                          <div className="text-[7px] text-white/50">Expires</div>
                          <div className="font-semibold">{cardExpiry || 'MM/YY'}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[7px] text-white/50">CVV</div>
                          <div className="font-semibold">{cardCvv || '•••'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <Label htmlFor="cardHolder" className="text-[9px] uppercase text-muted-foreground">Cardholder Name</Label>
                        <Input 
                          type="text" 
                          id="cardHolder" 
                          placeholder="JANE DOE" 
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          required
                          className="bg-background/40 border-white/10 text-white rounded-xl text-xs uppercase"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="cardNumber" className="text-[9px] uppercase text-muted-foreground">Card Number</Label>
                        <Input 
                          type="text" 
                          id="cardNumber" 
                          placeholder="0000 0000 0000 0000" 
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          required
                          className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="cardExpiry" className="text-[9px] uppercase text-muted-foreground">Expiry (MM/YY)</Label>
                          <Input 
                            type="text" 
                            id="cardExpiry" 
                            placeholder="12/28" 
                            value={cardExpiry}
                            onChange={(e) => handleCardExpiryChange(e.target.value)}
                            required
                            className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="cardCvv" className="text-[9px] uppercase text-muted-foreground">Security Code (CVV)</Label>
                          <Input 
                            type="password" 
                            id="cardCvv" 
                            placeholder="•••" 
                            value={cardCvv}
                            onChange={(e) => handleCardCvvChange(e.target.value)}
                            required
                            className="bg-background/40 border-white/10 text-white rounded-xl text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="p-8 border border-dashed border-white/10 rounded-2xl bg-white/5 flex flex-col items-center justify-center text-center space-y-4">
                    <span className="font-outfit text-indigo-400 font-extrabold text-2xl italic leading-none">PayPal</span>
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                      You will be redirected to PayPal to authorize the purchase. Transaction runs inside a secure sandbox overlay.
                    </p>
                    {isSimulatingPayment ? (
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Authenticating PayPal Wallet...
                      </div>
                    ) : (
                      <Button 
                        type="button" 
                        onClick={handlePaymentSubmit}
                        className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 py-2 rounded-xl text-xs"
                      >
                        Authorize PayPal Checkout
                      </Button>
                    )}
                  </div>
                )}

                {paymentMethod === 'crypto' && (
                  <div className="p-6 border border-dashed border-white/10 rounded-2xl bg-white/5 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-10 w-10 bg-yellow-500/10 border border-yellow-500/25 rounded-full flex items-center justify-center text-yellow-400">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-white">MetaMask / Web3 Connect</h6>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-xs">
                        Pay using Ethereum or Cyber-Tokens. Ensure your Metamask extension or WalletConnect app is open.
                      </p>
                    </div>
                    {isSimulatingPayment ? (
                      <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Confirming Smart Contract Gwei...
                      </div>
                    ) : (
                      <Button 
                        type="button" 
                        onClick={handlePaymentSubmit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-xs"
                      >
                        Request Web3 Signature
                      </Button>
                    )}
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-6 border border-dashed border-white/10 rounded-2xl bg-white/5 flex items-center gap-4 text-left">
                    <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/25 rounded-full flex items-center justify-center text-indigo-400 shrink-0">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-white">Cash on Delivery (COD)</h6>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        Pay using cash or local card once the courier physically delivers the packages to your destination address.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: SUCCESS DISPATCH SCREEN */}
            {step === 4 && (
              <div className="text-center py-10 space-y-6">
                
                {/* Success Indicator */}
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 relative z-10">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-white text-base font-outfit">Transaction Cleared</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Your custom drop has been scheduled for packaging. A delivery dispatch tracking node has been added to your profile.
                  </p>
                </div>

                {/* Invoice details */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    <span>Receipt summary</span>
                    <span className="text-emerald-400">Paid successfully</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Recipient</span>
                    <span className="text-white font-medium">{recipientName}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Method</span>
                    <span className="text-white font-medium capitalize">{shippingMethod}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Destination</span>
                    <span className="text-white font-medium truncate max-w-[200px]">{addressLine1}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground pt-1 border-t border-white/5 font-bold">
                    <span className="text-white">Amount Settled</span>
                    <span className="text-indigo-400">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={handleClose} 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl"
                  >
                    Return to Store
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Checkout & Summary Footer */}
          {cartItems.length > 0 && step < 4 && (
            <div className="p-6 border-t border-white/10 bg-[#07080f]/90 space-y-6">
              
              {/* Summary pricing */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shipping Cost</span>
                  {getShippingCost(shippingMethod) === 0 ? (
                    <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">Free Delivery</span>
                  ) : (
                    <span>${getShippingCost(shippingMethod).toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-white/5">
                  <span className="font-outfit">Invoice Total</span>
                  <span className="font-outfit text-indigo-400 text-lg">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={isSubmitting || isSimulatingPayment}
                    className="border-white/10 text-white hover:bg-white/5 px-4 h-12 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}

                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    {paymentMethod === 'credit_card' ? (
                      <Button 
                        onClick={handleCheckout}
                        disabled={isSubmitting || isSimulatingPayment}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Finalizing Order...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 text-amber-300" />
                            Place Secure Order
                          </>
                        )}
                      </Button>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
