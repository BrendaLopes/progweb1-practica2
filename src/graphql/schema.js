import { gql } from "graphql-tag";

export const typeDefs = gql`
  enum OrderStatus {
    PENDING
    COMPLETED
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    desc: String
    createdAt: String
    updatedAt: String
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String
    updatedAt: String
  }

  type OrderItem {
    product: Product!
    quantity: Int!
    price: Float!
    lineTotal: Float!
  }

  type Order {
    id: ID!
    user: User!
    items: [OrderItem!]!
    status: OrderStatus!
    createdAt: String!
    total: Float!
  }

  input CreateOrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input CreateOrderInput {
    items: [CreateOrderItemInput!]!
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product

    orders(status: OrderStatus): [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
  }
`;
