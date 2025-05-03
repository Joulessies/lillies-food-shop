import axios from 'axios';

// Use a hardcoded API URL to avoid environment variable issues
const API_URL = 'http://localhost:8000/api';

// Flag to control mock data usage - Set to true to use mock data instead of API calls
const USE_MOCK_DATA = true; // Set to false when your backend is ready

// Create axios instance with authentication headers
const apiClient = axios.create({
  baseURL: API_URL
});

// Add authorization header to requests
apiClient.interceptors.request.use(
  config => {
    // Only try to add auth header if we're not using mock data
    if (!USE_MOCK_DATA) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor to handle errors consistently
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (USE_MOCK_DATA) {
      // If using mock data, don't show network errors
      console.warn('API Error intercepted in mock mode:', error.message);
      return Promise.reject(new Error('API error in mock mode'));
    }
    return Promise.reject(error);
  }
);

// Mock data
const mockData = {
  categories: [
    { id: 1, name: 'Burgers', description: 'Delicious hamburgers and cheeseburgers', active: true },
    { id: 2, name: 'Sides', description: 'French fries, onion rings and more', active: true },
    { id: 3, name: 'Beverages', description: 'Soft drinks, shakes, and coffee', active: true },
    { id: 4, name: 'Desserts', description: 'Sweet treats to finish your meal', active: false }
  ],
  products: [
    { 
      id: 101, 
      name: "Classic Burger", 
      description: "Beef patty, lettuce, tomato, onion, and special sauce on a potato bun",
      price: 120.00,
      category_id: 1,
      active: true,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500&q=80"
    },
    { 
      id: 102, 
      name: "Fancy Burger", 
      description: "Beef patty, cheddar cheese, lettuce, tomato, onion, and special sauce",
      price: 130.00,
      category_id: 1,
      active: true,
      image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500&q=80"
    },
    { 
      id: 201, 
      name: "Golden Fries", 
      description: "Crispy golden french fries with our signature seasoning",
      price: 100.00,
      category_id: 2,
      active: true,
      image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500&q=80"
    },
    { 
      id: 301, 
      name: "Lemonade", 
      description: "Freshly homemade lemonade",
      price: 70.00,
      category_id: 3,
      active: true,
      image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500&q=80"
    }
  ],
  orders: [
    {
      id: 1,
      customer_name: "John Doe",
      customer_email: "john@example.com",
      contact_number: "123-456-7890",
      shipping_address: "123 Main St, City",
      order_date: "2023-10-15T14:30:00Z",
      status: "completed",
      total_amount: 320.00,
      items: [
        { id: 1, product_id: 101, product_name: "Classic Burger", quantity: 2, price: 120.00 },
        { id: 2, product_id: 201, product_name: "Golden Fries", quantity: 1, price: 100.00 }
      ]
    },
    {
      id: 2,
      customer_name: "Jane Smith",
      customer_email: "jane@example.com",
      contact_number: "098-765-4321",
      shipping_address: "456 Elm St, Town",
      order_date: "2023-10-16T10:15:00Z",
      status: "pending",
      total_amount: 200.00,
      items: [
        { id: 3, product_id: 102, product_name: "Fancy Burger", quantity: 1, price: 130.00 },
        { id: 4, product_id: 301, product_name: "Lemonade", quantity: 1, price: 70.00 }
      ]
    }
  ],
  dashboard: {
    stats: {
      totalProducts: 12,
      totalCategories: 4,
      totalOrders: 245,
      total_revenue: 28750.00,
      pending_orders: 12,
      completed_orders: 233,
      recentOrders: [
        {
          id: 245,
          customer_name: "Mike Johnson",
          total_amount: 290.00,
          status: "pending",
          order_date: "2023-10-17T09:45:00Z"
        },
        {
          id: 244,
          customer_name: "Sarah Williams",
          total_amount: 180.00,
          status: "completed",
          order_date: "2023-10-17T08:30:00Z"
        },
        {
          id: 243,
          customer_name: "David Brown",
          total_amount: 220.00,
          status: "shipped",
          order_date: "2023-10-16T15:20:00Z"
        }
      ],
      lowStockProducts: [
        { id: 103, name: "Veggie Burger", stock: 3 },
        { id: 202, name: "Onion Rings", stock: 5 },
        { id: 302, name: "Iced Tea", stock: 4 }
      ],
      categorySales: [
        { product__category__name: "Burgers", total: 12500 },
        { product__category__name: "Sides", total: 8750 },
        { product__category__name: "Beverages", total: 5200 },
        { product__category__name: "Desserts", total: 2300 }
      ]
    }
  },
  users: {
    profile: {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      phone: "555-123-4567",
      address: "123 Main St, City"
    }
  }
};

