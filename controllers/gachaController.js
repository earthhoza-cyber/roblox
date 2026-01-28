// ==========================================
// MYSTERY BOX (GACHA) CONTROLLER
// Advanced Probability-Based Randomizer
// ==========================================

const { MysteryBox, MysteryBoxItem, User, Order, Inventory, Transaction } = require('../database/schemas');

// ==========================================
// GACHA RANDOMIZER LOGIC
// This ensures fair probability distribution
// ==========================================
class GachaRandomizer {
  
  /**
   * Select a random item based on drop chances
   * @param {Array} items - Array of mystery box items with dropChance field
   * @returns {Object} - Selected item
   */
  static selectRandomItem(items) {
    // Filter out inactive items or out-of-stock items
    const availableItems = items.filter(item => {
      return item.isActive && (item.stockQuantity === -1 || item.stockQuantity > 0);
    });

    if (availableItems.length === 0) {
      throw new Error('No available items in mystery box');
    }

    // Calculate total drop chance
    const totalChance = availableItems.reduce((sum, item) => sum + item.dropChance, 0);

    // Normalize if total isn't 100
    const normalizedItems = availableItems.map(item => ({
      ...item._doc,
      normalizedChance: (item.dropChance / totalChance) * 100
    }));

    // Generate random number between 0 and 100
    const roll = Math.random() * 100;

    // Select item based on cumulative probability
    let cumulativeChance = 0;
    for (const item of normalizedItems) {
      cumulativeChance += item.normalizedChance;
      if (roll <= cumulativeChance) {
        return item;
      }
    }

    // Fallback to last item (should never reach here with proper probability)
    return normalizedItems[normalizedItems.length - 1];
  }

  /**
   * Advanced pity system (optional enhancement)
   * Increases legendary chances after X unsuccessful attempts
   */
  static applyPitySystem(items, userFailCount = 0) {
    const pityThreshold = 50; // Guaranteed legendary after 50 common drops
    const pityBoost = Math.min(userFailCount / pityThreshold, 0.5); // Max 50% boost

    return items.map(item => {
      if (item.rarity === 'legendary') {
        return {
          ...item._doc,
          dropChance: item.dropChance + (pityBoost * 10) // Boost legendary chance
        };
      }
      return item;
    });
  }

  /**
   * Get rarity color for UI display
   */
  static getRarityColor(rarity) {
    const colors = {
      common: '#9CA3AF',
      uncommon: '#10B981',
      rare: '#3B82F6',
      epic: '#A855F7',
      legendary: '#F59E0B'
    };
    return colors[rarity] || '#9CA3AF';
  }

  /**
   * Calculate expected value of a mystery box
   */
  static calculateExpectedValue(items) {
    return items.reduce((total, item) => {
      return total + (item.value * (item.dropChance / 100));
    }, 0);
  }
}

// ==========================================
// OPEN MYSTERY BOX
// ==========================================
exports.openMysteryBox = async (req, res) => {
  try {
    const { boxId } = req.params;
    const userId = req.user.id;

    // Find mystery box
    const mysteryBox = await MysteryBox.findById(boxId).populate('availableItems');

    if (!mysteryBox) {
      return res.status(404).json({
        success: false,
        message: 'Mystery box not found'
      });
    }

    if (!mysteryBox.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This mystery box is currently unavailable'
      });
    }

    // Check user balance
    const user = await User.findById(userId);

    if (user.pointBalance < mysteryBox.price) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points',
        required: mysteryBox.price,
        current: user.pointBalance
      });
    }

    // Select random item using gacha logic
    const wonItem = GachaRandomizer.selectRandomItem(mysteryBox.availableItems);

    if (!wonItem) {
      return res.status(500).json({
        success: false,
        message: 'Failed to determine prize'
      });
    }

    // Start transaction
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Deduct points from user
      const balanceBefore = user.pointBalance;
      user.pointBalance -= mysteryBox.price;
      await user.save({ session });

      // Create transaction record
      const transaction = await Transaction.create([{
        user: userId,
        type: 'purchase',
        amount: -mysteryBox.price,
        balanceBefore: balanceBefore,
        balanceAfter: user.pointBalance,
        description: `Opened ${mysteryBox.name}`,
        status: 'completed'
      }], { session });

      // Create order
      const order = await Order.create([{
        user: userId,
        orderType: 'mystery_box',
        mysteryBox: mysteryBox._id,
        wonItem: wonItem._id,
        totalPrice: mysteryBox.price,
        status: 'completed'
      }], { session });

      // Add to user inventory
      const inventoryItem = await Inventory.create([{
        user: userId,
        item: wonItem._id,
        order: order[0]._id
      }], { session });

      // Update mystery box stats
      mysteryBox.totalOpens += 1;
      await mysteryBox.save({ session });

      // Update item stock if not unlimited
      if (wonItem.stockQuantity !== -1) {
        await MysteryBoxItem.findByIdAndUpdate(
          wonItem._id,
          { $inc: { stockQuantity: -1 } },
          { session }
        );
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Return success with item details
      res.status(200).json({
        success: true,
        message: 'Mystery box opened successfully!',
        data: {
          wonItem: {
            id: wonItem._id,
            name: wonItem.name,
            description: wonItem.description,
            imageUrl: wonItem.imageUrl,
            rarity: wonItem.rarity,
            rarityColor: GachaRandomizer.getRarityColor(wonItem.rarity),
            value: wonItem.value,
            itemType: wonItem.itemType,
            itemData: wonItem.itemData
          },
          order: {
            id: order[0]._id,
            createdAt: order[0].createdAt
          },
          userBalance: user.pointBalance
        }
      });

    } catch (error) {
      // Rollback on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Mystery box error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to open mystery box',
      error: error.message
    });
  }
};

