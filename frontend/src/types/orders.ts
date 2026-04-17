
type OrderStatus = "all" | "pending" | "completed" | "refunded" | "disputed";

type Order = {
  _id: string;
  buyer: string;
  seller: string;
  quantity: number;
  price: number;
  status: OrderStatus;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
};