import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MysteryBox = ({ boxId, userPoints, onPurchaseComplete }) => {
  const [boxData, setBoxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [wonItem, setWonItem] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Fetch box data on mount
  useEffect(() => {
    fetchBoxData();
  }, [boxId]);

  const fetchBoxData = async () => {
    try {
      const response = await fetch(`/api/mystery-boxes/${boxId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setBoxData(data.data);
      }
    } catch (error) {
      console.error('Error fetching box:', error);
    } finally {
      setLoading(false);
    }
  };

  const openBox = async () => {
    if (opening || userPoints < boxData.mysteryBox.price) return;

    setOpening(true);
    setShowResult(false);

    try {
      // Call API to open box
      const response = await fetch(`/api/mystery-boxes/${boxId}/open`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Delay showing result for animation
        setTimeout(() => {
          setWonItem(data.data.wonItem);
          setShowResult(true);
          setOpening(false);
          
          if (onPurchaseComplete) {
            onPurchaseComplete(data.data);
          }
        }, 3000); // 3 second animation
      } else {
        alert(data.message);
        setOpening(false);
      }
    } catch (error) {
      console.error('Error opening box:', error);
      alert('Failed to open mystery box');
      setOpening(false);
    }
  };

  const resetBox = () => {
    setWonItem(null);
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-2xl text-emerald-400 font-bold animate-pulse">
          Loading Mystery Box...
        </div>
      </div>
    );
  }

  const { mysteryBox, items, statistics } = boxData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-purple-500 mb-4">
            {mysteryBox.name}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            {mysteryBox.description}
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <div className="bg-gray-800/50 rounded-lg px-6 py-3 border border-emerald-500/30">
              <div className="text-gray-400 text-sm">Price</div>
              <div className="text-2xl font-bold text-emerald-400">{mysteryBox.price} Points</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-6 py-3 border border-purple-500/30">
              <div className="text-gray-400 text-sm">Your Balance</div>
              <div className="text-2xl font-bold text-purple-400">{userPoints} Points</div>
            </div>
          </div>
        </div>

        {/* Main Box Display */}
        <div className="relative mb-12">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="box"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                {/* Mystery Box */}
                <motion.div
                  className="relative w-80 h-80 mb-8"
                  animate={opening ? {
                    rotate: [0, -5, 5, -5, 5, 0],
                    scale: [1, 1.05, 0.95, 1.05, 0.95, 1],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: opening ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-3xl blur-3xl opacity-50 animate-pulse" />
                  
                  {/* Box container */}
                  <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border-4 border-emerald-500 shadow-2xl overflow-hidden">
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    
                    {/* Question mark */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="text-9xl font-black text-emerald-400"
                        animate={opening ? {
                          scale: [1, 1.2, 0.8, 1.2, 0.8, 1],
                          rotate: [0, 10, -10, 10, -10, 0]
                        } : {}}
                        transition={{ duration: 0.5, repeat: opening ? Infinity : 0 }}
                      >
                        ?
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Open Button */}
                <motion.button
                  onClick={openBox}
                  disabled={opening || userPoints < mysteryBox.price}
                  className={`relative px-12 py-4 text-xl font-bold rounded-xl transition-all ${
                    opening || userPoints < mysteryBox.price
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105'
                  }`}
                  whileHover={!opening && userPoints >= mysteryBox.price ? { scale: 1.05 } : {}}
                  whileTap={!opening && userPoints >= mysteryBox.price ? { scale: 0.95 } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span>{opening ? 'Opening...' : 'Open Mystery Box'}</span>
                    <motion.div
                      animate={opening ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: opening ? Infinity : 0, ease: "linear" }}
                    >
                      {opening ? '⏳' : '🎁'}
                    </motion.div>
                  </div>
                </motion.button>

                {userPoints < mysteryBox.price && (
                  <p className="text-red-400 mt-4">Insufficient points to open this box</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="flex flex-col items-center"
              >
                {/* Won Item Display */}
                <div className="relative">
                  {/* Rarity glow */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl blur-3xl"
                    style={{ backgroundColor: wonItem.rarityColor }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <div className="relative bg-gray-800 rounded-3xl p-8 border-4" style={{ borderColor: wonItem.rarityColor }}>
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl mb-4"
                      >
                        🎉
                      </motion.div>
                      <h2 className="text-4xl font-black mb-2" style={{ color: wonItem.rarityColor }}>
                        {wonItem.rarity.toUpperCase()}
                      </h2>
                      <h3 className="text-3xl font-bold text-white mb-2">{wonItem.name}</h3>
                      <p className="text-gray-400">{wonItem.description}</p>
                    </div>

                    <img 
                      src={wonItem.imageUrl} 
                      alt={wonItem.name}
                      className="w-64 h-64 object-cover rounded-xl mx-auto mb-6"
                    />

                    <div className="flex justify-center gap-4 text-center">
                      <div className="bg-gray-900 rounded-lg px-6 py-3">
                        <div className="text-gray-400 text-sm">Value</div>
                        <div className="text-2xl font-bold text-emerald-400">{wonItem.value} Points</div>
                      </div>
                      <div className="bg-gray-900 rounded-lg px-6 py-3">
                        <div className="text-gray-400 text-sm">Type</div>
                        <div className="text-xl font-bold text-purple-400">{wonItem.itemType}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <motion.button
                    onClick={resetBox}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Open Another Box
                  </motion.button>
                  <motion.button
                    onClick={() => window.location.href = '/inventory'}
                    className="px-8 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Inventory
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Available Items Preview */}
        {!showResult && (
          <div className="mt-16">
            <h2 className="text-3xl font-black text-white mb-8 text-center">Possible Rewards</h2>
            
            {Object.entries(items).map(([rarity, itemList]) => (
              <div key={rarity} className="mb-8">
                <h3 className="text-xl font-bold text-gray-300 mb-4 capitalize flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: itemList[0].rarityColor }} />
                  {rarity} Items
                  <span className="text-sm text-gray-500">
                    ({itemList[0].dropChance}% chance)
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {itemList.map(item => (
                    <div 
                      key={item.id}
                      className="bg-gray-800 rounded-lg p-3 border-2 hover:scale-105 transition-transform"
                      style={{ borderColor: item.rarityColor }}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <div className="text-sm font-bold text-white truncate">{item.name}</div>
                      <div className="text-xs text-emerald-400">{item.value} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-12 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-gray-400 mb-2">Total Opens</div>
              <div className="text-3xl font-black text-white">{mysteryBox.totalOpens}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-2">Total Items</div>
              <div className="text-3xl font-black text-white">{statistics.totalItems}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-2">Expected Return</div>
              <div className="text-3xl font-black text-emerald-400">{statistics.expectedReturn}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MysteryBox;