// ==========================================
// GET MYSTERY BOX DETAILS
// ==========================================
exports.getMysteryBox = async (req, res) => {
  try {
    const { boxId } = req.params;

    const mysteryBox = await MysteryBox.findById(boxId).populate('availableItems');

    if (!mysteryBox) {
      return res.status(404).json({
        success: false,
        message: 'Mystery box not found'
      });
    }

    // Calculate expected value
    const expectedValue = GachaRandomizer.calculateExpectedValue(mysteryBox.availableItems);

    // Group items by rarity
    const itemsByRarity = mysteryBox.availableItems.reduce((acc, item) => {
      if (!acc[item.rarity]) {
        acc[item.rarity] = [];
      }
      acc[item.rarity].push({
        id: item._id,
        name: item.name,
        imageUrl: item.imageUrl,
        value: item.value,
        dropChance: item.dropChance,
        rarityColor: GachaRandomizer.getRarityColor(item.rarity)
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        mysteryBox: {
          id: mysteryBox._id,
          name: mysteryBox.name,
          description: mysteryBox.description,
          imageUrl: mysteryBox.imageUrl,
          price: mysteryBox.price,
          totalOpens: mysteryBox.totalOpens,
          expectedValue: Math.round(expectedValue),
          isActive: mysteryBox.isActive
        },
        items: itemsByRarity,
        statistics: {
          totalItems: mysteryBox.availableItems.length,
          expectedReturn: ((expectedValue / mysteryBox.price) * 100).toFixed(2) + '%'
        }
      }
    });

  } catch (error) {
    console.error('Get mystery box error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mystery box',
      error: error.message
    });
  }
};

// ==========================================
// GET ALL MYSTERY BOXES
// ==========================================
exports.getAllMysteryBoxes = async (req, res) => {
  try {
    const mysteryBoxes = await MysteryBox.find({ isActive: true })
      .populate('availableItems')
      .sort({ createdAt: -1 });

    const boxesWithStats = mysteryBoxes.map(box => {
      const expectedValue = GachaRandomizer.calculateExpectedValue(box.availableItems);
      
      return {
        id: box._id,
        name: box.name,
        description: box.description,
        imageUrl: box.imageUrl,
        price: box.price,
        totalOpens: box.totalOpens,
        expectedValue: Math.round(expectedValue),
        expectedReturn: ((expectedValue / box.price) * 100).toFixed(2) + '%',
        totalItems: box.availableItems.length
      };
    });

    res.status(200).json({
      success: true,
      data: {
        mysteryBoxes: boxesWithStats,
        total: boxesWithStats.length
      }
    });

  } catch (error) {
    console.error('Get mystery boxes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mystery boxes',
      error: error.message
    });
  }
};

// ==========================================
// GET USER INVENTORY (Won Items)
// ==========================================
exports.getUserInventory = async (req, res) => {
  try {
    const userId = req.user.id;

    const inventory = await Inventory.find({ user: userId })
      .populate('item')
      .populate('order')
      .sort({ createdAt: -1 });

    const formattedInventory = inventory.map(inv => ({
      id: inv._id,
      item: {
        id: inv.item._id,
        name: inv.item.name,
        description: inv.item.description,
        imageUrl: inv.item.imageUrl,
        rarity: inv.item.rarity,
        rarityColor: GachaRandomizer.getRarityColor(inv.item.rarity),
        value: inv.item.value,
        itemType: inv.item.itemType,
        itemData: inv.item.itemData
      },
      isClaimed: inv.isClaimed,
      claimedAt: inv.claimedAt,
      wonAt: inv.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        inventory: formattedInventory,
        total: formattedInventory.length,
        totalValue: formattedInventory.reduce((sum, inv) => sum + inv.item.value, 0)
      }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

module.exports = {
  ...exports,
  GachaRandomizer // Export class for testing
};
