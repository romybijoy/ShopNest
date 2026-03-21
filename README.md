# 🛒 ShopNest — E-Commerce APP (Spring Boot + React)

A full-stack e-commerce application featuring JWT/OAuth2 authentication, role-based access control, AES-encrypted payment data, and a modern React storefront.

---

## ✨ Features

| Feature                | Details                                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| **Authentication**     | JWT Bearer tokens via `/api/auth/login` & `/api/auth/register`              |
| **2 Roles**            | `ADMIN` and `CUSTOMER` with method-level `@PreAuthorize`                    |
| **Category API**       | CRUD — Admin only                                                           |
| **Product API**        | CRUD — Admin only; public listing for storefront                            |
| **Order API**          | Create/view/cancel — Customer; manage all — Admin                           |
| **Mock Payment**       | Card starting with `0000` fails; others succeed (5% random fail)            |
| **Encrypted Payments** | AES-256 via JPA `@Convert` — card data encrypted at rest, decrypted on read |
| **Public APIs**        | `/api/public/**` — no auth, used by storefront                              |
| **Java Streams**       | All calculations (subtotal, tax, shipping, stats) use streams               |
| **React Frontend**     | Cart, Checkout (3-step), Orders, Admin Dashboard                            |

---

## 🚀 Quick Start

### Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
# API: http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

---

## 🔑 Default Credentials

| Role     | Username   | Password      |
| -------- | ---------- | ------------- |
| Admin    | `admin`    | `admin123`    |
| Customer | `customer` | `customer123` |

---

## 🗺️ API Endpoints

### Auth (Public)

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| POST   | `/api/auth/register` | Register a new user       |
| POST   | `/api/auth/login`    | Login → returns JWT token |
| POST   | `/api/auth/refresh`  | Refresh access token      |

### Public Storefront (No Auth)

| Method | Endpoint                             | Description                      |
| ------ | ------------------------------------ | -------------------------------- |
| GET    | `/api/public/products`               | List active products (paginated) |
| GET    | `/api/public/products/{id}`          | Get product by ID                |
| GET    | `/api/public/products/search?q=`     | Search products                  |
| GET    | `/api/public/products/category/{id}` | Products by category             |
| GET    | `/api/public/categories`             | List active categories           |

### Categories (Admin only)

| Method         | Endpoint                      |
| -------------- | ----------------------------- |
| GET/POST       | `/api/categories`             |
| GET/PUT/DELETE | `/api/categories/{id}`        |
| PATCH          | `/api/categories/{id}/toggle` |

### Products (Admin only)

| Method         | Endpoint                   |
| -------------- | -------------------------- |
| GET/POST       | `/api/products`            |
| GET/PUT/DELETE | `/api/products/{id}`       |
| PATCH          | `/api/products/{id}/stock` |
| GET            | `/api/products/stats`      |

### Orders (Authenticated)

| Method | Endpoint                  | Access             |
| ------ | ------------------------- | ------------------ |
| POST   | `/api/orders`             | Customer + Admin   |
| GET    | `/api/orders/my`          | Own orders         |
| GET    | `/api/orders`             | Admin — all orders |
| PATCH  | `/api/orders/{id}/status` | Admin              |
| PATCH  | `/api/orders/{id}/cancel` | Customer           |
| GET    | `/api/orders/stats`       | Admin              |

### Payments (Authenticated)

| Method | Endpoint                        | Access               |
| ------ | ------------------------------- | -------------------- |
| POST   | `/api/payments/process`         | Customer + Admin     |
| GET    | `/api/payments`                 | Admin — all payments |
| GET    | `/api/payments/{id}`            | Admin                |
| GET    | `/api/payments/order/{orderId}` | Authenticated        |
| GET    | `/api/payments/stats`           | Admin                |

---

## 🔐 Security Architecture

```
Request → JwtAuthenticationFilter → SecurityContextHolder
                                           ↓
                                    @PreAuthorize checks
                                    hasRole('ADMIN') / isAuthenticated()
```

**Token usage:**

```bash
# 1. Get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Use token
curl http://localhost:8080/api/categories \
  -H "Authorization: Bearer <your_token>"
```

---

## 🔒 Payment Encryption

Card data is encrypted using AES-128 before writing to the database and automatically decrypted on read via a JPA `AttributeConverter`:

```java
@Convert(converter = EncryptionConverter.class)
private String cardNumber;  // "4111111111111111" → stored as base64-encoded ciphertext
```

The API response always returns only the **masked** card number: `**** **** **** 1111`.

---

## 📊 Java Streams Usage

- **Order subtotal**: `items.stream().map(i -> price * qty).reduce(ZERO, BigDecimal::add)`
- **Tax & shipping**: calculated from subtotal using stream pipeline
- **Order stats**: `groupingBy(status)`, `summingInt(quantity)`, `reducing` for revenue
- **Product stats**: `groupingBy(category)`, average price, inventory value
- **Payment stats**: revenue by method, failure rate

---

## 🏗️ Tech Stack

| Layer       | Technology                                        |
| ----------- | ------------------------------------------------- |
| Backend     | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Auth        | JWT (jjwt 0.11.5), BCrypt password hashing        |
| Database    | H2 (in-memory, swap for MySQL/Postgres in prod)   |
| Encryption  | AES-128 via JPA `AttributeConverter`              |
| Frontend    | React 18, Vite, React Router 6                    |
| HTTP Client | Axios with JWT interceptor                        |
| UI          | Custom CSS design system (dark theme)             |
