import { Order } from "../../../DB/Models/order.model.js";
export const addOrder = async (req, res, next) => {
  try {
    let order = new Order(req.body);
    await order.save();
    res.status(201).json({ message: "Order created", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getOrder = async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id).populate("user").populate("orderItems.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order retrieved successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getAllOrders = async (req, res, next) => {
  try {
    let orders = await Order.find().populate("user").populate("orderItems.product");
    res.json({ message: "Orders retrieved successfully", orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    let order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    let order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsPaid = async (req, res, next) => {
  try {
    let order = await Order.findByIdAndUpdate(
      req.params.id,
      { ispaid: true },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order marked as paid", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsDelivered = async (req, res, next) => {
  try {
    let order = await Order.findByIdAndUpdate(
      req.params.id,
      { isdeliverd: true, deliverdat: new Date() },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order marked as delivered", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const makeOrder = async (req, res, next) => {
  const { userId } = req.params;
  const {orderId,paymenttype}= req.body;
  if (paymenttype === "cash") {
      const order = await Order.findByIdAndUpdate(
    orderId,
    { user: userId,
      name:req.body.name,
      email:req.body.email,
      address:req.body.address,
     },
    { new: true }
  );
  }
  else if (paymenttype === "visa") {
      const order = await Order.findByIdAndUpdate(
    orderId,
    { user: userId,
      name:req.body.name,
      email:req.body.email,
      phoneNumber:req.body.phoneNumber,
      address:req.body.address,
      cardNumber:req.body.cardNumber,
      cvv:req.body.cvv,
      expiryDate:req.body.expiryDate,
     },
    { new: true }
  );
  }

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.json({ message: "order make successfly", order });
};