import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Badge,
  Form,
  InputGroup,
  Pagination,
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
import UserDeleteConfirmation from "./UserDeleteConfirmation";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
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

  const handleDeleteUser = async (userId) => {
    try {
      const result = await deleteUser(userId);

      // Check if it was a real success or forced success
      if (result.forcedSuccess) {
        setError(
          "User was not deleted from the database. Error: " +
            (result.message ||
              "Database error. Please run migrations on the backend.")
        );
        return;
      }

      // Only remove from UI and show success message if actually deleted
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setSuccessMessage("User was successfully deleted.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(
        `Failed to delete user: ${err.message || "Database error"}. If this is a database error, try running 'python manage.py migrate' on your backend.`
      );
    } finally {
      handleCloseDeleteModal();
    }
  };

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

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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

      {successMessage && (
        <Alert
          variant="success"
          onClose={() => setSuccessMessage("")}
          dismissible
        >
          {successMessage}
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
        <>
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
              {currentUsers.map((user) => (
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
                        disabled={user.role === "admin" || user.is_superuser}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNumber = idx + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 2 &&
                      pageNumber <= currentPage + 2)
                  ) {
                    return (
                      <Pagination.Item
                        key={pageNumber}
                        active={pageNumber === currentPage}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    );
                  } else if (
                    pageNumber === currentPage - 3 ||
                    pageNumber === currentPage + 3
                  ) {
                    return (
                      <Pagination.Ellipsis key={`ellipsis-${pageNumber}`} />
                    );
                  }
                  return null;
                })}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Use UserDeleteConfirmation modal */}
      <UserDeleteConfirmation
        show={showDeleteModal}
        handleClose={handleCloseDeleteModal}
        user={userToDelete}
        onUserDeleted={(deletedUserId) => handleDeleteUser(deletedUserId)}
      />
    </div>
  );
};

export default UserList;
