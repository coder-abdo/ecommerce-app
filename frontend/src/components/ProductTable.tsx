import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Product } from '../api/productQueries';
import { Edit2, Trash2, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export default function ProductTable({ products, isLoading, onEdit, onDelete }: ProductTableProps) {
  return (
    <Card className="bg-card/40 border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-white/5">
        <CardTitle className="text-lg font-bold text-white font-outfit flex items-center gap-2">
          🚀 Custom Drop Telemetry Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Syncing products database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h4 className="font-bold text-white text-sm font-outfit">No active drops</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                You haven't listed any products on the storefront yet. Click "New Tech Drop" to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => {
                  const hasImage = product.images && product.images.length > 0;
                  const primaryImage = hasImage ? product.images![0].url : '';
                  const isOutOfStock = product.stockStatus === 'outstock';

                  return (
                    <tr key={product.id} className="hover:bg-white/5 transition duration-150 group">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                          {hasImage ? (
                            <img src={primaryImage} alt={product.name} className="object-cover h-full w-full" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-indigo-400/40" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate font-outfit group-hover:text-indigo-400 transition">{product.name}</h5>
                          <p className="text-[10px] text-muted-foreground truncate max-w-xs">{product.description || 'No description.'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-indigo-300">
                          {product.category?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-white font-outfit">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isOutOfStock 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                          onClick={() => onEdit(product)} 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-white rounded-lg"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          onClick={() => onDelete(product.id)} 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
