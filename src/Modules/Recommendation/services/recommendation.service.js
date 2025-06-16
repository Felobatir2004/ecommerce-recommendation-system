
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
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(200).json({
        collaborative: [],
        hybrid: [],
        message: "Cart is empty. No recommendations can be generated.",
      });
    }

    // Fetch product details in the cart
    const userCartProducts = await Product.find({ _id: { $in: user.cart } });

    // Pick a random product from the cart
    const randomProduct =
      userCartProducts[Math.floor(Math.random() * userCartProducts.length)];
    const randomProductId = randomProduct._id;

    // Build recommendation URLs
    const collaborativeUrl = ` https://6763-156-214-225-84.ngrok-free.app/content?product_id=${randomProductId}`;
    const hybridUrl = ` https://6763-156-214-225-84.ngrok-free.app/hybrid?user_id=${user_id}`;

    // Get recommendations
    const [collaborativeRes, hybridRes] = await Promise.allSettled([
      axios.get(collaborativeUrl),
      axios.get(hybridUrl),
    ]);

    // Extract IDs from both responses
    const collaborativeProductIds =
      collaborativeRes.status === "fulfilled"
        ? collaborativeRes.value.data.recommendations.map((p) => p.product_id)
        : [];

    const hybridProductIds =
      hybridRes.status === "fulfilled"
        ? hybridRes.value.data.recommendations.map((p) => p.product_id)
        : [];

    // Fetch product details from DB and shuffle
    const collaborativeProducts = shuffleArray(
      await Product.find({ _id: { $in: collaborativeProductIds } }).select(
        "name brand categories price imageURLs rate"
      )
    );

    const hybridProducts = shuffleArray(
      await Product.find({ _id: { $in: hybridProductIds } }).select(
        "name brand categories price imageURLs rate"
      )
    );

    return res.status(200).json({
      collaborative: collaborativeProducts,
      hybrid: hybridProducts,
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    return res.status(500).json({
      message: "Error fetching recommendations",
      error: error.message,
    });
  }
};