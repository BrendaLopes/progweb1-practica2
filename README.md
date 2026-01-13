## Arranque
1) npm i
2) crear .env con:
   MONGO_URI=...
   JWT_SECRET=...
   JWT_EXPIRES=2d
3) npm run dev
4) Abrir:
   - http://localhost:4000/ (auth)
   - http://localhost:4000/shop.html (tienda)
   - http://localhost:4000/cart.html (carrito)
   - http://localhost:4000/admin.html (panel admin)
   - http://localhost:4000/graphql (playground)

## GraphQL (schema)
Types: Product, Order, OrderItem, User
Queries:
- products
- product(id)
- orders(status)
- order(id)
Mutations:
- createOrder(input)
- updateOrderStatus(id,status)

## Ejemplos
### Obtener productos
query { products { id name price desc } }

### Crear pedido
mutation {
  createOrder(input:{
    items:[{productId:"ID", quantity:2}]
  }){
    id status total
  }
}

### Listar pedidos pendientes
query { orders(status:PENDING){ id total status user{email} } }

### Cambiar estado (admin)
mutation { updateOrderStatus(id:"ID", status:COMPLETED){ id status } }
