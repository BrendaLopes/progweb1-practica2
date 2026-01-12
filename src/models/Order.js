//models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }, // snapshot del precio en compra
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], default: [] },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true } // createdAt, updatedAt
);

export default mongoose.model("Order", orderSchema);
