# 💻 DevTinder

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
</div>

<div align="center">
  <h3>🔥 The Tinder for Developers 🔥</h3>
  <p><em>Connect, collaborate, and build amazing projects together!</em></p>
</div>

---

## 🌟 About DevTinder

DevTinder is a revolutionary platform designed specifically for developers to find like-minded coding partners, collaborators, and project teammates. Just like Tinder, but for the tech community! Swipe right on developers who match your coding style, interests, and project goals.

### ✨ Key Features

- 🔐 **Secure Authentication** - JWT-based authentication with password hashing
- 👤 **Rich User Profiles** - Showcase your skills, projects, and interests  
- 🤝 **Smart Matching** - Connect with developers based on compatibility
- 📱 **Connection Requests** - Send and manage collaboration requests
- 🛡️ **Data Validation** - Robust input validation and security measures
- 🌐 **CORS Support** - Ready for frontend integration

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/coder-writes/devtinder.git
   cd devtinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file and add:
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start the production server**
   ```bash
   npm start
   ```

---

## 📁 Project Structure

```
devtinder/
├── src/
│   ├── app.js              # Main application entry point
│   ├── config/
│   │   └── database.js     # Database configuration
│   ├── middlewares/
│   │   └── auth.js         # Authentication middleware
│   ├── models/
│   │   ├── user.js         # User schema and model
│   │   └── connectionRequest.js # Connection request model
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── profile.js      # Profile management routes
│   │   ├── requests.js     # Connection request routes
│   │   └── user.js         # User-related routes
│   └── utils/
│       └── validation.js   # Input validation utilities
├── test/                   # Test files
├── package.json
└── README.md
```

---

## 🛠️ API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout

### Profile Management
- `GET /profile/view` - View user profile
- `PATCH /profile/edit` - Update user profile

### Connection Requests
- `POST /request/send/:status/:userId` - Send connection request
- `POST /request/review/:status/:requestId` - Accept/reject requests
- `GET /user/requests/received` - Get received requests
- `GET /user/connections` - Get user connections
- `GET /user/feed` - Get user feed

---

## 🧪 Testing

Run the test suite using Mocha:

```bash
npm test
```

---

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **Validator** | Input validation |
| **CORS** | Cross-origin requests |
| **Mocha** | Testing framework |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@coder-writes](https://github.com/coder-writes)
- LinkedIn: [rishi-verma-sde](https://linkedin.com/in/rishi-verma-sde)

---

## 🙏 Acknowledgments

- Thanks to the open-source community for the amazing tools and libraries
- Special thanks to all contributors who help make DevTinder better
- Inspired by the need to connect developers worldwide

---

<div align="center">
  <h3>⭐ Star this repo if you find it helpful!</h3>
  <p>Made with ❤️ for the developer community</p>
</div>
