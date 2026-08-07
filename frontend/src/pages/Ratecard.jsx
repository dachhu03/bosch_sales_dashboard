import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import EditableCell from '../components/EditableCell.jsx';
import { useAuth } from '../App.jsx';
import { 
  Search, 
  Plus, 
  Upload, 
  Trash2, 
  RefreshCw, 
  FileSpreadsheet, 
  ImagePlus,
  AlertCircle,
  CheckCircle,
  X,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getMediaUrl } from '../utils/api.js';

export default function Ratecard() {
  const { user, isViewer, hasPermission } = useAuth();
  const isReadOnly = isViewer ? isViewer() : user?.role === 'viewer';
  const canWriteProducts = !isReadOnly && (user?.is_superuser === 1 || user?.role === 'super_admin' || (hasPermission && hasPermission('ratecard:write')));
  const canWritePrice = !isReadOnly && (user?.is_superuser === 1 || user?.role === 'super_admin' || (hasPermission && (hasPermission('ratecard:price_write') || hasPermission('ratecard:write'))));

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState('');
  const [isApplyingGlobalDiscount, setIsApplyingGlobalDiscount] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  // Edit Item form state
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState('');

  // Add Item form state
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addModalError, setAddModalError] = useState('');
  const [newItem, setNewItem] = useState({
    application: '',
    category: 'hardware',
    productName: '',
    make: '',
    model: '',
    specification: '',
    uom: '',
    buyingPrice: '',
    vendor: '',
    quotationReceivedMonth: '',
    leadTime: '',
    remarks: '',
    listPrice: '',
    discount: '0'
  });
  const [productImage, setProductImage] = useState(null);

  // File Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [activeImageUploadId, setActiveImageUploadId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/products', {
        params: { search, category }
      });
      if (response.data.status === 'success') {
        setProducts(response.data.products);
      }
    } catch (err) {
      setError('Failed to fetch ratecard records from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce search changes

    return () => clearTimeout(timer);
  }, [search, category]);

  // Handle single cell edit inline with 0ms Optimistic UI updates (Targeted Row Only)
  const handleCellSave = async (id, field, value) => {
    try {
      if (field === 'discount') {
        const discountVal = Math.min(Math.max(parseInt(value.toString().replace('%', '')) || 0, 0), 100);
        
        // 1. INSTANT OPTIMISTIC UI UPDATE for Single Target Row (0ms lag!)
        setProducts(prev => prev.map(p => {
          if (p.id === id) {
            const listPrice = parseFloat(p.listPrice || 0);
            const buyingPrice = parseFloat(p.buyingPrice || 0);
            const salesPrice = Math.max(listPrice - (listPrice * discountVal / 100), 0.0);
            const salesMargin = salesPrice > 0 ? Math.round(((salesPrice - buyingPrice) / salesPrice) * 100) : 0;

            return {
              ...p,
              discount: discountVal,
              salesPrice,
              salesMargin
            };
          }
          return p;
        }));

        showNotification('Discount updated for selected item.');
      } else if (field === 'buyingPrice') {
        const newBuyingPrice = parseFloat(value) || 0;
        
        // 1. INSTANT OPTIMISTIC UI UPDATE for Buying Price & Green Badge (0ms lag!)
        setProducts(prev => prev.map(p => {
          if (p.id === id) {
            const listPrice = parseFloat(p.listPrice || 0);
            const discountVal = parseFloat(p.discount || 0);
            const salesPrice = Math.max(listPrice - (listPrice * discountVal / 100), 0.0);
            const salesMargin = salesPrice > 0 ? Math.round(((salesPrice - newBuyingPrice) / salesPrice) * 100) : 0;

            return {
              ...p,
              buyingPrice: newBuyingPrice,
              salesMargin,
              buyingPriceColor: 'green'
            };
          }
          return p;
        }));

        showNotification('Buying price updated and age reset to active (Green).');
      }

      // 2. Server sync for targeted single row
      const response = await axios.post('/products/update-field', {
        updates: { [id]: { [field]: value } }
      });

      if (response.data.status === 'success') {
        const calculated = response.data.updatedValues?.[id];
        if (calculated) {
          setProducts(prev => prev.map(p => {
            if (p.id === id) {
              return {
                ...p,
                discount: parseInt(calculated.discount),
                salesPrice: parseFloat(calculated.salesPrice),
                salesMargin: parseInt(calculated.salesMargin),
                buyingPrice: parseFloat(calculated.buyingPrice),
                buyingPriceColor: calculated.buyingPriceColor
              };
            }
            return p;
          }));
        }
      }
    } catch (err) {
      setError('Failed to save inline cell edit.');
    }
  };

  const showNotification = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  // Delete product with custom modal
  const handleConfirmSingleDelete = async () => {
    if (!itemToDelete || isDeletingSingle) return;
    setIsDeletingSingle(true);

    try {
      const response = await axios.delete(`/products/delete/${itemToDelete.id}`);
      if (response.data.status === 'success') {
        setProducts(prev => prev.filter(p => p.id !== itemToDelete.id));
        showNotification(`Deleted item "${itemToDelete.productName}".`);
        setItemToDelete(null);
      }
    } catch (err) {
      setError('Failed to delete product item.');
    } finally {
      setIsDeletingSingle(false);
    }
  };

  // Bulk Apply Global Discount (Dedicated Global Discount Control)
  const handleApplyGlobalDiscount = (e) => {
    e.preventDefault();
    if (globalDiscount === '' || isNaN(globalDiscount) || isApplyingGlobalDiscount) return;

    const discountVal = parseInt(globalDiscount);
    if (discountVal < 0 || discountVal > 100) {
      showNotification('Discount percentage must be between 0% and 100%.', 'error');
      return;
    }

    // 1. INSTANT OPTIMISTIC UI UPDATE for ALL products (0ms lag!)
    setProducts(prev => prev.map(p => {
      const listPrice = parseFloat(p.listPrice || 0);
      const buyingPrice = parseFloat(p.buyingPrice || 0);
      const salesPrice = Math.max(listPrice - (listPrice * discountVal / 100), 0.0);
      const salesMargin = salesPrice > 0 ? Math.round(((salesPrice - buyingPrice) / salesPrice) * 100) : 0;

      return {
        ...p,
        discount: discountVal,
        salesPrice,
        salesMargin
      };
    }));

    // 2. INSTANT FEEDBACK & RESET INPUT (0ms lag!)
    showNotification(`Applied ${discountVal}% global discount across products successfully.`);
    setGlobalDiscount('');

    // 3. NON-BLOCKING ASYNC BACKGROUND SYNC
    axios.post('/products/apply-global-discount', {
      discount: discountVal,
      category
    }).catch(err => {
      console.error('Failed to sync global discount to database:', err);
    });
  };

  // Delete all products
  const handleDeleteAll = async () => {
    if (isDeletingAll) return;
    setIsDeletingAll(true);
    setError('');

    try {
      const response = await axios.post('/products/delete-all');
      if (response.data.status === 'success') {
        setProducts([]);
        setShowDeleteAllModal(false);
        showNotification('Successfully cleared all ratecard items.');
      }
    } catch (err) {
      setError('Wipe catalog operation failed.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Add Item Submit
  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingAdd) return;

    setIsSubmittingAdd(true);
    setAddModalError('');
    setError('');

    const formData = new FormData();
    Object.keys(newItem).forEach(key => {
      formData.append(key, newItem[key]);
    });
    if (productImage) {
      formData.append('product_image', productImage);
    }

    try {
      const response = await axios.post('/products/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setShowAddModal(false);
        setAddModalError('');
        setNewItem({
          application: '',
          category: 'hardware',
          productName: '',
          make: '',
          model: '',
          specification: '',
          uom: '',
          buyingPrice: '',
          vendor: '',
          quotationReceivedMonth: '',
          leadTime: '',
          remarks: '',
          listPrice: '',
          discount: '0'
        });
        setProductImage(null);
        fetchProducts();
        showNotification('Product catalog item added successfully.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to manually add product.';
      setAddModalError(errMsg);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleEditClick = (product) => {
    setEditItem({ ...product });
    setEditModalError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingEdit || !editItem) return;

    setIsSubmittingEdit(true);
    setEditModalError('');
    setError('');

    try {
      const response = await axios.put(`/products/edit/${editItem.id}`, editItem);
      if (response.data.status === 'success') {
        setShowEditModal(false);
        setEditItem(null);
        setEditModalError('');
        fetchProducts();
        showNotification('Product updated successfully.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update product details.';
      setEditModalError(errMsg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Bulk Upload sheet submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || isUploading) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', uploadCategory);

    try {
      const response = await axios.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status === 'success') {
        setShowUploadModal(false);
        setUploadFile(null);
        fetchProducts();
        showNotification(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process spreadsheet file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Image Upload handler for individual table cell
  const handleImageCellClick = (id) => {
    setActiveImageUploadId(id);
    imageInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeImageUploadId) return;

    const formData = new FormData();
    formData.append('product_image', file);

    try {
      const response = await axios.post(`/products/upload-image/${activeImageUploadId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status === 'success') {
        const imageUrl = response.data.imageUrl;
        setProducts(prev => prev.map(p => {
          if (p.id === activeImageUploadId) {
            return { ...p, productImage: imageUrl };
          }
          return p;
        }));
        showNotification('Product image uploaded successfully.');
      }
    } catch (err) {
      setError('Image upload failed.');
    } finally {
      setActiveImageUploadId(null);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Ratecard Directory
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">View, upload, and inline edit catalog prices and discount rules.</p>
        </div>

        {/* Global Action Row */}
        {canWriteProducts && (
          <div className="flex items-center gap-3 flex-wrap">
            {/* Add Item (Primary Solid) */}
            <motion.button 
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="h-10 px-5 bg-gradient-to-r from-bosch-blue to-bosch-lightBlue hover:from-bosch-lightBlue hover:to-bosch-blue text-white border border-bosch-blue/50 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-bosch-blue/20"
            >
              <Plus className="w-4 h-4" /> Add Item
            </motion.button>
            
            {/* Upload (Secondary Outline) */}
            <motion.button 
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUploadModal(true)}
              className="h-10 px-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Upload Sheet
            </motion.button>
            
            {/* Wipe Catalog (Destructive Soft-Outline) */}
            <motion.button 
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteAllModal(true)}
              className="h-10 px-5 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-600 dark:hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white dark:hover:text-white border border-rose-200/80 dark:border-rose-900/60 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <Trash2 className="w-4 h-4 text-rose-500" /> Wipe Catalog
            </motion.button>
          </div>
        )}
      </div>

      {/* Filter and Search Panel - Light Blue Glassmorphism Theme */}
      <div className="p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-sky-100/90 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-md shadow-sky-900/5 transition-all duration-300">
        {/* Search Input */}
        <div className="relative w-full md:max-w-sm">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search catalog items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:border-bosch-blue focus:outline-none transition-all text-xs font-semibold placeholder-slate-400"
          />
        </div>

        {/* Category Filter & Global Discount Applicator */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-bosch-blue focus:outline-none text-xs font-bold text-slate-700 dark:text-slate-200 w-full sm:w-36"
            >
              <option value="all">All Categories</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="service">Service</option>
            </select>
          </div>

          {/* Bulk Apply Global Discount Form */}
          {canWritePrice && (
            <form onSubmit={handleApplyGlobalDiscount} className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 border border-slate-200/80 p-1.5 rounded-2xl">
              <div className="flex items-center gap-1 pl-2">
                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Global Discount:</span>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%"
                  value={globalDiscount}
                  onChange={e => setGlobalDiscount(e.target.value)}
                  className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-bosch-blue focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={isApplyingGlobalDiscount || globalDiscount === ''} 
                className="h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                {isApplyingGlobalDiscount ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply %'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl text-xs font-medium"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-xs font-medium"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Spreadsheet Grid */}
      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] transition-all duration-300">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-bosch-blue animate-spin" />
            <span className="text-slate-400 font-semibold text-xs">Syncing spreadsheet records...</span>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead className="sticky top-0 z-20 bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="px-4 py-3.5 border-b border-slate-800">SL</th>
                  <th className="px-4 py-3.5 border-b border-slate-800">Application</th>
                  <th className="px-4 py-3.5 border-b border-slate-800">Category</th>
                  <th className="px-4 py-3.5 border-b border-slate-800">Product Name</th>
                  <th className="px-4 py-3.5 border-b border-slate-800 text-center">Image</th>
                  <th className="px-4 py-3.5 border-b border-slate-800">Make</th>
                  <th className="px-4 py-3.5 border-b border-slate-800">Model</th>
                  <th className="px-4 py-3.5 border-b border-slate-800">Specification</th>
                  <th className="px-4 py-3.5 border-b border-slate-800">UOM</th>
                  <th className="px-4 py-3.5 border-b border-slate-800 min-w-[90px]">Buy Price</th>
                  <th className="px-4 py-3.5 border-b border-slate-800">Vendor</th>
                  <th className="px-4 py-3.5 border-b border-slate-800">Quotation Date</th>
                  <th className="px-4 py-3.5 border-b border-slate-800">Lead Time</th>
                  <th className="px-4 py-3.5 border-b border-slate-800 min-w-[90px]">List Price</th>
                  <th className="px-4 py-3.5 border-b border-slate-800 min-w-[80px]">Discount</th>
                  <th className="px-4 py-3.5 border-b border-slate-800 min-w-[90px]">Sales Cost</th>
                  <th className="px-4 py-3.5 border-b border-slate-800 min-w-[80px]">Margin</th>
                  <th className="px-4 py-3.5 border-b border-slate-800 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {products.map((p, index) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono font-semibold">{index + 1}</td>
                    <td className="px-4 py-3 min-w-[100px]">{p.application || 'NAN'}</td>
                    <td className="px-4 py-3 capitalize"><span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">{p.category}</span></td>
                    <td className="px-4 py-3 font-semibold text-slate-900 min-w-[150px]">{p.productName}</td>
                    
                    {/* Dynamic Image Cell Upload */}
                    <td className="px-4 py-3 text-center">
                      <div 
                        onClick={() => handleImageCellClick(p.id)}
                        className="w-10 h-10 border border-dashed border-slate-300 hover:border-bosch-blue rounded-lg overflow-hidden flex items-center justify-center cursor-pointer bg-slate-50 mx-auto transition-colors"
                      >
                        {p.productImage ? (
                          <img src={getMediaUrl(p.productImage)} alt={p.productName} className="object-cover w-full h-full" />
                        ) : (
                          <ImagePlus className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">{p.make || 'NAN'}</td>
                    <td className="px-4 py-3">{p.model || 'NAN'}</td>
                    <td 
                      onClick={() => p.specification && setSelectedSpec({ productName: p.productName, specification: p.specification })}
                      className={`px-4 py-3 max-w-[200px] truncate ${p.specification ? 'cursor-pointer hover:bg-slate-100/70 hover:text-bosch-blue hover:font-bold transition-all decoration-dotted underline-offset-4 hover:underline' : ''}`}
                      title={p.specification ? "Click to view full specification" : "No specification available"}
                    >
                      {p.specification || 'NAN'}
                    </td>
                    <td className="px-4 py-3">{p.uom || 'NAN'}</td>
                    
                    {/* Inline Editable cell for Buy Price */}
                    <td className="px-4 py-3">
                      <EditableCell 
                        value={p.buyingPrice} 
                        onSave={(val) => handleCellSave(p.id, 'buyingPrice', val)}
                        type="number"
                        colorClass={p.buyingPriceColor}
                        disabled={!canWritePrice}
                      />
                    </td>

                    <td className="px-4 py-3">{p.vendor || 'NAN'}</td>
                    <td className="px-4 py-3">{p.quotationReceivedMonth || 'NAN'}</td>
                    <td className="px-4 py-3">{p.leadTime || 'NAN'}</td>
                    
                    {/* Inline Editable cell for List Price */}
                    <td className="px-4 py-3">
                      <EditableCell 
                        value={p.listPrice} 
                        onSave={(val) => handleCellSave(p.id, 'listPrice', val)}
                        type="number"
                        disabled={!canWritePrice}
                      />
                    </td>

                    {/* Inline Editable cell for Discount */}
                    <td className="px-4 py-3">
                      <EditableCell 
                        value={p.discount} 
                        onSave={(val) => handleCellSave(p.id, 'discount', val)}
                        type="number"
                        suffix="%"
                        disabled={!canWritePrice}
                      />
                    </td>

                    {/* Calculated sales fields (static presentation read from db calculations) */}
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ₹{p.salesPrice ? p.salesPrice.toFixed(2) : '0.00'}
                    </td>
                    
                    <td className={`px-4 py-3 font-semibold ${p.salesMargin >= 20 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {p.salesMargin ?? 0}%
                    </td>

                    {canWriteProducts && (
                      <td className="px-4 py-3 text-center flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 text-slate-400 hover:text-bosch-blue hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setItemToDelete({ id: p.id, productName: p.productName })}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500 font-semibold text-sm">No items found matching the selected search query.</p>
          </div>
        )}
      </div>

      {/* Hidden file selector for image cell */}
      <input 
        type="file"
        ref={imageInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* Modal: Add Product Manually */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative border border-slate-200 dark:border-slate-800"
            >
              <button 
                onClick={() => { if (!isSubmittingAdd) { setShowAddModal(false); setAddModalError(''); } }}
                disabled={isSubmittingAdd}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b dark:border-slate-800 pb-3 mb-5">Add New Product</h3>

            {addModalError && (
              <div className="mb-5 flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                <span>{addModalError}</span>
              </div>
            )}
            
            <form onSubmit={handleAddItemSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Application</label>
                  <input type="text" required disabled={isSubmittingAdd} value={newItem.application} onChange={e => setNewItem({...newItem, application: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
                  <select disabled={isSubmittingAdd} value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold text-slate-600 disabled:opacity-50">
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Product Name</label>
                  <input type="text" required disabled={isSubmittingAdd} value={newItem.productName} onChange={e => setNewItem({...newItem, productName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Product Image</label>
                  <input type="file" disabled={isSubmittingAdd} onChange={e => setProductImage(e.target.files[0])} accept="image/*" className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Make</label>
                  <input type="text" disabled={isSubmittingAdd} value={newItem.make} onChange={e => setNewItem({...newItem, make: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Model</label>
                  <input type="text" disabled={isSubmittingAdd} value={newItem.model} onChange={e => setNewItem({...newItem, model: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Specification</label>
                  <input type="text" disabled={isSubmittingAdd} value={newItem.specification} onChange={e => setNewItem({...newItem, specification: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">UOM</label>
                  <input type="text" required disabled={isSubmittingAdd} value={newItem.uom} onChange={e => setNewItem({...newItem, uom: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Buying Price (₹)</label>
                  <input type="number" step="0.01" min="0" required disabled={isSubmittingAdd} value={newItem.buyingPrice} onChange={e => setNewItem({...newItem, buyingPrice: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Vendor</label>
                  <input type="text" disabled={isSubmittingAdd} value={newItem.vendor} onChange={e => setNewItem({...newItem, vendor: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Quotation month</label>
                  <input type="text" placeholder="e.g. Mar 2025" disabled={isSubmittingAdd} value={newItem.quotationReceivedMonth} onChange={e => setNewItem({...newItem, quotationReceivedMonth: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Lead Time</label>
                  <input type="text" disabled={isSubmittingAdd} value={newItem.leadTime} onChange={e => setNewItem({...newItem, leadTime: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Remarks</label>
                  <input type="text" disabled={isSubmittingAdd} value={newItem.remarks} onChange={e => setNewItem({...newItem, remarks: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">List Price (₹)</label>
                  <input type="number" step="0.01" min="0" required disabled={isSubmittingAdd} value={newItem.listPrice} onChange={e => setNewItem({...newItem, listPrice: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Discount (%)</label>
                  <input type="number" min="0" max="100" required disabled={isSubmittingAdd} value={newItem.discount} onChange={e => setNewItem({...newItem, discount: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" disabled={isSubmittingAdd} onClick={() => { setShowAddModal(false); setAddModalError(''); }} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSubmittingAdd} className="px-5 py-2 bg-bosch-blue hover:bg-bosch-lightBlue text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50">
                  {isSubmittingAdd ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Create Product'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Modal: Spreadsheet Bulk Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative border border-slate-200">
            <button 
              onClick={() => !isUploading && setShowUploadModal(false)}
              disabled={isUploading}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-5 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-bosch-blue" />
              Upload Ratecard Sheet
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Select Sheet File</label>
                <input 
                  type="file" 
                  required
                  disabled={isUploading}
                  ref={fileInputRef}
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  accept=".csv,.xlsx,.xls"
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 disabled:opacity-50"
                />
                <p className="text-[10px] text-slate-400 mt-1">Accepted types: .csv, .xlsx, .xls</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Import Category Filter</label>
                <select 
                  value={uploadCategory} 
                  disabled={isUploading}
                  onChange={e => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold text-slate-600 disabled:opacity-50"
                >
                  <option value="all">All Categories</option>
                  <option value="hardware">Hardware Only</option>
                  <option value="software">Software Only</option>
                  <option value="service">Service Only</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" disabled={isUploading} onClick={() => setShowUploadModal(false)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isUploading || !uploadFile} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-2 disabled:opacity-50">
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload file'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lazy Loader Modal: Active Processing Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl border border-slate-100">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-bosch-blue rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-bosch-blue animate-pulse" />
              </div>
            </div>
            
            <h4 className="text-base font-bold text-slate-900 mb-1">Optimized Bulk Import Active</h4>
            <p className="text-xs text-slate-500 font-medium mb-4">Reading spreadsheet, filtering duplicate catalog keys, and saving entries in batches...</p>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3 relative">
              <div className="bg-gradient-to-r from-bosch-blue to-teal-400 h-full w-full animate-pulse"></div>
            </div>

            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Please do not close or refresh the page</span>
          </div>
        </div>
      )}

      {/* Modal: Single Item Delete Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 relative border border-slate-200">
            <button 
              onClick={() => !isDeletingSingle && setItemToDelete(null)}
              disabled={isDeletingSingle}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-rose-500 mb-2">Delete Product</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{itemToDelete.productName}"</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                type="button" 
                disabled={isDeletingSingle} 
                onClick={() => setItemToDelete(null)} 
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={isDeletingSingle} 
                onClick={handleConfirmSingleDelete} 
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isDeletingSingle ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Product'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Wipe Database Confirmation */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 relative border border-slate-200">
            <button 
              onClick={() => !isDeletingAll && setShowDeleteAllModal(false)}
              disabled={isDeletingAll}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-rose-500 mb-2">Wipe Database</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Are you absolutely sure you want to delete all inventory items? This operation cannot be undone and will erase all data, including uploaded images.</p>

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <button type="button" disabled={isDeletingAll} onClick={() => setShowDeleteAllModal(false)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl disabled:opacity-50">Cancel</button>
              <button type="button" disabled={isDeletingAll} onClick={handleDeleteAll} className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50">
                {isDeletingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Wiping Data...
                  </>
                ) : (
                  'Wipe Data'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Full Specification */}
      {selectedSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative border border-slate-200">
            <button 
              onClick={() => setSelectedSpec(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-bosch-blue/10 text-bosch-blue font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Specification</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 pr-6 leading-snug">{selectedSpec.productName}</h3>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-h-[300px] overflow-y-auto text-xs text-slate-600 font-semibold whitespace-pre-wrap leading-relaxed shadow-inner">
              {selectedSpec.specification}
            </div>
            
            <div className="flex justify-end pt-4 border-t mt-5">
              <button 
                onClick={() => setSelectedSpec(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Product Manually */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative border border-slate-200">
            <button 
              onClick={() => { if (!isSubmittingEdit) { setShowEditModal(false); setEditItem(null); setEditModalError(''); } }}
              disabled={isSubmittingEdit}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-5">Edit Product Details</h3>

            {editModalError && (
              <div className="mb-5 flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                <span>{editModalError}</span>
              </div>
            )}
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Application</label>
                  <input type="text" required disabled={isSubmittingEdit} value={editItem.application || ''} onChange={e => setEditItem({...editItem, application: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
                  <select disabled={isSubmittingEdit} value={editItem.category || 'hardware'} onChange={e => setEditItem({...editItem, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold text-slate-600 disabled:opacity-50">
                    <option value="hardware">Hardware</option>
                    <option value="software">Software</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Product Name</label>
                  <input type="text" required disabled={isSubmittingEdit} value={editItem.productName || ''} onChange={e => setEditItem({...editItem, productName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Make</label>
                  <input type="text" disabled={isSubmittingEdit} value={editItem.make || ''} onChange={e => setEditItem({...editItem, make: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Model</label>
                  <input type="text" disabled={isSubmittingEdit} value={editItem.model || ''} onChange={e => setEditItem({...editItem, model: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">UOM</label>
                  <input type="text" required disabled={isSubmittingEdit} value={editItem.uom || ''} onChange={e => setEditItem({...editItem, uom: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Buying Price (₹)</label>
                  <input type="number" step="0.01" min="0" required disabled={isSubmittingEdit} value={editItem.buyingPrice || ''} onChange={e => setEditItem({...editItem, buyingPrice: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Vendor</label>
                  <input type="text" disabled={isSubmittingEdit} value={editItem.vendor || ''} onChange={e => setEditItem({...editItem, vendor: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Quotation month</label>
                  <input type="text" placeholder="e.g. Mar 2025" disabled={isSubmittingEdit} value={editItem.quotationReceivedMonth || ''} onChange={e => setEditItem({...editItem, quotationReceivedMonth: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Lead Time</label>
                  <input type="text" disabled={isSubmittingEdit} value={editItem.leadTime || ''} onChange={e => setEditItem({...editItem, leadTime: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Remarks</label>
                  <input type="text" disabled={isSubmittingEdit} value={editItem.remarks || ''} onChange={e => setEditItem({...editItem, remarks: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">List Price (₹)</label>
                  <input type="number" step="0.01" min="0" required disabled={isSubmittingEdit} value={editItem.listPrice || ''} onChange={e => setEditItem({...editItem, listPrice: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Discount (%)</label>
                  <input type="number" min="0" max="100" required disabled={isSubmittingEdit} value={editItem.discount || '0'} onChange={e => setEditItem({...editItem, discount: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Specification</label>
                <textarea rows="3" disabled={isSubmittingEdit} value={editItem.specification || ''} onChange={e => setEditItem({...editItem, specification: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-bosch-blue focus:outline-none text-sm font-semibold disabled:opacity-50" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" disabled={isSubmittingEdit} onClick={() => { setShowEditModal(false); setEditItem(null); setEditModalError(''); }} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs rounded-xl disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSubmittingEdit} className="px-5 py-2 bg-bosch-blue hover:bg-bosch-lightBlue text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50">
                  {isSubmittingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
