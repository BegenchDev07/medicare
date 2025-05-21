import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import CategoryModal from '../../components/admin/CategoryModal';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import { Category } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';

interface CategoryWithDoctorCount extends Category {
  doctorCount: number;
}

const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryWithDoctorCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiGet<CategoryWithDoctorCount[]>('/categories');
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError(response.error || 'Failed to fetch categories');
      }
    } catch (error) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCategory(undefined);
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleSubmit = async (data: { name: string; description: string }) => {
    try {
      if (selectedCategory) {
        // Update existing category
        const response = await apiPut(`/categories/${selectedCategory.id}`, data);
        if (response.success) {
          showNotification('success', 'Category updated successfully');
          fetchCategories();
        } else {
          throw new Error(response.error || 'Failed to update category');
        }
      } else {
        // Create new category
        const response = await apiPost('/categories', data);
        if (response.success) {
          showNotification('success', 'Category created successfully');
          fetchCategories();
        } else {
          throw new Error(response.error || 'Failed to create category');
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await apiDelete(`/categories/${id}`);
      if (response.success) {
        showNotification('success', 'Category deleted successfully');
        setCategories(categories.filter((category:any) => category.id !== id));
      } else {
        setError(response.error || 'Failed to delete category');
      }
    } catch (error) {
      setError('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add, edit, or remove medical specialties
          </p>
        </div>
        <Button
          onClick={handleAdd}
          icon={<Plus size={18} />}
        >
          Add Category
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      <Card className="mb-6">
        <div className="flex items-center p-4 border-b">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            className="ml-2 flex-1 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctors Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category:any) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {category.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {category.doctorCount} doctors
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit size={16} />}
                      className="mr-2"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        category={selectedCategory}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
      />
    </div>
  );
};

export default ManageCategories;