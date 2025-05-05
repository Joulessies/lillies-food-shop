import axios from "axios";

// Use a hardcoded API URL to avoid environment variable issues
const API_URL = "http://localhost:8000/api";

const USE_MOCK_DATA = false; // Set to false now that the backend is ready

// Mock data for development
const mockData = {
  users: {
    profile: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      address: "123 Main St",
    },
    all: [
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        phone: "555-123-4567",
        role: "admin",
        created_at: "2023-01-15T08:30:00Z",
        active: true,
        is_staff: true,
        is_superuser: true,
      },
      {
        id: 2,
        name: "John Doe",
        email: "john@example.com",
        phone: "555-234-5678",
        role: "customer",
        created_at: "2023-02-20T10:15:00Z",
        active: true,
      },
      {
        id: 3,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "555-345-6789",
        role: "customer",
        created_at: "2023-03-05T14:45:00Z",
        active: true,
      },
      {
        id: 4,
        name: "Robert Johnson",
        email: "robert@example.com",
        phone: "555-456-7890",
        role: "staff",
        created_at: "2023-02-28T09:20:00Z",
        active: false,
      },
    ],
  },
  categories: [
    { id: 1, name: "Burgers", description: "Juicy burgers", active: true },
    { id: 2, name: "Sides", description: "Delicious sides", active: true },
    {
      id: 3,
      name: "Beverages",
      description: "Refreshing drinks",
      active: true,
    },
  ],
  products: [
    {
      id: 1,
      name: "Classic Burger",
      description: "Our signature burger with cheese, lettuce, and tomato",
      price: 9.99,
      category_id: 1,
      active: true,
      image: "https://via.placeholder.com/300x200",
    },
    {
      id: 2,
      name: "French Fries",
      description: "Crispy golden fries",
      price: 3.99,
      category_id: 2,
      active: true,
      image: "https://via.placeholder.com/300x200",
    },
    {
      id: 3,
      name: "Cola",
      description: "Refreshing cola drink",
      price: 2.49,
      category_id: 3,
      active: true,
      image: "https://via.placeholder.com/300x200",
    },
  ],
  orders: [
    {
      id: 1,
      customer_name: "Alice Johnson",
      customer_email: "alice@example.com",
      contact_number: "555-123-4567",
      shipping_address: "123 Main St, City",
      order_date: "2023-04-15T10:30:00Z",
      status: "delivered",
      total_amount: 16.47,
      items: [
        {
          id: 1,
          product_id: 1,
          product_name: "Classic Burger",
          quantity: 1,
          price: 9.99,
        },
        {
          id: 2,
          product_id: 3,
          product_name: "Cola",
          quantity: 2,
          price: 2.49,
        },
      ],
    },
    {
      id: 2,
      customer_name: "Bob Smith",
      customer_email: "bob@example.com",
      contact_number: "555-987-6543",
      shipping_address: "456 Oak St, Town",
      order_date: "2023-04-16T14:45:00Z",
      status: "processing",
      total_amount: 13.98,
      items: [
        {
          id: 1,
          product_id: 2,
          product_name: "French Fries",
          quantity: 2,
          price: 3.99,
        },
        {
          id: 2,
          product_id: 3,
          product_name: "Cola",
          quantity: 2,
          price: 2.49,
        },
      ],
    },
  ],
  dashboard: {
    stats: {
      totalProducts: 3,
      totalCategories: 3,
      totalOrders: 2,
      recentOrders: [
        {
          id: 2,
          customer_name: "Bob Smith",
          total_amount: 13.98,
          status: "processing",
          order_date: "2023-04-16T14:45:00Z",
        },
        {
          id: 1,
          customer_name: "Alice Johnson",
          total_amount: 16.47,
          status: "delivered",
          order_date: "2023-04-15T10:30:00Z",
        },
      ],
      lowStockProducts: [
        { id: 1, name: "Classic Burger", stock: 5 },
        { id: 3, name: "Cola", stock: 3 },
      ],
      categorySales: [
        { category: "Burgers", sales: 450 },
        { category: "Sides", sales: 320 },
        { category: "Beverages", sales: 280 },
      ],
    },
  },
};

// Mock API call helper function with delay to simulate real API calls
const mockApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 500); // 500ms delay to simulate network
  });
};

