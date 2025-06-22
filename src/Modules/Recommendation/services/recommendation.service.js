import axios from 'axios';
import mongoose from 'mongoose';
import { UserModel } from '../../../DB/Models/user.model.js';
import { Product } from '../../../DB/Models/product.model.js';
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

export const getCollaborativeRecommendations = async (req, res, next) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).json({ message: "Invalid user_id format" });
  }

  try {
    // Get user and populate cart products
    const user = await UserModel.findById(user_id).populate({
      path: 'cart',
      select: 'name brand categories price imageURLs rate'
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartProducts = user.cart || [];

    if (cartProducts.length === 0) {
      return res.status(200).json({
        collaborative: [],
        hybrid: [],
        message: "Cart is empty. No recommendations can be generated.",
      });
    }

    // Pick a random product from the cart
    const randomProduct = cartProducts[Math.floor(Math.random() * cartProducts.length)];
    const randomProductId = randomProduct._id;

    // Recommendation service URLs
    const RECOMMENDATION_BASE_URL = process.env.RECOMMENDATION_BASE_URL || 'https://default-recommendation-service.com';
    const collaborativeUrl = `${RECOMMENDATION_BASE_URL}/content?product_id=${randomProductId}`;
    const hybridUrl = `${RECOMMENDATION_BASE_URL}/hybrid?user_id=${user_id}`;

    // Call external services in parallel
    const [collabResult, hybridResult] = await Promise.allSettled([
      axios.get(collaborativeUrl, { timeout: 5000 }),
      axios.get(hybridUrl, { timeout: 5000 }),
    ]);

    if (collabResult.status === "rejected") {
      console.warn("Collaborative recommendation failed:", collabResult.reason);
    }
    if (hybridResult.status === "rejected") {
      console.warn("Hybrid recommendation failed:", hybridResult.reason);
    }

    const collaborativeProductIds =
      collabResult.status === "fulfilled"
        ? (collabResult.value?.data?.recommendations || []).map((p) => p.product_id)
        : [];

    const hybridProductIds =
      hybridResult.status === "fulfilled"
        ? (hybridResult.value?.data?.recommendations || []).map((p) => p.product_id)
        : [];

    // Fetch actual products from DB
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
};