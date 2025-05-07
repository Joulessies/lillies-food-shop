import axios from "axios";

// Use a hardcoded API URL to avoid environment variable issues
const API_URL = "http://localhost:8000/api";

// Set to false to use real API instead of mock data
const USE_MOCK_DATA = false;

// Create an axios instance with proper configuration
export const apiClient = axios.create({
  baseURL: "http://localhost:8000", // Remove /api from baseURL since it's included in the endpoints
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include auth token on every request
apiClient.interceptors.request.use(
  (config) => {
    // Skip authentication for public endpoints
    if (
      config.url &&
      (config.url.includes("/api/menu/") ||
        config.url.includes("/api/auth/register/"))
    ) {
      return config;
    }

    // Get the user token from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // Check for multiple token formats
    const access =
      user?.access ||
      user?.access_token ||
      user?.token ||
      user?.data?.access ||
      user?.data?.access_token ||
      user?.data?.token;

    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
      // Debug authorization header
      console.log(
        "Adding authorization header:",
        `Bearer ${access.substring(0, 15)}...`
      );
    } else {
      console.warn("No authentication token found in localStorage");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration and refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors (token expired) and try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh the token
        const refreshResponse = await refreshToken();

        // Log successful token refresh
        console.log("Token refreshed successfully");

        // If successful, update the authorization header and retry
        const newToken = refreshResponse.access;
        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("user");
        // Using window.location in a real app would redirect to login
        console.error("Authentication failed, please log in again.");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Helper to get token from localStorage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.access || null;
};

// Initialize the database
const initDb = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("lilliesShopDB", 1);

    request.onerror = (event) => {
      console.error("Error opening IndexedDB:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store (table)
      const usersStore = db.createObjectStore("users", {
        keyPath: "id",
        autoIncrement: true,
      });

      // Add default regular user
      usersStore.createIndex("email", "email", { unique: true });
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

      // Add default admin user
      usersStore.add({
        name: "Admin User",
        email: "admin@example.com",
        password: "lilliesadmin", // Changed from "lilliestestadmin" to "lilliesadmin"
        phone: "123-456-7890",
        role: "admin",
        is_staff: true,
        is_superuser: true,
        active: true,
        created_at: new Date().toISOString(),
      });
    };
  });
};

// Register a new user
export const register = async (userData) => {
  if (USE_MOCK_DATA) {
    try {
      const db = await initDb();

      // Set a longer timeout for busy transactions (5 seconds)
      // This helps when the database is locked by another process
      if (db.transaction) {
        await new Promise((resolve) => {
          const request = db
            .transaction(["users"], "readonly")
            .objectStore("users")
            .count();
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        });
      }

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
          try {
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

            request.onerror = (err) => {
              // Check specifically for database lock errors
              if (
                err.target.error &&
                err.target.error.name === "TransactionInactiveError"
              ) {
                reject(new Error("Database is locked, please try again later"));
              } else {
                reject(
                  new Error(
                    "Failed to register user: " +
                      (err.target.error
                        ? err.target.error.message
                        : "Unknown error")
                  )
                );
              }
            };

            // Add transaction error handling
            transaction.onerror = (err) => {
              reject(
                new Error(
                  "Transaction failed: " +
                    (err.target.error
                      ? err.target.error.message
                      : "Unknown error")
                )
              );
            };

            // Add transaction abort handling
            transaction.onabort = (err) => {
              reject(
                new Error(
                  "Transaction aborted: " +
                    (err.target.error
                      ? err.target.error.message
                      : "Unknown error")
                )
              );
            };
          } catch (transactionError) {
            reject(
              new Error(
                `Failed to create transaction: ${transactionError.message}`
              )
            );
          }
        };

        emailCheck.onerror = (err) => {
          reject(
            new Error(
              "Failed to check email: " +
                (err.target.error ? err.target.error.message : "Unknown error")
            )
          );
        };
      });
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  } else {
    try {
      const response = await apiClient.post("/api/auth/register/", userData);

      // If registration returns a token, store it
      if (response.data.token || response.data.access) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      // Enhanced error extraction from Django responses
      const errorData = error.response?.data;
      let errorMsg = "Registration failed. Please try again.";

      if (errorData) {
        if (typeof errorData === "string") {
          errorMsg = errorData;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.email) {
          errorMsg = `Email error: ${Array.isArray(errorData.email) ? errorData.email.join(", ") : errorData.email}`;
        } else if (errorData.password) {
          errorMsg = `Password error: ${Array.isArray(errorData.password) ? errorData.password.join(", ") : errorData.password}`;
        } else if (errorData.name) {
          errorMsg = `Name error: ${Array.isArray(errorData.name) ? errorData.name.join(", ") : errorData.name}`;
        }
      }

      throw new Error(errorMsg);
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
      console.log("Attempting to log in with:", email);
      const response = await apiClient.post("/api/auth/login/", {
        email: email,
        password: password,
      });

      console.log("Login response:", {
        ...response.data,
        access: response.data.access
          ? `${response.data.access.substring(0, 15)}...`
          : null,
        refresh: response.data.refresh
          ? `${response.data.refresh.substring(0, 15)}...`
          : null,
      });

      // Directly use the response data which should contain access and refresh tokens
      const userData = {
        ...response.data,
        email: email, // Ensure email is included
      };

      // Store user data in localStorage for auth persistence
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      console.error("Login error:", errorMsg);
      throw new Error(errorMsg);
    }
  }
};

