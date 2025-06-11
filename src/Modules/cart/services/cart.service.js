 import { cartModel } from "../../../DB/Models/cart.model.js";
 import {Product} from "../../../DB/Models/product.model.js"
import { UserModel } from "../../../DB/Models/user.model.js";
import {Order} from "../../../DB/Models/order.model.js";

export const addProductToCart = async (req, res) => {
  try {
    const {userId}=req.params
    const { productId, quantity = 1 } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: "User ID and Product ID are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Add productId to user's cart array (optional logic)
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { cart: productId }
    });

    const productPrice = product.price;

    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = await cartModel.create({
        user: userId,
        cartItems: [{
          product: productId,
          quantity,
          price: productPrice
        }],
        totalCartPrice: productPrice * quantity,
        productQuintity: quantity
      });

      return res.status(201).json({ message: "Cart created and product added", cart });
    }

    const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity += quantity;
    } else {
      cart.cartItems.push({ product: productId, quantity, price: productPrice });
    }

    // Recalculate totals
    cart.totalCartPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    cart.productQuintity = cart.cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({ message: "Product added to cart", cart });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error", details: err.message });
  }
};

  export const getUserCart = async (req, res) => {
    try {
      const {userId} = req.params;
  
      const cart = await cartModel.findOne({ user: userId }).populate('cartItems.product');
      if (!cart) return res.status(404).json({ message: "Cart is empty" });
  
      res.status(200).json({ cart });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };
  export const removeProductFromCart = async (req, res) => {
    try {
      const userId = req.user._id;
      const { productId } = req.params;
  
      const cart = await cartModel.findOne({ user: userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });
  
      const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);
      if (itemIndex === -1) return res.status(404).json({ message: "Product not in cart" });
  
      cart.cartItems.splice(itemIndex, 1);
  
      cart.totalCartPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      cart.productQuintity = cart.cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
      await cart.save();
      res.status(200).json({ message: "Product removed from cart", cart });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };
  export const clearUserCart = async (req, res) => {
    try {
      const userId = req.user._id;
      const cart = await cartModel.findOne({ user: userId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });
      cart.cartItems = [];
      cart.totalCartPrice = 0;
      cart.productQuintity = 0;
      cart.totalCartPriceAfterdiscount = 0;
      await cart.save();
      res.status(200).json({ message: "Cart cleared successfully", cart });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };

export const getSimilarProductsFromCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Get user and populate cart items
    const user = await UserModel.findById(userId).populate("cart");

    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(404).json({ success: false, message: "No products in cart" });
    }

    const cartProductIds = [];
    const brands = new Set();

    for (const product of user.cart) {
      if (product) {
        cartProductIds.push(product._id);
        brands.add(product.brand);
      }
    }

    if (brands.size === 0) {
      return res.status(200).json({ success: true, similarProducts: [] });
    }

    // Step 3: Find similar products by brand
    const similarProducts = await Product.find({
      brand: { $in: Array.from(brands) },
      _id: { $nin: cartProductIds }
    });

    return res.status(200).json({
      success: true,
      similarProducts
    });

  } catch (error) {
    console.error("Error fetching similar products:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

import { Types } from "mongoose";

export const checkout = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing userId" });
    }

    const cart = await cartModel.findOne({ user: userId }).populate("cartItems.product");

    if (!cart || cart.cartItems.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    const newOrder = await Order.create({
      user: userId,
      orderItems: cart.cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price, 
      })),
      totalorderprice: cart.totalCartPrice,
    });

    const updatedCart = await cartModel.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          cartItems: [],
          totalCartPrice: 0,
          productQuintity: 0,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "✅ Checkout successful, order created, and cart cleared.",
      order: newOrder,
      cart: updatedCart,
    });

  } catch (error) {
    console.error("❌ Error in checkout:", error);
    next(error);
  }
};

export const increaseCartItemQuantity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, increaseBy = 1 } = req.body;

    // Validate IDs
    if (!userId || !productId) {
      return res.status(400).json({ error: "User ID and Product ID are required" });
    }

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid userId or productId" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found for user" });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    cart.cartItems[itemIndex].quantity += increaseBy;

    // Recalculate totals
    cart.totalCartPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    cart.productQuantity = cart.cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    await cart.save();

    return res.status(200).json({
      message: `Increased quantity of product in cart by ${increaseBy}`,
      cart,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error", details: err.message });
  }
};

export const decreaseCartItemQuantity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, decreaseBy = 1 } = req.body;

    // Validate IDs
    if (!userId || !productId) {
      return res.status(400).json({ error: "User ID and Product ID are required" });
    }

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid userId or productId" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found for user" });
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    const currentQty = cart.cartItems[itemIndex].quantity;
    const newQty = currentQty - decreaseBy;

    if (newQty < 1) {
      return res.status(400).json({ error: "Quantity cannot be less than 1" });
    } else {
      cart.cartItems[itemIndex].quantity = newQty;
    }

    // Recalculate totals
    cart.totalCartPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    cart.productQuantity = cart.cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    await cart.save();

    return res.status(200).json({
      message: `Decreased quantity of product in cart by ${decreaseBy}`,
      cart,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error", details: err.message });
  }
};
