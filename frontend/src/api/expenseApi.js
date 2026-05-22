import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/expenses/";

export const getExpenses = () => axios.get(API_URL);

export const addExpense = (expenseData) =>
  axios.post(API_URL, expenseData);

export const deleteExpense = (id) =>
  axios.delete(`${API_URL}${id}/`);