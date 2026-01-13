# Energy Market - ProgWeb I

## Descripción del Proyecto

**Energy Market** es una tienda en línea de bebidas energéticas, creada como parte del proyecto de **ProgWeb I**. Este proyecto permite a los usuarios comprar productos energéticos, interactuar en un chat y gestionar su carrito de compras. Además, se incluyen roles de **usuario** y **administrador** con diferentes permisos:

- **Usuario**: Puede registrarse, comprar productos, ver su perfil y gestionar su carrito.
- **Administrador**: Tiene la capacidad de gestionar productos, ver pedidos y gestionar usuarios.

## Tecnologías Usadas

- **Backend**: Node.js, Express, MongoDB, GraphQL (para pedidos y usuarios), REST (para productos).
- **Frontend**: HTML, CSS (estilos), JavaScript (para la funcionalidad).

## Funcionalidades

### **Usuarios**

- Los usuarios pueden **registrarse**, **iniciar sesión** y gestionar su **perfil**.
- Pueden **agregar productos al carrito**, **finalizar compra** y ver el estado de sus **pedidos**.
- **Roles**: Los usuarios pueden ser **regulares** o **administradores**.

### **Administradores**

- Los administradores pueden **gestionar productos**, **crear nuevos productos**, **editar** y **eliminar** productos existentes.
- Pueden **ver todos los pedidos** de los usuarios y gestionar el **estado** de los mismos.
- Los administradores también pueden **gestionar usuarios**: **crear**, **editar** y **eliminar** usuarios.

---

## **Cómo Funciona el CRUD de Usuarios y Pedidos**

Este sistema usa **GraphQL** para manejar usuarios y pedidos. A continuación te mostramos cómo hacer **consultas** y **mutaciones**:

---

### **GraphQL - Consultas y Mutaciones para Usuarios y Pedidos**

#### **Consultas (Queries)**

1. **Obtener todos los usuarios:**

```graphql
query {
  users {
    id
    name
    email
    role
  }
}
```

2. **Obtener un usuario específico por su ID:**

```graphql
query {
  user(id: "ID_DEL_USUARIO") {
    id
    name
    email
    role
  }
}
```
3. **Obtener todos los pedidos:**

```graphql
query {
  orders {
    id
    status
    total
    createdAt
    items {
      quantity
      price
      lineTotal
      product {
        name
      }
    }
  }
}
```

4. **Obtener un pedido específico por su ID:**

```graphql
query {
  order(id: "ID_DEL_PEDIDO") {
    id
    status
    total
    createdAt
    items {
      quantity
      price
      lineTotal
      product {
        name
      }
    }
  }
}
```

#### **Mutaciones (Mutations)**

1. **Crear un nuevo usuario:**

```graphql
mutation {
  createUser(name: "Nuevo Usuario", email: "usuario@ejemplo.com", role: "user") {
    id
    name
    email
    role
  }
}
```
2. **Actualizar un usuario:**

```graphql
mutation {
  updateUser(id: "ID_DEL_USUARIO", name: "Usuario Actualizado", email: "nuevoemail@ejemplo.com", role: "admin") {
    id
    name
    email
    role
  }
}
```

3. **Eliminar un usuario:**

```graphql
mutation {
  deleteUser(id: "ID_DEL_USUARIO") {
    id
  }
}
```
4. **Crear un nuevo pedido:**

```graphql
mutation {
  createOrder(input: {
    items: [
      { productId: "ID_DEL_PRODUCTO", quantity: 1 }
    ]
  }) {
    id
    status
    total
    createdAt
    items {
      product {
        name
      }
      quantity
      price
    }
  }
}
```
5. **Actualizar el estado de un pedido:**

```graphql
mutation {
  updateOrderStatus(id: "ID_DEL_PEDIDO", status: "COMPLETED") {
    id
    status
  }
}
```