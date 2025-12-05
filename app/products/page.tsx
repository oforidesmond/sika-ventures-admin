'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { Input } from '@/components/ui/input';

interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    costPrice: '',
    sellingPrice: '',
    stock: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        const data = await response.json();
        setProducts(data.products ?? []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Unable to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to refresh products');
      }
      const data = await response.json();
      setProducts(data.products ?? []);
    } catch (err) {
      console.error(err);
      setError('Unable to refresh products.');
    }
  };

  const itemsPerPage = 6;
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        stock: product.stockQuantity.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        costPrice: '',
        sellingPrice: '',
        stock: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      sku: formData.sku,
      costPrice: formData.costPrice,
      sellingPrice: formData.sellingPrice,
      stock: formData.stock,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      if (editingProduct) {
        setProducts((prev) => prev.map((product) => (product.id === data.product.id ? data.product : product)));
      } else {
        setProducts((prev) => [data.product, ...prev]);
      }

      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to delete product.');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Products Management</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus size={20} />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline">
              <Filter size={20} />
              Filters
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {error && <p className="px-6 py-3 text-red-600 text-sm">{error}</p>}
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Product Name</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">SKU</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Cost Price</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Selling Price</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Stock</th>
                  <th className="px-6 py-3 text-left text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-4 text-gray-500" colSpan={6}>
                      Loading products...
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-gray-500" colSpan={6}>
                      No products found.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-gray-700">{product.sku}</td>
                      <td className="px-6 py-4 text-gray-700">₵{product.costPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-900">₵{product.sellingPrice.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            product.stockQuantity < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {product.stockQuantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} variant="outline" size="sm">
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                >
                  {page}
                </Button>
              ))}
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <Button onClick={handleCloseModal} variant="outline">
              Cancel
            </Button>
            <Button form="product-form" type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name"
            type="text"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            placeholder="e.g., Wireless Headphones"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU"
              type="text"
              value={formData.sku}
              onChange={(event) => setFormData({ ...formData, sku: event.target.value })}
              placeholder="e.g., WH-001"
              required
            />
            <Input
              label="Stock Quantity"
              type="number"
              value={formData.stock}
              onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
              placeholder="0"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cost Price"
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(event) => setFormData({ ...formData, costPrice: event.target.value })}
              placeholder="0.00"
              required
            />
            <Input
              label="Selling Price"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(event) => setFormData({ ...formData, sellingPrice: event.target.value })}
              placeholder="0.00"
              required
            />
          </div>

        </form>
      </Modal>
    </div>
  );
}
