import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { fetchUser, updateUser } from "../../../services/apiService";
import { FaSave } from "react-icons/fa";

const UserEditModal = ({ show, handleClose, userId, onUserUpdated }) => {
  const [user, setUser] = useState({
    name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "customer",
    active: true,
    is_staff: false,
    is_superuser: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (show && userId) {
      loadUser();
    }
  }, [show, userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await fetchUser(userId);

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

      // Set user data
      setUser({
        name: fullName,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        active: Boolean(data.is_active),
        role: userRole,
        is_staff: Boolean(data.is_staff),
        is_superuser: Boolean(data.is_superuser),
      });

      setError(null);
    } catch (err) {
      console.error("Error loading user:", err);
      setError(`Failed to load user data: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "name") {
      // Split name into first name and last name
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
    // Special handling for role changes
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
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setSaving(true);

      // Prepare user data for the API
      const userData = {
        ...user,
        is_active: user.active,
        is_staff: user.role === "admin" || user.role === "staff",
        is_superuser: user.role === "admin",
      };

      const updatedUser = await updateUser(userId, userData);

      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }

      handleClose();
    } catch (err) {
      console.error("Error updating user:", err);
      setError(`Failed to update user: ${err.message || "Please try again"}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Quick Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2">Loading user data...</p>
          </div>
        ) : (
          <>
            {error && (
              <Alert
                variant="danger"
                onClose={() => setError(null)}
                dismissible
              >
                {error}
              </Alert>
            )}

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
                  Name is required
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
                  Valid email is required
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={user.role}
                  onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Admin: All privileges | Staff: Limited admin access |
                  Customer: Regular user
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
            </Form>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || saving}
        >
          {saving ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />{" "}
              Saving...
            </>
          ) : (
            <>
              <FaSave className="me-2" /> Save Changes
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserEditModal;
