import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { useAdminProducts } from '../hooks/useAdminProducts';

import CategoryManager from './CategoryManager';
import ProductTable from './ProductTable';
import ProductFormModal from './ProductFormModal';

interface AdminProductPanelProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function AdminProductPanel({ showToast }: AdminProductPanelProps) {
  const {
    categories,
    products,
    isCategoriesLoading,
    isProductsLoading,
    isCreatingCategory,
    isUploading,
    isSubmitting,
    isModalOpen,
    editingProduct,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleCreateCategory,
    handleUploadImage,
    handleDeleteProduct,
    handleFormSubmit,
  } = useAdminProducts({ showToast });

  return (
    <div className="space-y-6">
      
      {/* Category Manager (Stats & Form) */}
      <CategoryManager 
        categories={categories}
        isLoading={isCategoriesLoading}
        onCreateCategory={handleCreateCategory}
        isCreating={isCreatingCategory}
      />

      {/* Product Telemetry Panel Header */}
      <div className="flex justify-end pt-2">
        <Button 
          onClick={handleOpenCreateModal} 
          size="sm" 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl h-10 text-xs px-4"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Launch New Tech Drop
        </Button>
      </div>

      {/* Product list table */}
      <ProductTable 
        products={products}
        isLoading={isProductsLoading}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteProduct}
      />

      {/* Creation/Edition Form Modal Dialog */}
      {isModalOpen && (
        <ProductFormModal 
          product={editingProduct}
          categories={categories}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
          onUploadImage={handleUploadImage}
          isUploading={isUploading}
          isSubmitting={isSubmitting}
        />
      )}

    </div>
  );
}
