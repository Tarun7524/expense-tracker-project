import axios from "axios";

const LOGIN_URL = "https://expense-tracker-api-pg6z.onrender.com";

export const loginUser = (loginData) => {
  return axios.post(LOGIN_URL, loginData);
};