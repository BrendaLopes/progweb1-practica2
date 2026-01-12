import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

function requireAuth(ctx) {
  if (!ctx.user) throw new Error("Not authenticated");
}
function requireAdmin(ctx) {
  requireAuth(ctx);
  if (ctx.user.role !== "admin") throw new Error("Forbidden");
}

const toGqlStatus = (dbStatus) => (dbStatus === "completed" ? "COMPLETED" : "PENDING");
const toDbStatus = (gqlStatus) => (gqlStatus === "COMPLETED" ? "completed" : "pending");

export const resolvers = {
  Query: {
    products: async () => {
      const items = await Product.find().sort({ createdAt: -1 });
      return items.map((p) => ({ ...p.toObject(), id: p._id.toString() }));
    },
    product: async (_parent, { id }) => {
      const p = await Product.findById(id);
      if (!p) return null;
      return { ...p.toObject(), id: p._id.toString() };
    },

    orders: async (_parent, { status }, ctx) => {
      requireAuth(ctx);

      const filter = {};
      if (status) filter.status = toDbStatus(status);

      // admin ve todos, user solo los suyos
      if (ctx.user.role !== "admin") filter.user = ctx.user.id;

      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("items.product");

      return orders.map((o) => ({
        ...o.toObject(),
        id: o._id.toString(),
        status: toGqlStatus(o.status),
      }));
    },

    order: async (_parent, { id }, ctx) => {
      requireAuth(ctx);

      const o = await Order.findById(id).populate("user").populate("items.product");
      if (!o) return null;

      if (ctx.user.role !== "admin" && String(o.user._id) !== ctx.user.id) {
        throw new Error("Forbidden");
      }

      return { ...o.toObject(), id: o._id.toString(), status: toGqlStatus(o.status) };
    },
  },

  Mutation: {
    createOrder: async (_parent, { input }, ctx) => {
      requireAuth(ctx);

      if (!input?.items?.length) throw new Error("Cart empty");

      // Construimos snapshot de items: price actual del Product
      const productIds = input.items.map((i) => i.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      const map = new Map(products.map((p) => [String(p._id), p]));

      const items = input.items.map((i) => {
        const p = map.get(String(i.productId));
        if (!p) throw new Error(`Product not found: ${i.productId}`);
        const qty = Number(i.quantity);
        if (!Number.isInteger(qty) || qty < 1) throw new Error("Invalid quantity");
        return { product: p._id, quantity: qty, price: p.price };
      });

      const total = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

      const order = await Order.create({
        user: ctx.user.id,
        items,
        status: "pending",
        total,
      });

      // guardar referencia en user (historial)
      await User.findByIdAndUpdate(ctx.user.id, { $push: { orders: order._id } });

      // notificación por socket a admins (opcional)
      if (ctx.io) {
        ctx.io.emit("order:new", {
          orderId: String(order._id),
          userId: ctx.user.id,
          total,
          at: new Date().toISOString(),
        });
      }

      const populated = await Order.findById(order._id).populate("user").populate("items.product");

      return {
        ...populated.toObject(),
        id: populated._id.toString(),
        status: toGqlStatus(populated.status),
      };
    },

    updateOrderStatus: async (_parent, { id, status }, ctx) => {
      requireAdmin(ctx);

      const dbStatus = toDbStatus(status);
      const o = await Order.findByIdAndUpdate(
        id,
        { status: dbStatus },
        { new: true, runValidators: true }
      ).populate("user").populate("items.product");

      if (!o) throw new Error("Order not found");

      if (ctx.io) {
        ctx.io.emit("order:status", {
          orderId: String(o._id),
          status,
          at: new Date().toISOString(),
        });
      }

      return { ...o.toObject(), id: o._id.toString(), status: toGqlStatus(o.status) };
    },
  },

  OrderItem: {
    lineTotal: (parent) => parent.price * parent.quantity,
  },

  Product: {
    id: (p) => p.id || String(p._id),
  },
  User: {
    id: (u) => u.id || String(u._id),
  },
  Order: {
    id: (o) => o.id || String(o._id),
  },
};
