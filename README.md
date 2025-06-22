# 🛍️ SUPERBAD.STORE Admin Panel

An administrative dashboard for managing the SUPERBAD.STORE e-commerce platform.

## ✨ Features

- Dashboard with sales analytics
- Product management
- User management
- Inventory control
- Category management
- Image uploads

## 🛠️ Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher (or pnpm 7.x or higher)
- Git

## 📦 Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/vulinhnopro2704/e-commerce-admin-panel.git
cd e-commerce-admin-panel

# Using npm
npm install

# OR using pnpm
pnpm install
```

## ⚙️ Configuration

### Backend URL Configuration

Before running the application, you need to update the backend URL in the endpoints file:

1. Open `constants/endpoints.ts`
2. Locate the `BASE_URL` variable at the top of the file
3. Replace the URL with your backend URL:

```typescript
// File path: constants/endpoints.ts
// Update with your actual backend URL
const BASE_URL = 'https://your-backend-url.com'
```

## 🚀 Running Locally

```bash
# Development mode
npm run dev
# OR
pnpm dev

# Build for production
npm run build
# OR
pnpm build

# Start production server
npm start
# OR
pnpm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🔄 Deployment with Vercel CI/CD

This project is already configured for Vercel CI/CD. To deploy:

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Connect your repository to Vercel
3. Vercel will automatically build and deploy your application on every push to the main branch

## 👥 Contributors

- Phạm Hồng Phúc - Creator and maintainer
