import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProductStore = ({ userPoints, onPurchaseComplete }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParam = filter !== 'all' ? `?category=${filter}` : '';
      const response = await fetch(`/api/products${queryParam}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct || purchasing) return;

    setPurchasing(true);

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Purchase successful! Check your orders for account details.');
        setShowModal(false);
        fetchProducts(); // Refresh products
        
        if (onPurchaseComplete) {
          onPurchaseComplete(data.data);
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to complete purchase');
    } finally {
      setPurchasing(false);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      in_stock: { text: 'In Stock', color: 'bg-emerald-500' },
      sold_out: { text: 'Sold Out', color: 'bg-red-500' },
      reserved: { text: 'Reserved', color: 'bg-yellow-500' }
    };
    
    const badge = badges[status] || badges.in_stock;
    
    return (
      <span className={`${badge.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
        {badge.text}
      </span>
    );
  };

  const categories = [
    { value: 'all', label: 'All Items', icon: '🎮' },
    { value: 'roblox_account', label: 'Accounts', icon: '👤' },
    { value: 'robux', label: 'Robux', icon: '💎' },
    { value: 'gamepass', label: 'Gamepasses', icon: '🎫' },
    { value: 'limited_item', label: 'Limited Items', icon: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-purple-500 mb-4">
            Premium Store
          </h1>
          <p className="text-gray-300 text-lg">
            High-value Roblox accounts and items
          </p>
          <div className="flex justify-center mt-6">
            <div className="bg-gray-800/50 rounded-xl px-8 py-4 border border-emerald-500/30">
              <div className="text-gray-400 text-sm">Your Balance</div>
              <div className="text-3xl font-black text-emerald-400">{userPoints} Points</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <motion.button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                filter === cat.value
                  ? 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No products found</h3>
            <p className="text-gray-500">Check back later for new items!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-700 hover:border-emerald-500 transition-all group cursor-pointer"
                onClick={() => openProductModal(product)}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                {/* Featured Badge */}
                {product.isFeatured && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ Featured
                  </div>
                )}

                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-900">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(product.stockStatus)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Roblox Details */}
                  {product.robloxDetails && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {product.robloxDetails.level && (
                        <div className="bg-gray-900 rounded-lg px-3 py-2">
                          <div className="text-xs text-gray-500">Level</div>
                          <div className="text-sm font-bold text-purple-400">{product.robloxDetails.level}</div>
                        </div>
                      )}
                      {product.robloxDetails.robuxAmount && (
                        <div className="bg-gray-900 rounded-lg px-3 py-2">
                          <div className="text-xs text-gray-500">Robux</div>
                          <div className="text-sm font-bold text-emerald-400">{product.robloxDetails.robuxAmount}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price and Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="text-2xl font-black text-emerald-400">{product.price}</div>
                      <div className="text-xs text-gray-500">Points</div>
                    </div>
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductModal(product);
                      }}
                      disabled={product.stockStatus !== 'in_stock'}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        product.stockStatus === 'in_stock'
                          ? 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white hover:shadow-lg'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                      whileHover={product.stockStatus === 'in_stock' ? { scale: 1.05 } : {}}
                      whileTap={product.stockStatus === 'in_stock' ? { scale: 0.95 } : {}}
                    >
                      {product.stockStatus === 'in_stock' ? 'Buy Now' : 'Unavailable'}
                    </motion.button>
                  </div>

                  {/* Views */}
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                    <span>👁️</span>
                    {product.views} views
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showModal && selectedProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-3xl max-w-2xl w-full border-2 border-emerald-500 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="relative h-64 bg-gray-900">
              <img 
                src={selectedProduct.imageUrl} 
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent" />
            </div>

            <div className="p-8">
              <h2 className="text-3xl font-black text-white mb-4">{selectedProduct.title}</h2>
              <p className="text-gray-300 mb-6">{selectedProduct.description}</p>

              {/* Details Grid */}
              {selectedProduct.robloxDetails && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {selectedProduct.robloxDetails.username && (
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Username</div>
                      <div className="text-sm font-bold text-white">{selectedProduct.robloxDetails.username}</div>
                    </div>
                  )}
                  {selectedProduct.robloxDetails.level && (
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Level</div>
                      <div className="text-sm font-bold text-purple-400">{selectedProduct.robloxDetails.level}</div>
                    </div>
                  )}
                  {selectedProduct.robloxDetails.robuxAmount && (
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Robux</div>
                      <div className="text-sm font-bold text-emerald-400">{selectedProduct.robloxDetails.robuxAmount}</div>
                    </div>
                  )}
                  {selectedProduct.robloxDetails.rareSkins && selectedProduct.robloxDetails.rareSkins.length > 0 && (
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Rare Skins</div>
                      <div className="text-sm font-bold text-yellow-400">{selectedProduct.robloxDetails.rareSkins.length}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-gray-900 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Product Price</span>
                  <span className="text-2xl font-bold text-emerald-400">{selectedProduct.price} Points</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Your Balance</span>
                  <span className="text-xl font-bold text-white">{userPoints} Points</span>
                </div>
                <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                  <span className="text-gray-400">Balance After Purchase</span>
                  <span className={`text-xl font-bold ${userPoints - selectedProduct.price >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {userPoints - selectedProduct.price} Points
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  onClick={handlePurchase}
                  disabled={purchasing || userPoints < selectedProduct.price || selectedProduct.stockStatus !== 'in_stock'}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                    purchasing || userPoints < selectedProduct.price || selectedProduct.stockStatus !== 'in_stock'
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white hover:shadow-2xl'
                  }`}
                  whileHover={!purchasing && userPoints >= selectedProduct.price && selectedProduct.stockStatus === 'in_stock' ? { scale: 1.02 } : {}}
                  whileTap={!purchasing && userPoints >= selectedProduct.price && selectedProduct.stockStatus === 'in_stock' ? { scale: 0.98 } : {}}
                >
                  {purchasing ? 'Processing...' : userPoints < selectedProduct.price ? 'Insufficient Points' : 'Confirm Purchase'}
                </motion.button>
                
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-4 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductStore;
