import React from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { productSchema, ProductInput } from '../utils/schemas';
import { Product, Category } from '../api/productQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { X, Upload, Loader2, Trash2 } from 'lucide-react';

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: ProductInput) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
  isUploading: boolean;
  isSubmitting: boolean;
}

export default function ProductFormModal({
  product,
  categories,
  onClose,
  onSubmit,
  onUploadImage,
  isUploading,
  isSubmitting
}: ProductFormModalProps) {

  const form = useForm({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stockStatus: product?.stockStatus || 'instock',
      categoryId: product?.categoryId || (categories.length > 0 ? categories[0].id : 0),
      imageUrls: product?.images ? product.images.map(img => img.url) : [],
    } as ProductInput,
    validatorAdapter: zodValidator(),
    validators: {
      onChange: productSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const url = await onUploadImage(files[0]);
      // Update form value array
      const currentImages = form.getFieldValue('imageUrls') || [];
      form.setFieldValue('imageUrls', [...currentImages, url]);
    } catch (err) {
      // Handled in parent
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const currentImages = form.getFieldValue('imageUrls') || [];
    form.setFieldValue('imageUrls', currentImages.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="w-full max-w-xl bg-[#0b0c15]/95 border border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-white font-outfit">
            {product ? 'Configure Custom Drop' : 'Launch New Tech Drop'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-white p-1 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Scrollable Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Product Name */}
          <form.Field
            name="name"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="prod-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Name</Label>
                <Input 
                  type="text" 
                  id="prod-name"
                  placeholder="e.g. ApexBook Quantum"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  className={`bg-background/50 border-muted text-white text-xs rounded-xl ${
                    field.state.meta.errors.length ? 'border-destructive focus-visible:ring-destructive' : ''
                  }`}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          />

          {/* Product Description */}
          <form.Field
            name="description"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor="prod-desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <textarea 
                  id="prod-desc"
                  rows={3}
                  placeholder="Summarize specifications and premium custom hardware aspects..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-background/50 border border-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none placeholder:text-muted-foreground text-white text-xs rounded-xl p-3"
                />
              </div>
            )}
          />

          {/* Price & Stock & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Price */}
            <form.Field
              name="price"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor="prod-price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price ($)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    id="prod-price"
                    placeholder="99.99"
                    value={field.state.value === 0 ? '' : field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                    required
                    className={`bg-background/50 border-muted text-white text-xs rounded-xl ${
                      field.state.meta.errors.length ? 'border-destructive focus-visible:ring-destructive' : ''
                    }`}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Stock Status */}
            <form.Field
              name="stockStatus"
              children={(field) => (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inventory Status</Label>
                  <Select 
                    value={field.state.value} 
                    onValueChange={(val) => field.handleChange(val as 'instock' | 'outstock')}
                  >
                    <SelectTrigger className="w-full bg-background/50 border-muted text-xs text-white rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instock" className="text-xs">In Stock</SelectItem>
                      <SelectItem value="outstock" className="text-xs">Sold Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Category Selection */}
            <form.Field
              name="categoryId"
              children={(field) => (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Store Node (Category)</Label>
                  <Select 
                    value={field.state.value?.toString()} 
                    onValueChange={(val) => field.handleChange(parseInt(val) || 0)}
                  >
                    <SelectTrigger className="w-full bg-background/50 border-muted text-xs text-white rounded-xl">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="text-xs">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {field.state.meta.errors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Local Image Uploading */}
          <form.Field
            name="imageUrls"
            children={(field) => (
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Product Media Assets</Label>
                
                {/* Drag and Drop zone */}
                <div className="border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition duration-200 rounded-2xl p-6 text-center cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {isUploading ? (
                    <div className="space-y-2">
                      <Loader2 className="h-6 w-6 text-indigo-400 animate-spin mx-auto" />
                      <p className="text-xs font-semibold text-indigo-300">Syncing binary asset to server storage...</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="h-6 w-6 text-indigo-400 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-white">Click or drag image here</p>
                      <p className="text-[10px] text-muted-foreground">Supports PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                </div>

                {/* Uploaded Thumbnails list */}
                {(field.state.value || []).length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {(field.state.value || []).map((imgUrl, idx) => (
                      <div key={idx} className="relative h-16 w-16 bg-white/5 border border-white/10 rounded-xl overflow-hidden shrink-0 group">
                        <img src={imgUrl} alt="uploaded thumbnail" className="object-cover h-full w-full" />
                        <button 
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-red-600/70 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          />

          {/* Submit Trigger Button */}
          <div className="pt-4 border-t border-white/5 shrink-0 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl text-xs h-11"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl h-11 text-xs px-6 shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : product ? (
                'Save Adjustments'
              ) : (
                'Publish Tech Drop'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
