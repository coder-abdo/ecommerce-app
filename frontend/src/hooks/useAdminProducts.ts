import { useState } from 'react';
import { 
  useProductsQuery, 
  useCategoriesQuery, 
  useCreateProductMutation, 
  useUpdateProductMutation, 
  useDeleteProductMutation, 
  useCreateCategoryMutation, 
  useUploadImageMutation,
  Product
} from '../api/productQueries';
import { ProductInput } from '../utils/schemas';

interface UseAdminProductsOptions {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function useAdminProducts({ showToast }: UseAdminProductsOptions) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Queries
  const productsQuery = useProductsQuery();
  const categoriesQuery = useCategoriesQuery();

  // Mutations
  const createCatMutation = useCreateCategoryMutation();
  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const uploadImageMutation = useUploadImageMutation();

  const categories = categoriesQuery.data || [];
  const products = productsQuery.data || [];

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleCreateCategory = async (name: string) => {
    try {
      await createCatMutation.mutateAsync({ name });
      showToast('Category created successfully!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    try {
      const res = await uploadImageMutation.mutateAsync(file);
      showToast('Image uploaded successfully!', 'success');
      return res.url;
    } catch (err: any) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this custom drop?')) return;
    try {
      await deleteProductMutation.mutateAsync(id);
      showToast('Product deleted successfully!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleFormSubmit = async (formData: ProductInput) => {
    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({ id: editingProduct.id, data: formData });
        showToast('Product updated successfully!', 'success');
      } else {
        await createProductMutation.mutateAsync(formData);
        showToast('Product created successfully!', 'success');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return {
    categories,
    products,
    isCategoriesLoading: categoriesQuery.isLoading,
    isProductsLoading: productsQuery.isLoading,
    isCreatingCategory: createCatMutation.isPending,
    isUploading: uploadImageMutation.isPending,
    isSubmitting: createProductMutation.isPending || updateProductMutation.isPending,
    isModalOpen,
    editingProduct,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleCreateCategory,
    handleUploadImage,
    handleDeleteProduct,
    handleFormSubmit,
  };
}
