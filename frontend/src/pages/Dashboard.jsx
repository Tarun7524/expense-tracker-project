import { useEffect, useState } from "react";
import "../App.css";

import VoiceExpense from "../components/VoiceExpense";

import { getExpenses, addExpense, deleteExpense } from "../api/expenseApi";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
  });

  const categoryColors = {
    Food: "#FFF3B0",
    Bills: "#C4B5FD",
    Shopping: "#FFC8DD",
    Travel: "#BDE0FE",
    Other: "#D1FAE5",
    Entertainment: "#D1D5DB",
    Education: "#BBF7D0",
    Health: "#FECACA",
  };

  const fetchExpenses = async () => {
    try {
      const response = await getExpenses();
      setExpenses(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalAmount = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const filteredExpenses = expenses.filter((expense) => {
    const matchSearch = expense.title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchCategory =
      selectedCategory === "All" || expense.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const createChartData = (list, label) => ({
    labels: list.map((expense) => expense.title),
    datasets: [
      {
        label,
        data: list.map((expense) => Number(expense.amount)),
        backgroundColor: list.map(
          (expense) => categoryColors[expense.category] || "#cccccc"
        ),
        borderRadius: 12,
      },
    ],
  });

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] =
      (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: "Category Wise Expenses",
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(
          (category) => categoryColors[category] || "#cccccc"
        ),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 60,
          minRotation: 45,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addExpense(formData);
      setFormData({ title: "", amount: "", category: "" });
      fetchExpenses();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

  return (
    <div className={darkMode ? "app dark-mode" : "app light-mode"}>
      <nav className="navbar-custom">
        <div className="brand">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>

          <img
            src="/expenses tracker logo.png"
            alt="logo"
            className="logo-img"
          />

          <h2>Expense Tracker</h2>
        </div>
      </nav>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <aside className="sidebar" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSidebarOpen(false)}>
              ✕
            </button>

            <a href="#dashboard" onClick={() => setSidebarOpen(false)}>
              🏠 Dashboard
            </a>

            <a href="#transactions" onClick={() => setSidebarOpen(false)}>
              💳 Transactions
            </a>

            <a href="#analytics" onClick={() => setSidebarOpen(false)}>
              📊 Analytics
            </a>

            <a href="#categories" onClick={() => setSidebarOpen(false)}>
              🗂 Categories
            </a>

            <button
              className="sidebar-theme-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
            </button>

            <button className="sidebar-logout" onClick={handleLogout}>
              ↪ Logout
            </button>
          </aside>
        </div>
      )}

      <main className="main-container">
        <section className="dashboard-grid" id="dashboard">
          <div className="summary-card expense-card">
            <div className="dashboard-icon">💼</div>
            <div>
              <h3>Total Expenses</h3>
              <h1>₹{totalAmount.toFixed(2)}</h1>
              <p>Current month summary</p>
            </div>
            <span className="dashboard-emoji">📈</span>
          </div>

          <div className="summary-card transaction-card">
            <div className="dashboard-icon">🧾</div>
            <div>
              <h3>Total Transactions</h3>
              <h1>{expenses.length}</h1>
              <p>Current month summary</p>
            </div>
            <span className="dashboard-emoji">💳</span>
          </div>
        </section>

        <section className="glass-card" id="categories">
          <h2 className="section-title">➕ Add Expense</h2>

          <form onSubmit={handleSubmit} className="expense-form">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="amount"
              placeholder="Amount ₹"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Bills">Bills</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>

            <button type="submit">💾 Save</button>
          </form>
        </section>

        <VoiceExpense onExpenseAdded={fetchExpenses} />

        <section className="glass-card" id="analytics">
          <div className="analytics-header">
            <div>
              <h2 className="chart-title">📊 Visual Analytics - All Expenses</h2>
              <p>Showing all expenses in one graph</p>
            </div>

            <div className="badge-group">
              <span className="total-badge">
                ₹{totalAmount.toFixed(2)} Total
              </span>

              <span className="count-badge">{expenses.length} Records</span>
            </div>
          </div>

          <div
            className="chart-box"
            style={{
              height: "500px",
              overflowX: "auto",
            }}
          >
            <Bar
              data={createChartData(expenses, "Expense Amount ₹")}
              options={chartOptions}
            />
          </div>
        </section>

        <section className="glass-card">
          <h2 className="chart-title">🥧 Category Wise Expenses</h2>

          <div className="pie-box">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </section>

        <section className="glass-card" id="transactions">
          <h2 className="section-title">🧾 Transaction History</h2>

          <div className="filter-box">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Bills">Bills</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>

            <a
              href="https://expense-tracker-api-pg6z.onrender.com/api/export-excel/"
              className="export-btn"
            >
              ⬇ Export Excel
            </a>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Description</th>
                  <th>Amount ₹</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-text">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense, index) => (
                    <tr key={expense.id}>
                      <td>{index + 1}</td>
                      <td>{expense.title}</td>
                      <td className="amount">₹{expense.amount}</td>
                      <td>
                        <span
                          className={`category-badge badge-${expense.category.toLowerCase()}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td>{expense.date}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(expense.id)}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-content">
            <p className="copyright">
              © 2026 Expense Tracker. All Rights Reserved.
              <br />
              Tarun kumar killamsetti
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;