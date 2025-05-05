import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Badge,
  Form,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaSync,
} from "react-icons/fa";
import { fetchUsers, deleteUser } from "../../../services/apiService";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = () => {
    loadUsers();
  };

  const handleShowDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    try {
      setDeletingUser(true);
      await deleteUser(userToDelete.id);

      // Remove the user from the state
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete.id)
      );

      handleCloseDeleteModal();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user: " + (err.message || "Unknown error"));
    } finally {
      setDeletingUser(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "admin":
        return "danger";
      case "staff":
        return "warning";
      default:
        return "info";
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Users</h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSync className={loading ? "fa-spin" : ""} /> Refresh
          </Button>
          <Link to="/admin/users/new" className="btn btn-primary">
            <FaUserPlus className="me-2" /> Add User
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div className="mb-4">
        <div className="row">
          <div className="col-md-6 mb-3 mb-md-0">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          <div className="col-md-6">
            <InputGroup>
              <InputGroup.Text>
                <FaFilter />
              </InputGroup.Text>
              <Form.Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="customer">Customer</option>
              </Form.Select>
            </InputGroup>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          <p className="mb-0">No users found matching your criteria.</p>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="bg-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || "-"}</td>
                <td>
                  <Badge
                    bg={getRoleBadgeVariant(user.role)}
                    className="text-capitalize"
                  >
                    {user.role}
                  </Badge>
                  {user.is_staff && !user.is_superuser && (
                    <Badge bg="info" className="ms-1">
                      Staff
                    </Badge>
                  )}
                  {user.is_superuser && (
                    <Badge bg="dark" className="ms-1">
                      Super
                    </Badge>
                  )}
                </td>
                <td>
                  <Badge bg={user.active ? "success" : "secondary"}>
                    {user.active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Link
                      to={`/admin/users/edit/${user.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      <FaEdit /> Edit
                    </Link>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleShowDeleteModal(user)}
                      disabled={user.role === "admin" || user.is_superuser} // Prevent deleting admin or superuser
                    >
                      <FaTrash /> Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete user {userToDelete?.name}? This
            action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteUser}
            disabled={deletingUser}
          >
            {deletingUser ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />{" "}
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserList;
