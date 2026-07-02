live deployment:https://syntaxflowarticles.pages.dev/articles/top-k-frequent-elements

A complete article publishing platform built with **Next.js** (frontend), **Sanity CMS** (primary content source), and **Express.js + SQLite** (legacy fallback API).

## 🚀 Features

- **Article Management**: Create, edit, publish, and delete articles
- **Categories**: Organize articles by technology categories
- **Search**: Full-text search functionality across articles
- **View Tracking**: Track article views
- **Tags**: Tag articles for better organization
- **Responsive Design**: Beautiful UI built with Tailwind CSS
- **Sanity CMS**: Studio-driven content editing with rich text, images, and code blocks
- **API-Driven**: Legacy Express + SQLite fallback remains available

## 📁 Project Structure

```
chakradhar-articles/
├── frontend/          # Next.js React frontend
│   ├── src/
│   │   ├── app/       # Pages and layouts
│   │   ├── components/ # React components
│   │   └── lib/       # API client and utilities
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.local     # Environment variables
│
├── backend/           # Express.js CMS API
│   ├── src/
│   │   ├── index.ts   # Main server file
│   │   ├── database.ts # Database initialization
│   │   ├── articles.ts # Article operations
│   │   ├── categories.ts # Category operations
│   │   ├── routes.articles.ts # Article routes
│   │   └── routes.categories.ts # Category routes
│   ├── data/          # SQLite database
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example   # Environment template
│
├── studio/            # Sanity Studio CMS
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 16+** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe JavaScript
- **SQLite3** - Lightweight database
- **CORS** - Cross-origin resource sharing

### Database
- **SQLite** - File-based database with tables for:
  - Articles
  - Categories
  - Authors

## 📦 Installation & Setup

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
npm install
```

4. Start the backend:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create/verify `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the frontend:
```bash
npm run dev
```

The website will be available at `http://localhost:3000`

### Sanity Studio Setup

1. Navigate to the studio directory:
```bash
cd studio
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```env
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
```

4. Start the studio:
```bash
npm run dev
```

The CMS will be available at `http://localhost:3333`

## 🔌 API Endpoints

### Articles
- `GET /api/articles` - Get all published articles
- `GET /api/articles/:id` - Get article by ID
- `GET /api/articles/slug/:slug` - Get article by slug
- `GET /api/articles/category/:category` - Get articles by category
- `GET /api/articles/search/:query` - Search articles
- `POST /api/articles` - Create new article (admin)
- `PUT /api/articles/:id` - Update article (admin)
- `PATCH /api/articles/:id/publish` - Publish article (admin)
- `DELETE /api/articles/:id` - Delete article (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## 📝 Article Schema

```typescript
{
  id: string;              // UUID
  title: string;           // Article title
  slug: string;            // URL-friendly slug (auto-generated)
  excerpt: string;         // Short description
  content: string | PortableText[]; // Markdown fallback or Sanity rich content
  category: string;        // Category name
  author: string;          // Author name
  coverImage?: string;     // Cover image URL
  tags: string[];          // Array of tags
  published: boolean;      // Publication status
  views: number;           // View count
  createdAt: string;       // ISO date
  updatedAt: string;       // ISO date
}
```

## 🌐 Frontend Pages

- `/` - Homepage with articles grid and categories
- `/articles/[slug]` - Individual article view
- `/search?q=query` - Article search results

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DATABASE_PATH=./data/articles.db
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_STUDIO_URL=http://localhost:3333
```

## 📚 Creating Your First Article

1. Open terminal in backend directory
2. Start the backend: `npm run dev`
3. In another terminal in frontend directory, start frontend: `npm run dev`
4. Use the API client to create an article:

```typescript
POST http://localhost:5000/api/articles
{
  "title": "Getting Started with TypeScript",
  "excerpt": "Learn the basics of TypeScript",
  "content": "<h2>Introduction</h2><p>TypeScript is a typed superset of JavaScript...</p>",
  "category": "TypeScript",
  "author": "John Doe",
  "tags": ["typescript", "javascript", "learning"],
  "coverImage": "https://example.com/image.jpg"
}
```

## 🎨 Customization

### Styling
- Modify Tailwind CSS colors in `frontend/tailwind.config.ts`
- Edit component styles in `.tsx` files

### Database
- Add more fields to article schema in `backend/src/database.ts`
- Update Article interface in `backend/src/articles.ts`

### API
- Add new routes in `backend/src/routes.*.ts`
- Create new models in `backend/src/`

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## 🐛 Troubleshooting

### Port already in use
- Backend: Change `PORT` in `.env`
- Frontend: Next.js will prompt to use different port

### CORS errors
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check frontend `NEXT_PUBLIC_API_URL` environment variable

### Sanity content not loading
- Confirm `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` are set
- Make sure the Sanity Studio has published posts and categories

### Database errors
- Delete `backend/data/articles.db` to reset database
- Ensure `data/` folder exists

## 📄 License

MIT License

## 🤝 Contributing

Feel free to fork, modify, and enhance this project!

---

**Ready to start publishing?** Start the backend and frontend, then create your first article! 🚀
