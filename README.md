# 🔍 FoundIt! – Community Lost & Found Platform

## 🧭 FoundIt! – Reuniting People With What They’ve Lost

**FoundIt!** is a centralized, community-driven Lost & Found web platform designed to help individuals recover misplaced belongings quickly and securely.
Instead of scattered notices and endless scrolling, FoundIt! brings everything into one structured system powered by smart matching and location awareness.

Users can report lost or found items, receive intelligent match suggestions, securely communicate, and verify ownership — all while maintaining privacy.

---

## 🌟 Key Features

### 📋 Post & Report
- **Report Lost or Found Items**: Easily post items with details like category, location (City/Area), and images.
- **Image Upload**: Integrated **Cloudinary** support for uploading clear images of items.

### 🔍 Search & Discovery
- **Smart Filtering**: Browse items by Category (Mobile, Wallet, Keys, etc.) or Location.
- **Recent Feeds**: See the latest lost/found items on the home dashboard.

### 🔐 Secure Claim System
- **Verification Questions**: 'Found' items can have hidden details. Claimants must answer a specific question (e.g., "What covers case is on the phone?") to prove ownership.
- **Claim Workflow**:
  1. User submits a claim with an answer.
  2. Finder receives the request.
  3. Finder accepts or rejects the claim based on the answer.
- **Privacy First**: Contact details (Phone/Email) can be kept private until a claim is approved.

---

## 🔧 Tech Stack

### 🖥 Frontend
- **Next.js 16** – React framework with App Router & Server Actions.
- **TypeScript** – Type safety and maintainability.
- **Tailwind CSS** – Utility-first, responsive UI.

### ⚙ Backend descriptions
- **Next.js API Routes** – Serverless backend functions.
- **MongoDB** – specific, document-oriented database for flexible item schemas.
- **Mongoose** – ODM for type-safe database interactions.

### ☁ Storage & Services
- **Cloudinary** – Optimized image storage and delivery.
- **JWT & Bcrypt** – Secure authentication and password hashing.

---

## 📦 Installation

1️⃣ **Clone the Repository**
```bash
git clone https://github.com/yourusername/foundit.git
cd foundit
```

2️⃣ **Install Dependencies**
```bash
npm install
```

3️⃣ **Set Up Environment Variables**
Create a `.env.local` file in the root directory and add:
```bash
# Database Connection
MONGO_URI="mongodb+srv://your_mongo_connection_string"

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Authentication
JWT_SECRET="your_super_secret_jwt_key"
NEXTAUTH_URL="http://localhost:3000"
```

4️⃣ **Start Development Server**
```bash
npm run dev
```

5️⃣ **Open in Browser**
Visit 👉 [http://localhost:3000](http://localhost:3000)

---

## 🎯 Use Case

This application is ideal for environments where items are frequently misplaced and quick recovery is essential:

- 🎓 **Colleges & Universities**
- 🏫 **Hostels & Campus Residences**
- 🧑‍💻 **Hackathons & Events**
- 🔎 **Community Centers**

FoundIt! reduces confusion, saves time, and provides a secure and organized workflow to reunite lost items with their owners.

---

## 🎉 Conclusion

FoundIt! transforms a common real-world problem into a structured, secure, and scalable solution.
With smart matching, privacy-first communication, and ownership verification, it builds trust within communities while making item recovery fast and effortless.
