
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8080";

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [notice, setNotice] = useState("");

  const [todos, setTodos] = useState([]);
  const [todoText, setTodoText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [taskLoading, setTaskLoading] = useState(false);

  // All API requests use the browser's session cookie.
  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;

      try {
        const data = await response.json();
        message = data.message || data.error || message;
      } catch {
        // The server may return an empty response.
      }

      throw new Error(message);
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type");
    return contentType?.includes("application/json")
      ? response.json()
      : null;
  }

  // Check whether an existing session is still valid.
  async function loadTodos() {
    const data = await apiRequest("/api/todos");
    setTodos(Array.isArray(data) ? data : []);
    return true;
  }

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const data = await apiRequest("/api/todos");

        if (!cancelled) {
          setTodos(Array.isArray(data) ? data : []);
          setUser({ name: "TaskFlow User", email: "" });
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setTodos([]);
        }
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Register or log in.
  async function handleAuth(event) {
    event.preventDefault();
    setAuthError("");
    setNotice("");
    setAuthLoading(true);

    try {
      if (authMode === "register") {
        await apiRequest("/api/users/register", {
          method: "POST",
          body: JSON.stringify(authForm),
        });

        setAuthMode("login");
        setAuthForm((previous) => ({
          ...previous,
          password: "",
        }));
        setNotice("Account created! Please log in.");
        return;
      }

      const loggedInUser = await apiRequest("/api/users/login", {
        method: "POST",
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      });

      setUser(loggedInUser);
      await loadTodos();
      setAuthForm({ name: "", email: "", password: "" });
      setNotice("");
    } catch (error) {
      setAuthError(error.message || "Authentication failed.");
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  // Log out and invalidate the server session.
  async function handleLogout() {
    try {
      await apiRequest("/api/users/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setTodos([]);
      setNotice("You have logged out.");
      setAuthMode("login");
    }
  }

  // Add a task.
  async function handleAddTodo(event) {
    event?.preventDefault();

    const title = todoText.trim();
    if (!title || taskLoading) return;

    setTaskLoading(true);

    try {
      const newTodo = await apiRequest("/api/todos", {
        method: "POST",
        body: JSON.stringify({ title, completed: false }),
      });

      setTodos((previous) => [...previous, newTodo]);
      setTodoText("");
      setNotice("");
    } catch (error) {
      setNotice(`Could not add task: ${error.message}`);
    } finally {
      setTaskLoading(false);
    }
  }

  // Toggle task completion.
  async function handleToggleTodo(todo) {
    try {
      const updatedTodo = await apiRequest(`/api/todos/${todo.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: todo.title,
          completed: !todo.completed,
        }),
      });

      setTodos((previous) =>
        previous.map((item) =>
          item.id === updatedTodo.id ? updatedTodo : item
        )
      );
    } catch (error) {
      setNotice(`Could not update task: ${error.message}`);
    }
  }

  // Delete a task.
  async function handleDeleteTodo(todo) {
    try {
      await apiRequest(`/api/todos/${todo.id}`, {
        method: "DELETE",
      });

      setTodos((previous) =>
        previous.filter((item) => item.id !== todo.id)
      );
    } catch (error) {
      setNotice(`Could not delete task: ${error.message}`);
    }
  }

  const totalTasks = todos.length;
  const completedTasks = todos.filter((todo) => todo.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    if (activePage === "Completed") {
      return matchesSearch && todo.completed;
    }

    if (activePage === "My Tasks") {
      return matchesSearch && !todo.completed;
    }

    return matchesSearch;
  });

  if (!authChecked) {
    return (
      <div style={styles.screen}>
        <p>Connecting to TaskFlow...</p>
      </div>
    );
  }

  // Login and registration screen.
  if (!user) {
    return (
      <div style={styles.screen}>
        <form onSubmit={handleAuth} style={styles.authCard}>
          <h1 style={styles.authTitle}>✓ TaskFlow</h1>
          <p style={styles.muted}>
            {authMode === "login"
              ? "Welcome back! Log in to continue."
              : "Create your account to get started."}
          </p>

          {authMode === "register" && (
            <label style={styles.label}>
              Full name
              <input
                style={styles.input}
                type="text"
                autoComplete="name"
                required
                value={authForm.name}
                onChange={(event) =>
                  setAuthForm({ ...authForm, name: event.target.value })
                }
                placeholder="Your name"
              />
            </label>
          )}

          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              type="email"
              autoComplete="email"
              required
              value={authForm.email}
              onChange={(event) =>
                setAuthForm({ ...authForm, email: event.target.value })
              }
              placeholder="you@example.com"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              autoComplete={
                authMode === "login" ? "current-password" : "new-password"
              }
              minLength={8}
              required
              value={authForm.password}
              onChange={(event) =>
                setAuthForm({ ...authForm, password: event.target.value })
              }
              placeholder="At least 8 characters"
            />
          </label>

          {authError && <p style={styles.error}>{authError}</p>}
          {notice && <p style={styles.success}>{notice}</p>}

          <button
            style={styles.primaryButton}
            type="submit"
            disabled={authLoading}
          >
            {authLoading
              ? "Please wait..."
              : authMode === "login"
                ? "Log in"
                : "Create account"}
          </button>

          <p style={styles.switchText}>
            {authMode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              style={styles.linkButton}
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setAuthError("");
                setNotice("");
              }}
            >
              {authMode === "login" ? "Register" : "Log in"}
            </button>
          </p>
        </form>
      </div>
    );
  }

  // Main dashboard.
  return (
    <div className={darkMode ? "app dark" : "app"}>
      <aside className="sidebar">
        <div className="logo">✓ TaskFlow</div>

        <nav>
          {["Dashboard", "My Tasks", "Completed", "Settings"].map((page) => (
            <button
              key={page}
              className={`nav-item ${activePage === page ? "active" : ""}`}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}

          <button className="nav-item" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          <div className="topbar-right">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle theme"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <div className="profile">
              <div className="avatar">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </div>
              <span>{user.name || user.email}</span>
            </div>
          </div>
        </header>

        <section className="dashboard">
          <div className="welcome">
            <h1>Hello, {user.name || "there"} 👋</h1>
            <p>Here's what's on your plate today.</p>
          </div>

          {notice && (
            <p role="status" style={{ marginBottom: 16 }}>
              {notice}
              <button
                type="button"
                onClick={() => setNotice("")}
                style={styles.dismissButton}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </p>
          )}

          {activePage !== "Settings" ? (
            <>
              <div className="stats">
                <div className="stat-card">
                  <span>Total Tasks</span>
                  <strong>{totalTasks}</strong>
                </div>
                <div className="stat-card">
                  <span>Pending</span>
                  <strong>{pendingTasks}</strong>
                </div>
                <div className="stat-card">
                  <span>Completed</span>
                  <strong>{completedTasks}</strong>
                </div>
              </div>

              <div className="task-header">
                <h2>{activePage === "Completed" ? "Completed Tasks" : "My Tasks"}</h2>
                <p>Manage your daily tasks</p>
              </div>

              {activePage !== "Completed" && (
                <form className="add-task" onSubmit={handleAddTodo}>
                  <input
                    type="text"
                    placeholder="What needs to be done?"
                    value={todoText}
                    onChange={(event) => setTodoText(event.target.value)}
                    maxLength={200}
                  />
                  <button type="submit" disabled={taskLoading || !todoText.trim()}>
                    {taskLoading ? "Adding..." : "Add Task"}
                  </button>
                </form>
              )}

              <div className="task-list">
                {filteredTodos.length === 0 ? (
                  <p className="no-tasks">No tasks to show. Add one to get started!</p>
                ) : (
                  filteredTodos.map((todo) => (
                    <div
                      className={`task-card ${todo.completed ? "completed" : ""}`}
                      key={todo.id}
                    >
                      <div className="task-left">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleTodo(todo)}
                          aria-label={`Mark ${todo.title} ${
                            todo.completed ? "pending" : "completed"
                          }`}
                        />
                        <span>{todo.title}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTodo(todo)}
                        aria-label={`Delete ${todo.title}`}
                        title="Delete task"
                        style={styles.deleteButton}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="task-header">
              <h2>Settings</h2>
              <p>Signed in as {user.email || user.name}</p>
              <button onClick={handleLogout} style={styles.primaryButton}>
                Log out
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
    fontFamily: "Arial, sans-serif",
  },
  authCard: {
    width: "100%",
    maxWidth: 400,
    boxSizing: "border-box",
    padding: 32,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 12px 40px rgba(15, 23, 42, 0.10)",
  },
  authTitle: {
    textAlign: "center",
    margin: "0 0 8px",
    color: "#4f46e5",
  },
  muted: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: 24,
  },
  label: {
    display: "block",
    marginBottom: 16,
    color: "#334155",
    fontSize: 14,
    fontWeight: 600,
  },
  input: {
    display: "block",
    boxSizing: "border-box",
    width: "100%",
    marginTop: 8,
    padding: 12,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 15,
  },
  primaryButton: {
    width: "100%",
    padding: 12,
    border: 0,
    borderRadius: 8,
    background: "#4f46e5",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    color: "#b91c1c",
    fontSize: 14,
  },
  success: {
    color: "#15803d",
    fontSize: 14,
  },
  switchText: {
    marginTop: 20,
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },
  linkButton: {
    border: 0,
    padding: 0,
    background: "none",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: 600,
  },
  deleteButton: {
    border: 0,
    background: "transparent",
    cursor: "pointer",
    padding: 8,
  },
  dismissButton: {
    marginLeft: 10,
    border: 0,
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
  },
};