// Create axios instance with authentication headers
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add authorization header to requests
apiClient.interceptors.request.use(
  (config) => {
    // Get the authentication token from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.token) {
      // Format the token as expected by Django REST Framework
      config.headers["Authorization"] = `Token ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors consistently
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (USE_MOCK_DATA) {
      // If using mock data, don't show network errors
      console.warn("API Error intercepted in mock mode:", error.message);
      return Promise.reject(new Error("API error in mock mode"));
    }
    return Promise.reject(error);
  }
);

// IndexedDB-based user storage system

// Initialize the database
const initDb = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("lilliesShopDB", 1);

    request.onerror = (event) => {
      console.error("Error opening IndexedDB:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create users object store (table)
      if (!db.objectStoreNames.contains("users")) {
        const usersStore = db.createObjectStore("users", {
          keyPath: "id",
          autoIncrement: true,
        });
        usersStore.createIndex("email", "email", { unique: true });

        // Add default admin user
        usersStore.add({
          name: "Admin User",
          email: "admin@example.com",
          password: "password", // In real apps, use hashing
          phone: "123-456-7890",
          role: "admin",
          is_staff: true,
          is_superuser: true,
          active: true,
          created_at: new Date().toISOString(),
        });

        // Add default regular user
        usersStore.add({
          name: "Regular User",
          email: "user@example.com",
          password: "password",
          phone: "987-654-3210",
          role: "customer",
          is_staff: false,
          is_superuser: false,
          active: true,
          created_at: new Date().toISOString(),
        });
      }
    };
  });
};

// Register a new user
export const register = async (userData) => {
  if (USE_MOCK_DATA) {
    try {
      const db = await initDb();

      return new Promise((resolve, reject) => {
        // Check if email exists
        const checkTransaction = db.transaction(["users"], "readonly");
        const checkStore = checkTransaction.objectStore("users");
        const emailIndex = checkStore.index("email");
        const emailCheck = emailIndex.get(userData.email);

        emailCheck.onsuccess = (event) => {
          if (event.target.result) {
            reject(new Error("Email already exists"));
            return;
          }

          // Email doesn't exist, proceed with registration
          const transaction = db.transaction(["users"], "readwrite");
          const store = transaction.objectStore("users");

          const newUser = {
            name: userData.name,
            email: userData.email,
            password: userData.password, // In real app, hash password
            phone: userData.phone || "",
            role: "customer",
            is_staff: false,
            is_superuser: false,
            active: true,
            created_at: new Date().toISOString(),
          };

          const request = store.add(newUser);

          request.onsuccess = () => {
            // Return user without password
            const { password, ...userWithoutPassword } = newUser;
            userWithoutPassword.id = request.result; // Add the generated ID
            resolve(userWithoutPassword);
          };

          request.onerror = () => {
            reject(new Error("Failed to register user"));
          };
        };

        emailCheck.onerror = () => {
          reject(new Error("Failed to check email"));
        };
      });
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  } else {
    try {
      console.log("Registration data being sent:", userData);

      // Use the correct endpoint with auth/ prefix
      const response = await apiClient.post("/auth/register/", userData);

      console.log("Registration successful:", response.data);

      // Store user data in localStorage for immediate login if applicable
      if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error("Registration error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Extract error message from the response if available
      if (error.response?.data) {
        // Django may return validation errors in different formats
        const errorData = error.response.data;

        if (typeof errorData === "string") {
          throw new Error(errorData);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        } else if (errorData.email) {
          throw new Error(
            `Email error: ${Array.isArray(errorData.email) ? errorData.email.join(", ") : errorData.email}`
          );
        } else if (errorData.password) {
          throw new Error(
            `Password error: ${Array.isArray(errorData.password) ? errorData.password.join(", ") : errorData.password}`
          );
        } else if (errorData.name) {
          throw new Error(
            `Name error: ${Array.isArray(errorData.name) ? errorData.name.join(", ") : errorData.name}`
          );
        } else {
          throw new Error(
            "Registration failed. Please check your information and try again."
          );
        }
      }

      throw new Error("Registration failed. Please try again.");
    }
  }
};

// Login user
export const login = async (email, password) => {
  if (USE_MOCK_DATA) {
    try {
      const db = await initDb();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");
        const emailIndex = store.index("email");
        const request = emailIndex.get(email);

        request.onsuccess = (event) => {
          const user = event.target.result;

          if (!user) {
            reject(new Error("Invalid credentials"));
            return;
          }

          // Check password (in a real app, use proper password comparison)
          if (user.password !== password) {
            reject(new Error("Invalid credentials"));
            return;
          }

          // Create a copy without password
          const { password: userPassword, ...userWithoutPassword } = user;

          // Add token for auth simulation
          userWithoutPassword.token = `token-${user.id}-${Date.now()}`;

          resolve(userWithoutPassword);
        };

        request.onerror = () => {
          reject(new Error("Login failed"));
        };
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  } else {
    try {
      // Real API call for login - using proper field names for Simple JWT
      const response = await apiClient.post("/auth/login/", {
        email, // Keep this as email since that's your username field
        password,
      });

      // Store user data in localStorage for auth persistence
      localStorage.setItem("user", JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(
        error.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    }
  }
};

// Fetch all users (for admin panel)
export const fetchUsers = async () => {
  try {
    const db = await initDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const request = store.getAll();

      request.onsuccess = (event) => {
        // Remove passwords from all users
        const users = event.target.result.map((user) => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });

        resolve(users);
      };

      request.onerror = () => {
        reject(new Error("Failed to fetch users"));
      };
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Create/update user (for admin panel)
export const createUser = async (userData) => {
  try {
    const db = await initDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");

      if (userData.id) {
        // Update existing user
        const getRequest = store.get(userData.id);

        getRequest.onsuccess = (event) => {
          const existingUser = event.target.result;

          if (!existingUser) {
            reject(new Error("User not found"));
            return;
          }

          const updatedUser = {
            ...existingUser,
            ...userData,
            // Don't update password if not provided
            password: userData.password || existingUser.password,
          };

          const updateRequest = store.put(updatedUser);

          updateRequest.onsuccess = () => {
            // Return user without password
            const { password, ...userWithoutPassword } = updatedUser;
            resolve(userWithoutPassword);
          };

          updateRequest.onerror = () => {
            reject(new Error("Failed to update user"));
          };
        };

        getRequest.onerror = () => {
          reject(new Error("Failed to fetch user for update"));
        };
      } else {
        // Create new user (use register function)
        register(userData).then(resolve).catch(reject);
      }
    });
  } catch (error) {
    console.error("User operation error:", error);
    throw error;
  }
};

// Delete user (for admin panel)
export const deleteUser = async (userId) => {
  try {
    const db = await initDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const request = store.delete(userId);

      request.onsuccess = () => {
        resolve({ success: true, message: "User deleted successfully" });
      };

      request.onerror = () => {
        reject(new Error("Failed to delete user"));
      };
    });
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};

// Toggle user active status
export const toggleUserStatus = async (userId, active) => {
  try {
    const db = await initDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const getRequest = store.get(userId);

      getRequest.onsuccess = (event) => {
        const user = event.target.result;

        if (!user) {
          reject(new Error("User not found"));
          return;
        }

        user.active = active;

        const updateRequest = store.put(user);

        updateRequest.onsuccess = () => {
          const { password, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        };

        updateRequest.onerror = () => {
          reject(new Error("Failed to update user status"));
        };
      };

      getRequest.onerror = () => {
        reject(new Error("Failed to fetch user for status update"));
      };
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    throw error;
  }
};

// Dashboard
export const fetchDashboardStats = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.dashboard.stats);
  }

  try {
    const response = await apiClient.get("/dashboard/stats/");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// Users
export const fetchUser = async (id) => {
  if (USE_MOCK_DATA) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) throw new Error("Invalid user ID");

    const user = mockData.users.all.find((u) => u.id === parsedId);
    if (!user) throw new Error("User not found");
    return await mockApiCall(user);
  }

  try {
    const response = await apiClient.get(`/admin/users/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  if (USE_MOCK_DATA) {
    const index = mockData.users.all.findIndex((u) => u.id === parseInt(id));
    if (index === -1) throw new Error("User not found");

    mockData.users.all[index] = {
      ...mockData.users.all[index],
      ...userData,
    };
    return await mockApiCall(mockData.users.all[index]);
  }

  try {
    const response = await apiClient.put(`/admin/users/${id}/`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const fetchUserOrders = async (userId) => {
  if (USE_MOCK_DATA) {
    const userOrders = mockData.orders.filter(
      (o) => o.customer_email === userId
    );
    return await mockApiCall(userOrders);
  }

  try {
    const response = await apiClient.get(`/admin/users/${userId}/orders/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

// Categories
export const fetchCategories = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.categories);
  }

  try {
    const response = await apiClient.get("/admin/categories/");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const fetchCategory = async (id) => {
  if (USE_MOCK_DATA) {
    const category = mockData.categories.find((c) => c.id === parseInt(id));
    if (!category) throw new Error("Category not found");
    return await mockApiCall(category);
  }

  try {
    const response = await apiClient.get(`/admin/categories/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  if (USE_MOCK_DATA) {
    const newId = Math.max(...mockData.categories.map((c) => c.id)) + 1;
    const newCategory = {
      id: newId,
      ...categoryData,
      created_at: new Date().toISOString(),
    };
    mockData.categories.push(newCategory);
    return await mockApiCall(newCategory);
  }

  try {
    const response = await apiClient.post("/admin/categories/", categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  if (USE_MOCK_DATA) {
    const index = mockData.categories.findIndex((c) => c.id === parseInt(id));
    if (index === -1) throw new Error("Category not found");

    mockData.categories[index] = {
      ...mockData.categories[index],
      ...categoryData,
      id: parseInt(id),
    };

    return await mockApiCall(mockData.categories[index]);
  }

  try {
    const response = await apiClient.put(
      `/admin/categories/${id}/`,
      categoryData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  if (USE_MOCK_DATA) {
    const index = mockData.categories.findIndex((c) => c.id === parseInt(id));
    if (index === -1) throw new Error("Category not found");

    mockData.categories.splice(index, 1);
    return await mockApiCall({ success: true });
  }

  try {
    await apiClient.delete(`/admin/categories/${id}/`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Helper function to ensure default categories exist
export const ensureDefaultCategories = async () => {
  try {
    const defaultCategories = ["Burgers", "Sides", "Beverages"];

    // First, fetch existing categories
    const existingCategories = await fetchCategories();
    const existingCategoryNames = existingCategories.map((cat) => cat.name);

    // Find which default categories don't exist yet
    const categoriesToCreate = defaultCategories.filter(
      (name) => !existingCategoryNames.includes(name)
    );

    // Create any missing categories
    if (categoriesToCreate.length > 0) {
      console.log(
        `Creating ${categoriesToCreate.length} default categories: ${categoriesToCreate.join(", ")}`
      );

      const creationPromises = categoriesToCreate.map((name) =>
        createCategory({
          name,
          description: `${name} category for food items`,
          active: true,
        })
      );

      await Promise.all(creationPromises);

      // Return the updated categories list
      return await fetchCategories();
    }

    // If no new categories needed, return existing ones
    return existingCategories;
  } catch (error) {
    console.error("Error ensuring default categories exist:", error);
    throw error;
  }
};

// Products
export const fetchProducts = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.products);
  }

  try {
    const response = await apiClient.get("/products/");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchProduct = async (id) => {
  if (USE_MOCK_DATA) {
    const product = mockData.products.find((p) => p.id === parseInt(id));
    if (!product) throw new Error("Product not found");
    return await mockApiCall(product);
  }

  try {
    const response = await apiClient.get(`/products/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  if (USE_MOCK_DATA) {
    const newId = Math.max(...mockData.products.map((p) => p.id)) + 1;
    const newProduct = {
      id: newId,
      ...productData,
      created_at: new Date().toISOString(),
    };

    // Handle FormData conversion for mock data
    if (productData instanceof FormData) {
      const formDataObj = {};
      productData.forEach((value, key) => {
        // For files, store a URL placeholder
        if (value instanceof File) {
          formDataObj[key] = "https://via.placeholder.com/300x200";
        } else {
          formDataObj[key] = value;
        }
      });

      Object.assign(newProduct, formDataObj);
    }

    mockData.products.push(newProduct);
    return await mockApiCall(newProduct);
  }

  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(productData)) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    }

    const response = await apiClient.post("/products/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  if (USE_MOCK_DATA) {
    const index = mockData.products.findIndex((p) => p.id === parseInt(id));
    if (index === -1) throw new Error("Product not found");

    const updatedProduct = { ...mockData.products[index] };

    // Handle FormData conversion for mock data
    if (productData instanceof FormData) {
      productData.forEach((value, key) => {
        // For files, store a URL placeholder
        if (value instanceof File) {
          updatedProduct[key] = "https://via.placeholder.com/300x200";
        } else {
          updatedProduct[key] = value;
        }
      });
    } else {
      Object.assign(updatedProduct, productData);
    }

    mockData.products[index] = updatedProduct;
    return await mockApiCall(updatedProduct);
  }

  try {
    // Use FormData for file uploads
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      // Only append if value is not null
      if (productData[key] !== null) {
        formData.append(key, productData[key]);
      }
    });

    const response = await apiClient.put(`/products/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  if (USE_MOCK_DATA) {
    const index = mockData.products.findIndex((p) => p.id === parseInt(id));
    if (index === -1) throw new Error("Product not found");

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
    const response = await apiClient.get("/orders/");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const fetchOrder = async (id) => {
  if (USE_MOCK_DATA) {
    const order = mockData.orders.find((o) => o.id === parseInt(id));
    if (!order) throw new Error("Order not found");
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
    const index = mockData.orders.findIndex((o) => o.id === parseInt(id));
    if (index === -1) throw new Error("Order not found");

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

// Menu API endpoints
export const fetchMenuCategories = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.categories.filter((c) => c.active));
  }

  try {
    const response = await apiClient.get("/menu/categories/");
    return response.data;
  } catch (error) {
    console.error("Error fetching menu categories:", error);
    throw error;
  }
};

export const fetchMenuItems = async (categoryId) => {
  if (USE_MOCK_DATA) {
    let products = mockData.products.filter((p) => p.active);

    if (categoryId) {
      products = products.filter((p) => p.category_id === parseInt(categoryId));
    }

    return await mockApiCall(products);
  }

  try {
    const url = categoryId
      ? `/menu/items/?category=${categoryId}`
      : "/menu/items/";
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};

// User profile
export const fetchUserProfile = async () => {
  if (USE_MOCK_DATA) {
    return await mockApiCall(mockData.users.profile);
  }

  try {
    const response = await apiClient.get("/user/profile/");
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
      ...profileData,
    };
    return await mockApiCall(mockData.users.profile);
  }

  try {
    const response = await apiClient.put("/user/profile/", profileData);
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
      id: Math.max(...mockData.orders.map((o) => o.id)) + 1,
      ...orderData,
      status: "pending",
      order_date: new Date().toISOString(),
    };
    mockData.orders.push(newOrder);
    return await mockApiCall(newOrder);
  }

  try {
    const response = await apiClient.post("/orders/", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Token refresh functionality
export const refreshToken = async () => {
  try {
    if (USE_MOCK_DATA) {
      // Mock token refresh logic (kept for reference)
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.token) {
        throw new Error("No valid session");
      }
      const newToken = `refresh-token-${user.id}-${Date.now()}`;
      const refreshedUser = {
        ...user,
        token: newToken,
      };
      localStorage.setItem("user", JSON.stringify(refreshedUser));
      return refreshedUser;
    }

    // Get the current user from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.token) {
      throw new Error("No valid session");
    }

    // Real API call for token refresh
    const response = await apiClient.post("/auth/refresh-token/", {
      token: user.token,
    });

    // Update user object with new token
    const refreshedUser = {
      ...user,
      token: response.data.token,
    };

    // Update localStorage
    localStorage.setItem("user", JSON.stringify(refreshedUser));

    return refreshedUser;
  } catch (error) {
    console.error("Token refresh error:", error);
    // Clear user data if refresh fails
    localStorage.removeItem("user");
    throw error;
  }
};

export default {
  login,
  register,
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
  // Additional API functions
  refreshToken,
  toggleUserStatus,
  fetchDashboardStats,
  fetchUserOrders,
  fetchCategories,
  fetchCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  ensureDefaultCategories,
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchOrders,
  fetchOrder,
  updateOrderStatus,
  fetchMenuCategories,
  fetchMenuItems,
  fetchUserProfile,
  updateUserProfile,
  createOrder,
};
