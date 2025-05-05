import React, { useState, useEffect } from "react";
import { Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import {
  fetchUser,
  createUser,
  updateUser,
} from "../../../services/apiService";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Initialize all form fields with empty strings instead of undefined values
  const [user, setUser] = useState({
    name: "", // This will be mapped to/from first_name + last_name
    first_name: "", // Added to store Django's first_name
    last_name: "", // Added to store Django's last_name
    email: "",
    phone: "",
    role: "customer",
    active: true,
    is_staff: false,
    is_superuser: false,
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const loadUser = async () => {
        try {
          setLoading(true);
          console.log(`Loading user with ID: ${id}`);

          // Add timeout to prevent indefinite loading
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), 5000)
          );

          // Race between the actual fetch and a timeout
          const data = await Promise.race([fetchUser(id), timeoutPromise]);

          console.log("User data loaded:", data);

          // Map backend roles to frontend roles
          let userRole = "customer";
          if (data.is_superuser) {
            userRole = "admin";
          } else if (data.is_staff) {
            userRole = "staff";
          }

          // Create a full name from first_name and last_name
          const fullName =
            `${data.first_name || ""} ${data.last_name || ""}`.trim();

          // Ensure all fields have defined values (empty strings instead of null/undefined)
          setUser({
            name: fullName,
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
            password: "",
            active: Boolean(data.is_active), // Ensure it's a boolean
            role: userRole, // Set the role based on permissions
            is_staff: Boolean(data.is_staff),
            is_superuser: Boolean(data.is_superuser),
          });

          setError(null);
        } catch (err) {
          console.error("Error loading user:", err);

          // Set specific state for "not found" errors
          if (err.message === "User not found") {
            setNotFound(true);
          }

          setError(
            `Failed to load user data: ${err.message || "Unknown error"}`
          );
        } finally {
          setLoading(false);
        }
      };

      loadUser();
    }
  }, [id, isEditing]);

  // If user not found, show a specialized message with navigation options
  if (notFound) {
    return (
      <div className="user-form">
        <Alert variant="warning">
          <Alert.Heading>User Not Found</Alert.Heading>
          <p>
            The user you're trying to edit doesn't exist or has been deleted.
          </p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button
              variant="outline-primary"
              onClick={() => navigate("/admin/users")}
            >
              Back to User List
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "name") {
      // When name changes, split it into first_name and last_name
      const nameParts = value.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ");

      setUser((prev) => ({
        ...prev,
        name: value,
        first_name: firstName,
        last_name: lastName,
      }));
    }
    // Special handling for is_staff and is_superuser when role changes
    else if (name === "role") {
      const isAdmin = value === "admin";
      const isStaff = value === "staff";

      setUser((prev) => ({
        ...prev,
        [name]: value,
        is_staff: isAdmin || isStaff,
        is_superuser: isAdmin,
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Password validation for new users
    if (!isEditing) {
      if (!user.password) {
        setError("Password is required");
        return;
      }

      if (user.password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (user.password.length < 8) {
        // Django default min length is 8
        setError("Password must be at least 8 characters");
        return;
      }
    } else if (user.password && user.password !== confirmPassword) {
      // If editing and password is provided, validate it matches confirmation
      setError("Passwords do not match");
      return;
    }

    try {
      setSaving(true);
      console.log(`${isEditing ? "Updating" : "Creating"} user:`, user);

      // Create a copy of the user data and map frontend fields to Django field names
      const userData = {
        ...user,
        // Make sure to send first_name and last_name separately instead of name
        // The name field is just for the frontend display
        is_active: user.active, // Django uses is_active instead of active
        // Explicitly set is_staff and is_superuser based on role
        is_staff: user.role === "admin" || user.role === "staff",
        is_superuser: user.role === "admin",
      };

      // If editing and password is empty, remove it from the payload
      if (isEditing && !userData.password) {
        delete userData.password;
      }

      if (isEditing) {
        await updateUser(id, userData);
        console.log("User updated successfully");
      } else {
        await createUser(userData);
        console.log("User created successfully");
      }

      navigate("/admin/users");
    } catch (err) {
      console.error(`Error ${isEditing ? "updating" : "creating"} user:`, err);
      setError(
        `Failed to ${isEditing ? "update" : "create"} user: ${err.message || "Please try again"}.`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="user-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditing ? "Edit User" : "Add New User"}</h2>
        <Button variant="secondary" onClick={() => navigate("/admin/users")}>
          <FaArrowLeft className="me-2" /> Back to Users
        </Button>
      </div>

      {error && (
        <Alert
          variant="danger"
          className="mb-4"
          onClose={() => setError(null)}
          dismissible
        >
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a name.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid email.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={user.phone || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={user.role}
                onChange={handleChange}
                required
              >
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Admin: All privileges | Staff: Limited admin access | Customer:
                Regular user
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                name="active"
                checked={user.active}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Password fields - only required for new users */}
            <Form.Group className="mb-3">
              <Form.Label>
                {isEditing
                  ? "Password (leave blank to keep current)"
                  : "Password"}
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                required={!isEditing}
                minLength={8} // Django default
              />
              <Form.Control.Feedback type="invalid">
                Password must be at least 8 characters.
              </Form.Control.Feedback>
              {isEditing && (
                <Form.Text className="text-muted">
                  Only fill this field if you want to change the user's
                  password.
                </Form.Text>
              )}
            </Form.Group>

            {/* Confirm password field */}
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!isEditing || !!user.password}
                isInvalid={confirmPassword && user.password !== confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                Passwords do not match.
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="d-flex align-items-center"
            >
              {saving && (
                <Spinner animation="border" size="sm" className="me-2" />
              )}
              <FaSave className="me-2" /> {isEditing ? "Update" : "Create"} User
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserForm;
