import Product from "../models/product.js";
import Transaction from "../models/transaction.js";

export default async function analyticsRoute(fastify) {
  // ---------------- GET SELLER ANALYTICS ----------------
  fastify.get("/seller-analytics", async (request, reply) => {
    try {
      const { address } = request.query;

      if (!address) {
        return reply.status(400).send({
          success: false,
          message: "Seller address is required",
        });
      }

      const seller = address.toLowerCase();

      const totalProducts = await Product.countDocuments({ seller });

      const activeProducts = await Product.countDocuments({
        seller,
        active: true,
      });

      const totalSoldOrders = await Transaction.countDocuments({
        seller,
        success: true,
      });

      const pendingOrders = await Transaction.countDocuments({
        seller,
        success: true,
        status: "pending",
      });

      const completedOrders = await Transaction.countDocuments({
        seller,
        success: true,
        status: "completed",
      });

      const disputedOrders = await Transaction.countDocuments({
        seller,
        success: true,
        status: "disputed",
      });

      const refundedOrders = await Transaction.countDocuments({
        seller,
        success: true,
        status: "refunded",
      });

      const revenueStats = await Transaction.aggregate([
        {
          $match: {
            seller,
            success: true,
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            completedRevenue: {
              $sum: { $multiply: ["$price", "$quantity"] },
            },
          },
        },
      ]);

      const completedRevenue = revenueStats[0]?.completedRevenue || 0;

      const recentTransactions = await Transaction.find({
        seller,
        success: true,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("product");

      return reply.send({
        success: true,
        analytics: {
          totalProducts,
          activeProducts,
          totalSoldOrders,
          pendingOrders,
          completedOrders,
          disputedOrders,
          refundedOrders,
          completedRevenue,
        },
        recentTransactions,
      });
    } catch (err) {
      request.log.error(err);

      return reply.status(500).send({
        success: false,
        message: "Failed to fetch seller analytics",
      });
    }
  });
}