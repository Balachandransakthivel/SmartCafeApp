# ☕ Smart Cafe App

A full-stack, AI-enabled Smart Café Ordering System built using **React Native (Expo)**, **Node.js (Express)**, and **MongoDB** with real-time analytics and offline-first capabilities.

---

## 🚀 Features

### 📱 User App (Mobile)

* QR-based café access
* User authentication (JWT secured)
* Live menu from MongoDB
* Add to cart & place orders
* Order tracking with unique MongoDB IDs
* Offline fallback using AsyncStorage

---

### 🛠️ Admin Features

* Secure admin login (role-based access)
* Real-time analytics dashboard
* View:

  * Total Revenue 💰
  * Top Selling Items 🍔
  * Peak Order Hours ⏰
* Manage menu items

---

### 🧠 Smart System

* MongoDB Aggregation Pipelines for analytics
* AI-ready architecture (for recommendations & sentiment analysis)
* Offline-first design with local caching

---

## 🏗️ Tech Stack

### Frontend

* React Native (Expo)
* Axios
* AsyncStorage

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Bcrypt (Password hashing)

---

## 📂 Project Structure

```
smart-cafe/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── data/
│   └── server.js
│
├── mobile-app/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── assets/
```

---

## ⚙️ Setup Instructions

### 🔧 Backend Setup

```bash
cd backend
npm install
npm run server
```

### 🌱 Seed Database

```bash
npm run data:import
```

### 📱 Frontend Setup

```bash
cd mobile-app
npm install
npx expo start
```

---

## 🔐 Demo Credentials

### 👨‍💼 Admin

* Email: [admin@smartcafe.com](mailto:admin@smartcafe.com)
* Password: admin123

### 👤 User

* Email: [demo@smartcafe.com](mailto:demo@smartcafe.com)
* Password: securepassword

---

## 📡 API Base URL

```
http://<YOUR-IP>:5000/api
```

---

## 🧪 Key Functional Flow

1. User logs in → JWT stored
2. Menu fetched from backend
3. User places order → stored in MongoDB
4. Admin views analytics (live aggregation)
5. Offline mode → fallback to AsyncStorage

---

## 🔒 Security Features

* JWT-based authentication
* Role-based authorization (Admin/User)
* Encrypted passwords (bcrypt)
* Protected API routes

---

## 📊 Highlights

* Real-time MongoDB aggregation analytics
* Offline-first mobile architecture
* Full-stack integration (Mobile + Backend + Database)

---

## 🎓 Project Type

Final Year B.E Computer Science Project
Theme: **Smart Automation & AI-Driven Systems**

---

## 👨‍💻 Author

**Balachandran S**
GitHub: https://github.com/Balachandransakthivel

---

## ⭐ Future Enhancements

* Socket.io real-time order tracking
* AI chatbot integration
* Payment gateway (Razorpay/Stripe)
* Admin web dashboard

---

## 📌 License

This project is for academic and learning purposes.