// Fetch all users (for admin panel)
export const fetchUsers = async () => {
  if (USE_MOCK_DATA) {
    // Ensure all users have an explicit boolean 'active' property
    return await mockApiCall(
      mockData.users.all.map((u) => ({
        ...u,
        active: !!u.active,
      }))
    );
  }

  try {
    // Change to match the pattern used by fetchProducts and fetchCategories
    const response = await apiClient.get("/api/admin/users/");
    // Ensure all users have an explicit boolean 'active' property
    return Array.isArray(response.data)
      ? response.data.map((u) => ({
          ...u,
          active: !!u.active,
        }))
      : [];
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
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

// Check if a user has associated data that would prevent deletion
export const checkUserDeletable = async (userId) => {
  if (USE_MOCK_DATA) {
    const parsedUserId = parseInt(userId);
    const user = mockData.users.all.find((u) => u.id === parsedUserId);
    if (!user) throw new Error("User not found");

    // Check if user has associated orders
    const associatedOrders = mockData.orders.filter(
      (o) => o.customer_email === user.email
    );

    return {
      deletable: associatedOrders.length === 0,
      reason:
        associatedOrders.length > 0
          ? `User has ${associatedOrders.length} associated orders`
          : null,
    };
  }

  // Always allow deletion for real API (skip can-delete endpoint)
  return { deletable: true, reason: null };
};

// Delete user (for admin panel)
export const deleteUser = async (userId) => {
  if (USE_MOCK_DATA) {
    const parsedUserId = parseInt(userId);
    const index = mockData.users.all.findIndex((u) => u.id === parsedUserId);
    if (index === -1) throw new Error("User not found");

    // Check if user has associated orders (by email)
    const userEmail = mockData.users.all[index].email;
    const associatedOrders = mockData.orders.filter(
      (o) => o.customer_email === userEmail
    );

    if (associatedOrders.length > 0) {
      throw new Error(
        `Cannot delete user: ${userEmail} has ${associatedOrders.length} associated orders. Please reassign or delete these orders first.`
      );
    }

    mockData.users.all.splice(index, 1);
    return await mockApiCall({
      success: true,
      message: "User deleted successfully",
    });
  }

  try {
    // Try to delete the user
    await apiClient.delete(`/api/admin/users/${userId}/`);
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);

    // Handle 404 Not Found errors - consider this a success since the user is already gone
    if (error.response && error.response.status === 404) {
      return {
        success: true, // Regular success, not forcedSuccess
        message: "User successfully removed",
      };
    }

    // Handle 500 Internal Server errors
    if (error.response && error.response.status === 500) {
      // Check for specific database errors
      const errorMessage = error.response.data || "";
      const errorStr =
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage);

      if (errorStr.includes("no such table")) {
        return {
          forcedSuccess: true,
          message:
            "Database error: Missing table. Run migrations with 'python manage.py migrate'",
        };
      }

      if (errorStr.includes("foreign key constraint")) {
        return {
          forcedSuccess: true,
          message:
            "Cannot delete user because they have related data (orders, etc.)",
        };
      }

      return {
        forcedSuccess: true,
        message: "Database error. Check your Django logs.",
      };
    }

    // For other errors, throw as before
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
  try {
    const response = await apiClient.get("/api/dashboard/stats/");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return empty stats instead of mock data
    return {
      total_products: 0,
      total_categories: 0,
      total_orders: 0,
      recent_orders: [],
      low_stock_products: [],
      category_sales: [],
    };
  }
};

// User
export const fetchUser = async (id) => {
  try {
    const response = await apiClient.get(`/api/admin/users/${id}/`);
    // Ensure 'active' is boolean
    return { ...response.data, active: !!response.data.active };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await apiClient.put(`/api/admin/users/${id}/`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const fetchUserOrders = async (userId) => {
  try {
    const response = await apiClient.get(`/api/admin/users/${userId}/orders/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

// Categories
export const fetchCategories = async () => {
  try {
    const response = await apiClient.get("/api/categories/");
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Return empty array on error to prevent UI crashes
    return [];
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
    const response = await apiClient.get("/api/products/");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    // If there's a 500 error, suggest database migration
    if (error.response && error.response.status === 500) {
      console.error(
        "Database schema might be out of date. Please run migrations."
      );
      // Return empty array to prevent UI errors
      return [];
    }
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
    const response = await apiClient.get(`/admin/products/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Utility to check required product fields before calling createProduct
export function validateProductFields(productData) {
  const requiredFields = ["name", "description", "price"];

  // Category could be named either category or category_id
  const hasCategoryField =
    (productData["category"] !== undefined &&
      productData["category"] !== null &&
      productData["category"] !== "") ||
    (productData["category_id"] !== undefined &&
      productData["category_id"] !== null &&
      productData["category_id"] !== "");

  const missingFields = requiredFields.filter(
    (field) =>
      productData[field] === undefined ||
      productData[field] === null ||
      productData[field] === ""
  );

  // Add category to missing fields if neither category nor category_id is present
  if (!hasCategoryField) {
    missingFields.push("category");
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

// Create product with proper validation and file upload handling
export const createProduct = async (productData) => {
  try {
    // Don't recreate FormData if it's already a FormData object
    let formData;

    if (productData instanceof FormData) {
      formData = productData;

      // Debug form data entries
      console.log("FormData received, checking entries:");

      // Check if category field exists, if not, look for category_id
      const hasCategory = formData.has("category");
      const hasCategoryId = formData.has("category_id");

      if (!hasCategory && hasCategoryId) {
        // Convert category_id to category for backend compatibility
        const categoryId = formData.get("category_id");
        formData.append("category", categoryId);
        console.log("Converted category_id to category:", categoryId);
      }
    } else {
      // Create new FormData if received a plain object
      formData = new FormData();

      // Handle image file separately
      if (productData.image instanceof File) {
        formData.append("image", productData.image);
      }

      // Append other product data
      Object.keys(productData).forEach((key) => {
        if (key !== "image") {
          // Convert category_id to category if needed
          if (key === "category_id") {
            formData.append("category", productData[key]);
          } else {
            formData.append(key, productData[key]);
          }
        }
      });
    }

    // Log the final FormData contents for debugging
    console.log("Final FormData entries being sent:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    const response = await apiClient.post("/api/products/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update product with proper file upload handling
export const updateProduct = async (id, productData) => {
  try {
    // Don't recreate FormData if it's already a FormData object
    let formData;

    if (productData instanceof FormData) {
      formData = productData;

      // Check if category field exists, if not, look for category_id
      const hasCategory = formData.has("category");
      const hasCategoryId = formData.has("category_id");

      if (!hasCategory && hasCategoryId) {
        // Convert category_id to category for backend compatibility
        const categoryId = formData.get("category_id");
        formData.append("category", categoryId);
        console.log("Converted category_id to category:", categoryId);
      }
    } else {
      // Create new FormData if received a plain object
      formData = new FormData();

      // Handle image file separately
      if (productData.image instanceof File) {
        formData.append("image", productData.image);
      }

      // Append other product data
      Object.keys(productData).forEach((key) => {
        if (key !== "image" || !(productData.image instanceof File)) {
          // Convert category_id to category if needed
          if (key === "category_id") {
            formData.append("category", productData[key]);
          } else {
            formData.append(key, productData[key]);
          }
        }
      });
    }

    // Log the final FormData contents for debugging
    console.log("Update request data for product", id + ":");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    const response = await apiClient.patch(`/api/products/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
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
    await apiClient.delete(`/api/products/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

// Orders
export const fetchOrders = async () => {
  try {
    const response = await apiClient.get("/api/orders/");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    // Return empty array instead of mock data
    return [];
  }
};

export const fetchOrder = async (id) => {
  if (USE_MOCK_DATA) {
    const order = mockData.orders.find((o) => o.id === parseInt(id));
    if (!order) throw new Error("Order not found");
    return await mockApiCall(order);
  }

  try {
    // Updated to use correct API endpoint
    const response = await apiClient.get(`/api/orders/${id}/`);
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
    // Updated to use correct API endpoint
    const response = await apiClient.patch(`/api/orders/${id}/`, { status });
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
    const response = await apiClient.get("/api/menu/categories/");
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
      ? `/api/menu/items/?category=${categoryId}`
      : "/api/menu/items/";
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
    const response = await apiClient.post("/api/orders/", orderData);
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

    // Debug user object
    console.log("User object for token refresh:", {
      hasUser: !!user,
      hasRefresh: !!user?.refresh,
      tokenKeys: Object.keys(user || {}),
    });

    // Check for refresh token - Django JWT uses 'refresh' field
    const refreshToken = user?.refresh;

    // If no refresh token is available, throw error
    if (!refreshToken) {
      console.error("No refresh token available");
      throw new Error("No valid session");
    }

    // Real API call for token refresh - Django REST framework simple JWT
    console.log(
      "Attempting to refresh token with:",
      refreshToken.substring(0, 15) + "..."
    );
    const response = await apiClient.post("/api/auth/refresh/", {
      refresh: refreshToken,
    });

    console.log("Token refresh response:", response.data);

    // Update user object with new access token from response
    const refreshedUser = {
      ...user,
      access: response.data.access,
      // Keep the refresh token if it wasn't rotated
      refresh: response.data.refresh || user.refresh,
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
  checkUserDeletable,
  validateProductFields,
};
