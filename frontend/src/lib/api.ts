const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  // Articles
  articles: {
    getAll: () => fetch(`${API_BASE_URL}/articles`).then(res => res.json()),
    getBySlug: (slug: string) => fetch(`${API_BASE_URL}/articles/slug/${slug}`).then(res => res.json()),
    getById: (id: string) => fetch(`${API_BASE_URL}/articles/${id}`).then(res => res.json()),
    getByCategory: (category: string) => fetch(`${API_BASE_URL}/articles/category/${category}`).then(res => res.json()),
    search: (query: string) => fetch(`${API_BASE_URL}/articles/search/${query}`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    publish: (id: string) => fetch(`${API_BASE_URL}/articles/${id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
    }).then(res => res.json()),
  },
  
  // Categories
  categories: {
    getAll: () => fetch(`${API_BASE_URL}/categories`).then(res => res.json()),
    getBySlug: (slug: string) => fetch(`${API_BASE_URL}/categories/${slug}`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    }).then(res => res.json()),
  },
};
