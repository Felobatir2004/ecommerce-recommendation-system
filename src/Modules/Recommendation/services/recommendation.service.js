
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

    // في حالة الكارت فاضي، رجّع منتجات عشوائية
    if (cartProductIds.length === 0) {
      const randomProducts = await Product.aggregate([
        { $sample: { size: 10 } }, // اختار 10 منتجات عشوائيًا
        {
          $project: {
            name: 1,
            brand: 1,
            categories: 1,
            price: 1,
            imageURLs: 1,
            rate: 1,
          },
        },
      ]);

      return res.status(200).json({
        collaborative: [],
        hybrid: [],
        random: randomProducts,
        message: "No cart found. Showing random products instead.",
      });
    }

    // Get product details in the cart
    const cartProducts = await Product.find({ _id: { $in: cartProductIds } });

    if (!cartProducts.length) {
      const randomProducts = await Product.aggregate([
        { $sample: { size: 10 } },
        {
          $project: {
            name: 1,
            brand: 1,
            categories: 1,
            price: 1,
            imageURLs: 1,
            rate: 1,
          },
        },
      ]);

      return res.status(200).json({
        collaborative: [],
        hybrid: [],
        random: randomProducts,
        message: "No valid products in cart. Showing random instead.",
      });
    }

    // Pick a random product from the cart
    const randomProduct =
      cartProducts[Math.floor(Math.random() * cartProducts.length)];
    const randomProductId = randomProduct._id;

    // Recommendation service URLs
    const BASE_URL = "https://6e47-156-214-225-84.ngrok-free.app";
    const collaborativeUrl = `${BASE_URL}/content?product_id=${randomProductId}`;
    const hybridUrl = `${BASE_URL}/hybrid?user_id=${user_id}`;

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
};
