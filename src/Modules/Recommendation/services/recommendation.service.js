
import {UserModel} from "../../../DB/Models/user.model.js"
import {Product} from "../../../DB/Models/product.model.js";

import axios from 'axios';

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

export const getCollaborativeRecommendations = async (req, res, next) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  try {
    // Get user and check if cart exists
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartProductIds = user.cart || [];

    if (cartProductIds.length === 0) {
      return res.status(200).json({
        collaborative: [],
        hybrid: [],
        message: "Cart is empty. No recommendations can be generated.",
      });
    }

    // Get product details in the cart
    const cartProducts = await Product.find({ _id: { $in: cartProductIds } });

    if (!cartProducts.length) { 
      return res.status(200).json({
        collaborative: [],
        hybrid: [],
        message: "No valid products found in cart.",
      });
    }

    // Pick a random product from the cart
    const randomProduct =
      cartProducts[Math.floor(Math.random() * cartProducts.length)];
    const randomProductId = randomProduct._id;

    // Recommendation service URLs
    const RECOMMENDATION_BASE_URL = " https://392f-41-35-191-79.ngrok-free.app";
    const collaborativeUrl = `${RECOMMENDATION_BASE_URL}/content?product_id=${randomProductId}`;
    const hybridUrl = `${RECOMMENDATION_BASE_URL}/hybrid?user_id=${user_id}`;

    // Call external services in parallel
    const [collabResult, hybridResult] = await Promise.allSettled([
      axios.get(collaborativeUrl),
      axios.get(hybridUrl),
    ]);

    const collaborativeProductIds =
      collabResult.status === "fulfilled"
        ? (collabResult.value?.data?.recommendations || []).map(
            (p) => p.product_id
          )
        : [];

    const hybridProductIds =
      hybridResult.status === "fulfilled"
        ? (hybridResult.value?.data?.recommendations || []).map(
            (p) => p.product_id
          )
        : [];

    // Fetch actual products from DB and shuffle
    const [collaborativeProducts, hybridProducts] = await Promise.all([
      Product.find({ _id: { $in: collaborativeProductIds } }).select(
        "name brand categories price imageURLs rate"
      ),
      Product.find({ _id: { $in: hybridProductIds } }).select(
        "name brand categories price imageURLs rate"
      ),
    ]);

    return res.status(200).json({
      collaborative: shuffleArray(collaborativeProducts),
      hybrid: shuffleArray(hybridProducts),
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    return res.status(500).json({
      message: "Error fetching recommendations",
      error: error.message,
    });
  }
}


/*
export const getCollaborativeRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Get user and populate cart items
    const user = await UserModel.findById(userId).populate("cart");

    // If user or cart not found or empty, return random products instead
    if (!user || !user.cart || user.cart.length === 0) {
      const randomProducts = await Product.aggregate([
        { $sample: { size: 30 } } // Get 10 random products
      ]);

      return res.status(200).json({
        success: true,
        message: "Cart is empty. Showing random products instead.",
        recommendedProducts: randomProducts
      });
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
*/