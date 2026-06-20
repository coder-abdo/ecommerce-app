import { useCustomerProfile } from '../hooks/useCustomerProfile';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, ShieldAlert, Award, ShoppingCart, DollarSign, Key, Save, Loader2 } from 'lucide-react';

interface CustomerProfileProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function CustomerProfile({ showToast }: CustomerProfileProps) {
  const {
    user,
    displayName,
    setDisplayName,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    ordersCount,
    activeOrders,
    totalSpent,
    handleUpdateProfile,
    isSubmitting,
    isGoogleUser,
  } = useCustomerProfile({ showToast });

  return (
    <div className="space-y-6">
      
      {/* Account stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Spent */}
        <Card className="bg-card/45 border-white/10 backdrop-blur-xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Cumulative Settled</span>
              <h4 className="text-2xl font-extrabold text-indigo-400 font-outfit">${totalSpent.toFixed(2)}</h4>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="bg-card/45 border-white/10 backdrop-blur-xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Purchased Drops</span>
              <h4 className="text-2xl font-extrabold text-purple-400 font-outfit">{ordersCount}</h4>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className="bg-card/45 border-white/10 backdrop-blur-xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Active Dispatches</span>
              <h4 className="text-2xl font-extrabold text-emerald-400 font-outfit">{activeOrders}</h4>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
              <Loader2 className={`h-6 w-6 ${activeOrders > 0 ? 'animate-spin' : ''}`} />
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Account Details overview */}
        <Card className="bg-card/45 border-white/10 backdrop-blur-xl lg:col-span-1 flex flex-col justify-between">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-outfit flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-indigo-400" />
              Store Account Node
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            
            <div className="space-y-5">
              {/* Account Level */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Access Privilege</label>
                <div>
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-xl">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Login Method */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Auth Broker</label>
                <div>
                  <span className="inline-block text-[11px] font-bold px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-xl">
                    {user.authMethod} session
                  </span>
                </div>
              </div>
            </div>

            {/* Shield warning */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-[11px] text-muted-foreground leading-relaxed mt-6">
              🔒 Your session token is stored within an HttpOnly cookie broker. This protects your account credentials against CSRF and cross-site scripting vulnerabilities.
            </div>

          </CardContent>
        </Card>

        {/* Update profile settings */}
        <Card className="bg-card/40 border-white/10 backdrop-blur-2xl lg:col-span-2">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider font-outfit flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-indigo-400" />
              Configure Profile Nodes
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="prof-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    id="prof-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="pl-10 bg-background/50 border-muted text-white text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Key className="h-4 w-4 text-indigo-400" />
                  Settle New Password (Optional)
                </div>

                {isGoogleUser ? (
                  <div className="bg-amber-500/5 border border-dashed border-amber-500/30 rounded-2xl p-4 flex items-center gap-2.5 text-xs text-amber-400">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    Google OAuth sessions manage passwords natively inside your Google profile. You cannot change your login password here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="prof-pass" className="text-xs font-semibold text-muted-foreground">New Password</Label>
                      <Input 
                        type="password" 
                        id="prof-pass"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-background/50 border-muted text-white text-xs rounded-xl"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="prof-confirm" className="text-xs font-semibold text-muted-foreground">Confirm Password</Label>
                      <Input 
                        type="password" 
                        id="prof-confirm"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-background/50 border-muted text-white text-xs rounded-xl"
                      />
                    </div>

                  </div>
                )}
              </div>

              {/* Submit Trigger */}
              <div className="pt-4 border-t border-white/5 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl h-11 text-xs px-6 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
