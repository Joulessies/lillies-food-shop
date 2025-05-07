import React, { useState } from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import { deleteUser } from "../../../services/apiService";

const UserDeleteConfirmation = ({ show, handleClose, user, onUserDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      await deleteUser(user.id);
      if (onUserDeleted) onUserDeleted(user.id);
      handleClose();
    } catch (err) {
      setError(
        err?.message ||
          "Failed to delete user. Please try again or check for related data."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {user ? (
          <p>
            Are you sure you want to delete user{" "}
            <b>{user.name || user.email}</b>?
            <br />
            This action cannot be undone.
          </p>
        ) : (
          <p>No user selected.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={loading || !user}
        >
          {loading ? <Spinner size="sm" animation="border" /> : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserDeleteConfirmation;
