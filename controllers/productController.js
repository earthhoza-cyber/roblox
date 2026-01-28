// ==========================================
// PRODUCT CONTROLLER - Direct Sales
// ==========================================

const { Product, User, Order, Transaction } = require('../database/schemas');

// ==========================================
// GET ALL PRODUCTS
// ==========================================
exports.getAllProducts = async (req, res) => {
  try {
    const { category, status, sort = '-createdAt', limit = 20, page = 1 } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (status) query.stockStatus = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products: products.map(p => ({
          id: p._id,
          title: p.title,
          description: p.description,
          price: p.price,
          imageUrl: p.imageUrl,
          category: p.category,
          stockStatus: p.stockStatus,
          isFeatured: p.isFeatured,
          views: p.views,
          robloxDetails: p.robloxDetails
        })),
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// ==========================================
// GET SINGLE PRODUCT
// ==========================================
exports.getProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        product: {
          id: product._id,
          title: product.title,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          stockStatus: product.stockStatus,
          isFeatured: product.isFeatured,
          views: product.views,
          robloxDetails: product.robloxDetails,
          createdAt: product.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// ==========================================
// PURCHASE PRODUCT
// ==========================================
exports.purchaseProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock status
    if (product.stockStatus !== 'in_stock') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available for purchase'
      });
    }

    // Find user
    const user = await User.findById(userId);

    // Check user balance
    if (user.pointBalance < product.price) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points',
        required: product.price,
        current: user.pointBalance
      });
    }

    // Start transaction
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Deduct points
      const balanceBefore = user.pointBalance;
      user.pointBalance -= product.price;
      await user.save({ session });

      // Update product status
      product.stockStatus = 'sold_out';
      product.soldTo = userId;
      product.soldAt = new Date();
      await product.save({ session });

      // Create transaction record
      await Transaction.create([{
        user: userId,
        type: 'purchase',
        amount: -product.price,
        balanceBefore: balanceBefore,
        balanceAfter: user.pointBalance,
        description: `Purchased ${product.title}`,
        status: 'completed'
      }], { session });

      // Create order with delivery data
      const order = await Order.create([{
        user: userId,
        orderType: 'direct_purchase',
        product: product._id,
        totalPrice: product.price,
        status: 'completed',
        deliveryData: {
          robloxUsername: product.robloxDetails?.username,
          accountId: product.robloxDetails?.accountId,
          // In production, encrypt sensitive data
          credentials: {
            note: 'Credentials will be sent to your email'
          }
        }
      }], { session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: 'Purchase successful!',
        data: {
          order: {
            id: order[0]._id,
            product: {
              id: product._id,
              title: product.title,
              imageUrl: product.imageUrl
            },
            totalPrice: product.price,
            deliveryData: order[0].deliveryData,
            createdAt: order[0].createdAt
          },
          userBalance: user.pointBalance
        }
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete purchase',
      error: error.message
    });
  }
};

// ==========================================
// GET USER ORDERS
// ==========================================
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    const query = { user: userId };
    if (type) query.orderType = type;

    const orders = await Order.find(query)
      .populate('product')
      .populate('mysteryBox')
      .populate('wonItem')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => {
      const baseOrder = {
        id: order._id,
        orderType: order.orderType,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt
      };

      if (order.orderType === 'direct_purchase' && order.product) {
        return {
          ...baseOrder,
          product: {
            id: order.product._id,
            title: order.product.title,
            imageUrl: order.product.imageUrl,
            category: order.product.category
          },
          deliveryData: order.deliveryData
        };
      } else if (order.orderType === 'mystery_box' && order.wonItem) {
        return {
          ...baseOrder,
          mysteryBox: order.mysteryBox ? {
            id: order.mysteryBox._id,
            name: order.mysteryBox.name
          } : null,
          wonItem: {
            id: order.wonItem._id,
            name: order.wonItem.name,
            imageUrl: order.wonItem.imageUrl,
            rarity: order.wonItem.rarity,
            value: order.wonItem.value
          }
        };
      }

      return baseOrder;
    });

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        total: formattedOrders.length
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

module.exports = exports;