// Helper function to simulate API delay
const mockApiCall = (data, delay = 300) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

// Dashboard
export const fetchDashboardStats = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.dashboard.stats);
  }
  
  try {
    const response = await apiClient.get('/dashboard/stats/');
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Categories
export const fetchCategories = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.categories);
  }
  
  try {
    const response = await apiClient.get('/categories/');
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const fetchCategory = async (id) => {
  if (USE_MOCK_DATA) {
    const category = mockData.categories.find(c => c.id === parseInt(id));
    if (!category) throw new Error('Category not found');
    return await mockApiCall(category);
  }
  
  try {
    const response = await apiClient.get(`/categories/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  if (USE_MOCK_DATA) {
    const newCategory = {
      ...categoryData,
      id: Math.max(...mockData.categories.map(c => c.id)) + 1,
      active: true
    };
    mockData.categories.push(newCategory);
    return await mockApiCall(newCategory);
  }
  
  try {
    const response = await apiClient.post('/categories/', categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  if (USE_MOCK_DATA) {
    const index = mockData.categories.findIndex(c => c.id === parseInt(id));
    if (index === -1) throw new Error('Category not found');
    
    const updatedCategory = {
      ...mockData.categories[index],
      ...categoryData,
      id: parseInt(id)
    };
    mockData.categories[index] = updatedCategory;
    return await mockApiCall(updatedCategory);
  }
  
  try {
    const response = await apiClient.put(`/categories/${id}/`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  if (USE_MOCK_DATA) {
    const index = mockData.categories.findIndex(c => c.id === parseInt(id));
    if (index === -1) throw new Error('Category not found');
    
    mockData.categories.splice(index, 1);
    return await mockApiCall(true);
  }
  
  try {
    await apiClient.delete(`/categories/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
};

// Products
export const fetchProducts = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.products.map(product => {
      const category = mockData.categories.find(c => c.id === product.category_id);
      return {
        ...product,
        category: category ? { id: category.id, name: category.name } : null
      };
    }));
  }
  
  try {
    const response = await apiClient.get('/products/');
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchProduct = async (id) => {
  if (USE_MOCK_DATA) {
    const product = mockData.products.find(p => p.id === parseInt(id));
    if (!product) throw new Error('Product not found');
    
    const category = mockData.categories.find(c => c.id === product.category_id);
    return await mockApiCall({
      ...product,
      category: category ? { id: category.id, name: category.name } : null
    });
  }
  
  try {
    const response = await apiClient.get(`/products/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  if (USE_MOCK_DATA) {
    const newProduct = {
      ...productData,
      id: Math.max(...mockData.products.map(p => p.id)) + 1,
      active: true,
      category_id: parseInt(productData.category_id)
    };
    mockData.products.push(newProduct);
    return await mockApiCall(newProduct);
  }
  
  try {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });
    
    const response = await apiClient.post('/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  if (USE_MOCK_DATA) {
    const index = mockData.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) throw new Error('Product not found');
    
    const updatedProduct = {
      ...mockData.products[index],
      ...productData,
      id: parseInt(id),
      category_id: parseInt(productData.category_id || mockData.products[index].category_id)
    };
    mockData.products[index] = updatedProduct;
    return await mockApiCall(updatedProduct);
  }
  
  try {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      // Only append if value is not null
      if (productData[key] !== null) {
        formData.append(key, productData[key]);
      }
    });
    
    const response = await apiClient.put(`/products/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  if (USE_MOCK_DATA) {
    const index = mockData.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) throw new Error('Product not found');
    
    // Store product name for logging
    const productName = mockData.products[index].name;
    
    // Remove the product
    mockData.products.splice(index, 1);
    
    console.log(`Product ${id} (${productName}) deleted successfully`);
    return await mockApiCall(true);
  }
  
  try {
    await apiClient.delete(`/products/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

// Orders
export const fetchOrders = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.orders);
  }
  
  try {
    const response = await apiClient.get('/orders/');
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const fetchOrder = async (id) => {
  if (USE_MOCK_DATA) {
    const order = mockData.orders.find(o => o.id === parseInt(id));
    if (!order) throw new Error('Order not found');
    return await mockApiCall(order);
  }
  
  try {
    const response = await apiClient.get(`/orders/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  if (USE_MOCK_DATA) {
    const index = mockData.orders.findIndex(o => o.id === parseInt(id));
    if (index === -1) throw new Error('Order not found');
    
    mockData.orders[index].status = status;
    return await mockApiCall(mockData.orders[index]);
  }
  
  try {
    const response = await apiClient.patch(`/orders/${id}/`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating order status ${id}:`, error);
    throw error;
  }
};

// Authentication
export const login = async (email, password) => {
  if (USE_MOCK_DATA) {
    // Simple mock validation
    if (email === 'admin@example.com' && password === 'password') {
      return await mockApiCall({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        is_staff: true,
        token: 'mock-jwt-token'
      });
    }
    
    throw new Error('Invalid credentials');
  }
  
  try {
    const response = await apiClient.post('/user/login/', { email, password });
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const register = async (userData) => {
  if (USE_MOCK_DATA) {
    // Just return success for mock
    return await mockApiCall({ success: true });
  }
  
  try {
    const response = await apiClient.post('/user/register/', userData);
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

// Menu API endpoints
export const fetchMenuCategories = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.categories.filter(c => c.active));
  }
  
  try {
    const response = await apiClient.get('/menu/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    throw error;
  }
};

export const fetchMenuItems = async (categoryId) => {
  if (USE_MOCK_DATA) {
    let products = mockData.products.filter(p => p.active);
    
    if (categoryId) {
      products = products.filter(p => p.category_id === parseInt(categoryId));
    }
    
    return await mockApiCall(products);
  }
  
  try {
    const url = categoryId ? `/menu/items/?category=${categoryId}` : '/menu/items/';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};

// User profile
export const fetchUserProfile = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.users.profile);
  }
  
  try {
    const response = await apiClient.get('/user/profile/');
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  if (USE_MOCK_DATA) {
    mockData.users.profile = {
      ...mockData.users.profile,
      ...profileData
    };
    return await mockApiCall(mockData.users.profile);
  }
  
  try {
    const response = await apiClient.put('/user/profile/', profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Cart and checkout
export const createOrder = async (orderData) => {
  if (USE_MOCK_DATA) {
    const newOrder = {
      id: Math.max(...mockData.orders.map(o => o.id)) + 1,
      ...orderData,
      status: 'pending',
      order_date: new Date().toISOString()
    };
    mockData.orders.push(newOrder);
    return await mockApiCall(newOrder);
  }
  
  try {
    const response = await apiClient.post('/orders/', orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Polling Configuration
const pollingConfig = {
  dashboard: {
    enabled: true,
    interval: 10000, // 10 seconds
    listeners: []
  },
  products: {
    enabled: true,
    interval: 15000, // 15 seconds
    listeners: []
  },
  categories: {
    enabled: true,
    interval: 30000, // 30 seconds
    listeners: []
  },
  orders: {
    enabled: true,
    interval: 8000, // 8 seconds
    listeners: []
  }
};

// Start polling for a resource
export const startPolling = (resource, callback) => {
  if (!pollingConfig[resource]) {
    console.error(`No polling configuration for resource: ${resource}`);
    return () => {};
  }
  
  // Add listener
  const listenerId = Date.now() + Math.random();
  pollingConfig[resource].listeners.push({
    id: listenerId,
    callback
  });
  
  // Start polling if not already started and enabled
  if (pollingConfig[resource].enabled && !pollingConfig[resource].intervalId) {
    const fetchFunction = getFetchFunctionForResource(resource);
    
    // Immediate first fetch
    fetchFunction().then(data => {
      pollingConfig[resource].lastData = data;
      notifyListeners(resource, data);
    });
    
    // Set up interval
    pollingConfig[resource].intervalId = setInterval(() => {
      fetchFunction().then(data => {
        // Check if data has changed
        const hasChanged = JSON.stringify(data) !== JSON.stringify(pollingConfig[resource].lastData);
        pollingConfig[resource].lastData = data;
        
        if (hasChanged) {
          notifyListeners(resource, data);
        }
      });
    }, pollingConfig[resource].interval);
  }
  
  // Return unsubscribe function
  return () => {
    pollingConfig[resource].listeners = pollingConfig[resource].listeners.filter(
      listener => listener.id !== listenerId
    );
    
    // Stop polling if no more listeners
    if (pollingConfig[resource].listeners.length === 0 && pollingConfig[resource].intervalId) {
      clearInterval(pollingConfig[resource].intervalId);
      pollingConfig[resource].intervalId = null;
    }
  };
};

// Helper to notify all listeners for a resource
const notifyListeners = (resource, data) => {
  pollingConfig[resource].listeners.forEach(listener => {
    listener.callback(data);
  });
};

// Get the appropriate fetch function for a resource
const getFetchFunctionForResource = (resource) => {
  switch (resource) {
    case 'dashboard':
      return fetchDashboardStats;
    case 'products':
      return fetchProducts;
    case 'categories':
      return fetchCategories;
    case 'orders':
      return fetchOrders;
    default:
      return () => Promise.resolve([]);
  }
};

// For simulating real-time updates in mock data mode
export const simulateDataChanges = () => {
  if (!USE_MOCK_DATA) return;
  
  // Set up random updates to mock data
  setInterval(() => {
    // Randomly update order statuses
    if (mockData.orders.length > 0) {
      const randomOrderIndex = Math.floor(Math.random() * mockData.orders.length);
      const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      mockData.orders[randomOrderIndex].status = newStatus;
      console.log(`Real-time update: Order #${mockData.orders[randomOrderIndex].id} status changed to ${newStatus}`);
      
      // Notify orders listeners if any
      if (pollingConfig.orders.listeners.length > 0) {
        fetchOrders().then(data => {
          notifyListeners('orders', data);
        });
      }
    }
    
    // Randomly update dashboard stats
    mockData.dashboard.stats.totalOrders = mockData.dashboard.stats.totalOrders + Math.floor(Math.random() * 3);
    
    // 10% chance to add a new order
    if (Math.random() < 0.1) {
      const newOrderId = Math.max(...mockData.orders.map(o => o.id)) + 1;
      const randomProduct = mockData.products[Math.floor(Math.random() * mockData.products.length)];
      
      const newOrder = {
        id: newOrderId,
        customer_name: `New Customer ${newOrderId}`,
        customer_email: `customer${newOrderId}@example.com`,
        contact_number: "555-123-4567",
        shipping_address: "789 New St, City",
        order_date: new Date().toISOString(),
        status: 'pending',
        total_amount: randomProduct.price,
        items: [
          { 
            id: 1, 
            product_id: randomProduct.id, 
            product_name: randomProduct.name, 
            quantity: 1, 
            price: randomProduct.price 
          }
        ]
      };
      
      mockData.orders.push(newOrder);
      console.log(`Real-time update: New order #${newOrderId} received`);
      
      mockData.dashboard.stats.recentOrders.unshift({
        id: newOrderId,
        customer_name: newOrder.customer_name,
        total_amount: newOrder.total_amount,
        status: 'pending',
        order_date: newOrder.order_date
      });
      
      mockData.dashboard.stats.recentOrders = mockData.dashboard.stats.recentOrders.slice(0, 5);
      
      if (pollingConfig.dashboard.listeners.length > 0) {
        fetchDashboardStats().then(data => {
          notifyListeners('dashboard', data);
        });
      }
      
      if (pollingConfig.orders.listeners.length > 0) {
        fetchOrders().then(data => {
          notifyListeners('orders', data);
        });
      }
    }
  }, 15000); 
};

if (USE_MOCK_DATA) {
  simulateDataChanges();
}

export default apiClient;