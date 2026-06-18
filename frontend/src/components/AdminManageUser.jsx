import React, { useEffect, useState } from "react";

const AdminManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mmuID: "",
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user.userID);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mmuID: user.mmuID || "",
      password: "",
    });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setFormData({
      name: "",
      email: "",
      mmuID: "",
      password: "",
    });
  };

  const handleUpdate = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        alert("Failed to update user.");
        return;
      }

      alert("User updated successfully.");
      cancelEdit();
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Error updating user.");
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");

    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to delete user.");
        return;
      }

      alert("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Error deleting user.");
    }
  };

  const handleBanToggle = async (user) => {
    const userId = user.userID;
    const isBanned = Boolean(user.banned);
    const action = isBanned ? "unban" : "ban";
    const actionLabel = isBanned ? "unban" : "ban";

    const confirmAction = window.confirm(
      `Are you sure you want to ${actionLabel} ${user.name || "this user"}?`
    );

    if (!confirmAction) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/moderation/users/${userId}/${action}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        alert(errorText || `Failed to ${actionLabel} user.`);
        return;
      }

      alert(`User ${isBanned ? "unbanned" : "banned"} successfully.`);
      fetchUsers();
    } catch (error) {
      console.error(`Failed to ${actionLabel} user:`, error);
      alert(`Error trying to ${actionLabel} user.`);
    }
  };

  return (
    <div className="admin-users-page">
      <div className="admin-header">
        <div>
          <h2>Manage Users</h2>
          <p>View, update, and manage registered marketplace users.</p>
        </div>

        <span className="admin-badge">User Management</span>
      </div>

      <div className="admin-users-card">
        <div className="admin-users-table-header">
          <h3>Registered Users</h3>
          <span>{users.length} users</span>
        </div>

        <div className="admin-users-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>MMU ID</th>
                <th>Status</th>
                <th>New Password</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="admin-empty-table">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userID}>
                    <td>{user.userID}</td>

                    <td>
                      {editingUserId === user.userID ? (
                        <input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      ) : (
                        user.name
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          user.banned
                            ? "user-status-badge banned"
                            : "user-status-badge active"
                        }
                      >
                        {user.banned ? "Banned" : "Active"}
                      </span>
                    </td>

                    <td>
                      {editingUserId === user.userID ? (
                        <input
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      ) : (
                        user.email
                      )}
                    </td>

                    <td>
                      {editingUserId === user.userID ? (
                        <input
                          value={formData.mmuID}
                          onChange={(e) =>
                            setFormData({ ...formData, mmuID: e.target.value })
                          }
                        />
                      ) : (
                        user.mmuID
                      )}
                    </td>

                    <td>
                      {editingUserId === user.userID ? (
                        <input
                          type="password"
                          placeholder="Leave blank to keep old password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                        />
                      ) : (
                        "••••••••"
                      )}
                    </td>

                    <td>
                      {editingUserId === user.userID ? (
                        <div className="admin-user-actions">
                          <button
                            className="user-save-btn"
                            onClick={() => handleUpdate(user.userID)}
                          >
                            Save
                          </button>

                          <button
                            className="user-cancel-btn"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="admin-user-actions">
                          <button
                            className="user-edit-btn"
                            onClick={() => startEdit(user)}
                          >
                            Edit
                          </button>

                          <button
                            className={
                              user.banned
                                ? "user-unban-btn"
                                : "user-ban-btn"
                            }
                            onClick={() => handleBanToggle(user)}
                          >
                            {user.banned ? "Unban" : "Ban"}
                          </button>

                          <button
                            className="user-delete-btn"
                            onClick={() => handleDelete(user.userID)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManageUsers;
