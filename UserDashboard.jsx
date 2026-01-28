import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [processingTopUp, setProcessingTopUp] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [userRes, ordersRes, inventoryRes, transactionsRes] = await Promise.all([
        fetch('/api/auth/me', { headers }),
        fetch('/api/user/orders', { headers }),
        fetch('/api/user/inventory', { headers }),
        fetch('/api/transactions', { headers })
      ]);

      const [userData, ordersData, inventoryData, transactionsData] = await Promise.all([
        userRes.json(),
        ordersRes.json(),
        inventoryRes.json(),
        transactionsRes.json()
      ]);

      if (userData.success) setUserData(userData.data.user);
      if (ordersData.success) setOrders(ordersData.data.orders);
      if (inventoryData.success) setInventory(inventoryData.data.inventory);
      if (transactionsData.success) setTransactions(transactionsData.data.transactions);

    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!topUpAmount || topUpAmount <= 0) return;

    setProcessingTopUp(true);

    try {
      const response = await fetch('/api/transactions/top-up', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseInt(topUpAmount),
          paymentMethod: 'credit_card' // In production, integrate real payment
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully added ${topUpAmount} points!`);
        setTopUpAmount('');
        fetchDashboardData(); // Refresh data
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Top-up error:', error);
      alert('Failed to process top-up');
    } finally {
      setProcessingTopUp(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <motion.div
          className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'inventory', label: 'Inventory', icon: '🎒' },
    { id: 'transactions', label: 'Transactions', icon: '💳' }
  ];

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9CA3AF',
      uncommon: '#10B981',
      rare: '#3B82F6',
      epic: '#A855F7',
      legendary: '#F59E0B'
    };
    return colors[rarity] || '#9CA3AF';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-purple-500">
                Dashboard
              </h1>
              <p className="text-gray-400 mt-2">Welcome back, {userData?.username}!</p>
            </div>
            <motion.button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white"
            >
              <div className="text-sm opacity-80 mb-2">Point Balance</div>
              <div className="text-4xl font-black">{userData?.pointBalance}</div>
              <div className="text-xs opacity-70 mt-1">Points</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white"
            >
              <div className="text-sm opacity-80 mb-2">Total Orders</div>
              <div className="text-4xl font-black">{orders.length}</div>
              <div className="text-xs opacity-70 mt-1">Purchases</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white"
            >
              <div className="text-sm opacity-80 mb-2">Inventory Items</div>
              <div className="text-4xl font-black">{inventory.length}</div>
              <div className="text-xs opacity-70 mt-1">Items Won</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl p-6 text-white"
            >
              <div className="text-sm opacity-80 mb-2">Total Value</div>
              <div className="text-4xl font-black">
                {inventory.reduce((sum, inv) => sum + inv.item.value, 0)}
              </div>
              <div className="text-xs opacity-70 mt-1">Points</div>
            </motion.div>
          </div>

          {/* Top-up Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 mb-8"
          >
            <h3 className="text-2xl font-bold text-white mb-4">💰 Top-up Points</h3>
            <form onSubmit={handleTopUp} className="flex gap-4">
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount (e.g., 100)"
                className="flex-1 px-6 py-4 bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                min="1"
              />
              <motion.button
                type="submit"
                disabled={processingTopUp || !topUpAmount}
                className={`px-8 py-4 rounded-xl font-bold text-lg ${
                  processingTopUp || !topUpAmount
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white hover:shadow-2xl'
                }`}
                whileHover={!processingTopUp && topUpAmount ? { scale: 1.05 } : {}}
                whileTap={!processingTopUp && topUpAmount ? { scale: 0.95 } : {}}
              >
                {processingTopUp ? 'Processing...' : 'Add Points'}
              </motion.button>
            </form>
            <p className="text-gray-400 text-sm mt-3">
              💡 Demo mode: Points are added instantly. In production, integrate real payment gateway.
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Recent Orders</h3>
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="bg-gray-900 rounded-lg p-4 mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-semibold">
                          {order.orderType === 'mystery_box' ? '🎁 Mystery Box' : '📦 Direct Purchase'}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-emerald-400 font-bold">{order.totalPrice} pts</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Best Items</h3>
                {inventory.slice(0, 5).map(inv => (
                  <div key={inv.id} className="bg-gray-900 rounded-lg p-4 mb-3 flex items-center gap-4">
                    <img 
                      src={inv.item.imageUrl} 
                      alt={inv.item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-white font-semibold">{inv.item.name}</div>
                      <div className="text-xs" style={{ color: getRarityColor(inv.item.rarity) }}>
                        {inv.item.rarity.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-emerald-400 font-bold">{inv.item.value} pts</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">All Orders</h3>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-400">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-gray-900 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-white font-bold text-lg mb-1">
                            {order.orderType === 'mystery_box' ? '🎁 Mystery Box Opening' : '📦 Product Purchase'}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Order ID: {order.id} • {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold text-xl">{order.totalPrice} points</div>
                          <div className="text-gray-500 text-sm">{order.status}</div>
                        </div>
                      </div>

                      {order.product && (
                        <div className="flex items-center gap-4 bg-gray-800 rounded-lg p-4">
                          <img 
                            src={order.product.imageUrl} 
                            alt={order.product.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-white font-semibold">{order.product.title}</div>
                            <div className="text-gray-400 text-sm">{order.product.category}</div>
                          </div>
                        </div>
                      )}

                      {order.wonItem && (
                        <div className="flex items-center gap-4 bg-gray-800 rounded-lg p-4">
                          <img 
                            src={order.wonItem.imageUrl} 
                            alt={order.wonItem.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="text-white font-semibold">{order.wonItem.name}</div>
                            <div className="text-sm" style={{ color: getRarityColor(order.wonItem.rarity) }}>
                              {order.wonItem.rarity.toUpperCase()} • {order.wonItem.value} pts value
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Your Inventory</h3>
                <div className="text-gray-400">
                  Total Value: <span className="text-emerald-400 font-bold">
                    {inventory.reduce((sum, inv) => sum + inv.item.value, 0)} pts
                  </span>
                </div>
              </div>

              {inventory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎒</div>
                  <p className="text-gray-400">No items in inventory</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inventory.map(inv => (
                    <motion.div
                      key={inv.id}
                      className="bg-gray-900 rounded-xl overflow-hidden border-2 hover:scale-105 transition-transform"
                      style={{ borderColor: getRarityColor(inv.item.rarity) }}
                      whileHover={{ y: -5 }}
                    >
                      <img 
                        src={inv.item.imageUrl} 
                        alt={inv.item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="text-sm mb-2" style={{ color: getRarityColor(inv.item.rarity) }}>
                          {inv.item.rarity.toUpperCase()}
                        </div>
                        <div className="text-white font-bold text-lg mb-2">{inv.item.name}</div>
                        <div className="text-gray-400 text-sm mb-3">{inv.item.description}</div>
                        <div className="flex justify-between items-center">
                          <div className="text-emerald-400 font-bold">{inv.item.value} pts</div>
                          <div className="text-gray-500 text-xs">
                            {new Date(inv.wonAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Transaction History</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💳</div>
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div key={tx._id} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          tx.type === 'top_up' || tx.type === 'bonus' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        }`}>
                          {tx.type === 'top_up' ? '➕' : tx.type === 'bonus' ? '🎁' : '➖'}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{tx.description}</div>
                          <div className="text-gray-400 text-sm">
                            {new Date(tx.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-xl ${
                          tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </div>
                        <div className="text-gray-500 text-sm">
                          Balance: {tx.balanceAfter}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.a
            href="/store"
            className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-center text-white hover:shadow-2xl transition-shadow"
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-5xl mb-3">🏪</div>
            <div className="text-xl font-bold mb-2">Visit Store</div>
            <div className="text-sm opacity-80">Browse premium accounts</div>
          </motion.a>

          <motion.a
            href="/mystery-boxes"
            className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-center text-white hover:shadow-2xl transition-shadow"
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-5xl mb-3">🎁</div>
            <div className="text-xl font-bold mb-2">Mystery Boxes</div>
            <div className="text-sm opacity-80">Try your luck!</div>
          </motion.a>

          <motion.a
            href="/profile"
            className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl p-6 text-center text-white hover:shadow-2xl transition-shadow"
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-5xl mb-3">⚙️</div>
            <div className="text-xl font-bold mb-2">Settings</div>
            <div className="text-sm opacity-80">Manage your account</div>
          </motion.a>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
