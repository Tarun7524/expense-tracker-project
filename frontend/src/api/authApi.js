import axios from "axios";

const API_URL = "https://expense-tracker-api-pg6z.onrender.com/api/expenses/";

export const getExpenses = () => axios.get(API_URL);

export const addExpense = (expenseData) =>
  axios.post(API_URL, expenseData);

export const deleteExpense = (id) =>
  axios.delete(`${API_URL}${id}/`);