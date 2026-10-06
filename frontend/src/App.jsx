import { useEffect, useState } from "react"
import "./App.css"

function App() {

    // =========================
    // STATE
    // =========================

    const [todoText, setTodoText] = useState("")
    const [todos, setTodos] = useState([])

    const [searchText, setSearchText] = useState("")

    const [darkMode, setDarkMode] = useState(false)

    const [activePage, setActivePage] = useState("Dashboard")


    // =========================
    // GET TODOS
    // =========================

    useEffect(() => {

        fetch("http://localhost:8080/todo")

            .then(response => {

                if (!response.ok) {
                    throw new Error("Failed to fetch TODOs")
                }

                return response.json()
            })

            .then(data => {
                setTodos(data)
            })

            .catch(error => {
                console.error("Error fetching TODOs:", error)
            })

    }, [])


    // =========================
    // ADD TODO
    // =========================

    async function handleAddTodo() {

        if (todoText.trim() === "") {
            alert("Please enter a TODO")
            return
        }

        try {

            const response = await fetch(
                "http://localhost:8080/todo",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        title: todoText,
                        completed: false
                    })
                }
            )


            if (!response.ok) {
                throw new Error("Failed to add TODO")
            }


            const newTodo = await response.json()


            setTodos(previousTodos => [
                ...previousTodos,
                newTodo
            ])


            setTodoText("")

        }

        catch (error) {

            console.error("Error adding TODO:", error)

            alert("Could not add TODO. Check the console.")

        }
    }


    // =========================
    // TOGGLE TODO COMPLETION
    // =========================

    async function handleToggleTodo(todo) {

        try {

            const response = await fetch(
                `http://localhost:8080/todo/${todo.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        title: todo.title,
                        completed: !todo.completed
                    })
                }
            )


            if (!response.ok) {
                throw new Error("Failed to update TODO")
            }


            const updatedTodo = await response.json()


            setTodos(previousTodos =>
                previousTodos.map(currentTodo =>
                    currentTodo.id === updatedTodo.id
                        ? updatedTodo
                        : currentTodo
                )
            )

        }

        catch (error) {

            console.error("Error updating TODO:", error)

            alert("Could not update TODO")

        }
    }


    // =========================
    // SEARCH TODOS
    // =========================

    const filteredTodos = todos.filter(todo =>
        todo.title
            .toLowerCase()
            .includes(searchText.toLowerCase())
    )


    // =========================
    // STATISTICS
    // =========================

    const totalTasks = todos.length

    const completedTasks = todos.filter(
        todo => todo.completed
    ).length

    const pendingTasks = totalTasks - completedTasks


    // =========================
    // ADD TODO WITH ENTER
    // =========================

    function handleKeyDown(event) {

        if (event.key === "Enter") {
            handleAddTodo()
        }
    }


    // =========================
    // RETURN
    // =========================

    return (

        <div className={darkMode ? "app dark" : "app"}>


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="sidebar">

                <div className="logo">
                    ✓ TaskFlow
                </div>


                <nav>

                    <button
                        className={
                            activePage === "Dashboard"
                                ? "nav-item active"
                                : "nav-item"
                        }

                        onClick={() => setActivePage("Dashboard")}
                    >
                        Dashboard
                    </button>


                    <button
                        className={
                            activePage === "My Tasks"
                                ? "nav-item active"
                                : "nav-item"
                        }

                        onClick={() => setActivePage("My Tasks")}
                    >
                        My Tasks
                    </button>


                    <button
                        className={
                            activePage === "Completed"
                                ? "nav-item active"
                                : "nav-item"
                        }

                        onClick={() => setActivePage("Completed")}
                    >
                        Completed
                    </button>


                    <button
                        className={
                            activePage === "Settings"
                                ? "nav-item active"
                                : "nav-item"
                        }

                        onClick={() => setActivePage("Settings")}
                    >
                        Settings
                    </button>

                </nav>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="main-content">


                {/* =========================
                    TOP BAR
                ========================= */}

                <header className="topbar">


                    {/* SEARCH */}

                    <div className="search">

                        <span>🔍</span>

                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchText}
                            onChange={(event) =>
                                setSearchText(event.target.value)
                            }
                        />

                    </div>


                    {/* RIGHT SIDE */}

                    <div className="topbar-right">


                        {/* THEME BUTTON */}

                        <button
                            className="theme-toggle"

                            onClick={() =>
                                setDarkMode(!darkMode)
                            }

                            title={
                                darkMode
                                    ? "Switch to light mode"
                                    : "Switch to dark mode"
                            }
                        >

                            {darkMode ? "☀️" : "🌙"}

                        </button>


                        {/* PROFILE */}

                        <div className="profile">

                            <div className="avatar">
                                S
                            </div>

                            <span>
                                Sarthak
                            </span>

                        </div>

                    </div>

                </header>


                {/* =========================
                    DASHBOARD
                ========================= */}

                <section className="dashboard">


                    {/* WELCOME */}

                    <div className="welcome">

                        <h1>
                            Good morning, Sarthak 👋
                        </h1>

                        <p>
                            Here's what's on your plate today.
                        </p>

                    </div>


                    {/* =========================
                        STATISTICS
                    ========================= */}

                    <div className="stats">


                        <div className="stat-card">

                            <span>
                                Total Tasks
                            </span>

                            <strong>
                                {totalTasks}
                            </strong>

                        </div>


                        <div className="stat-card">

                            <span>
                                Pending
                            </span>

                            <strong>
                                {pendingTasks}
                            </strong>

                        </div>


                        <div className="stat-card">

                            <span>
                                Completed
                            </span>

                            <strong>
                                {completedTasks}
                            </strong>

                        </div>

                    </div>


                    {/* =========================
                        TASK SECTION
                    ========================= */}

                    <div className="task-header">

                        <h2>
                            My Tasks
                        </h2>

                        <p>
                            Manage your daily tasks
                        </p>

                    </div>


                    {/* =========================
                        ADD TASK
                    ========================= */}

                    <div className="add-task">


                        <input
                            type="text"

                            placeholder="What needs to be done?"

                            value={todoText}

                            onChange={(event) =>
                                setTodoText(event.target.value)
                            }

                            onKeyDown={handleKeyDown}
                        />


                        <button
                            onClick={handleAddTodo}
                        >
                            + Add Task
                        </button>

                    </div>


                    {/* =========================
                        TASK LIST
                    ========================= */}

                    <div className="task-list">


                        {filteredTodos.length === 0 ? (

                            <div className="no-tasks">

                                {searchText
                                    ? "No tasks found."
                                    : "No tasks yet. Add your first task!"
                                }

                            </div>

                        ) : (

                            filteredTodos.map(todo => (

                                <div
                                    className="task-card"
                                    key={todo.id}
                                >

                                    <div className="task-left">


                                        {/* CHECKBOX */}

                                        <input
                                            type="checkbox"

                                            checked={
                                                todo.completed
                                            }

                                            onChange={() =>
                                                handleToggleTodo(todo)
                                            }
                                        />


                                        {/* TODO TITLE */}

                                        <span
                                            className={
                                                todo.completed
                                                    ? "completed"
                                                    : ""
                                            }
                                        >
                                            {todo.title}
                                        </span>


                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </section>

            </main>

        </div>
    )
}

export default App