import axios from "axios";

const LOGIN_URL = "http://127.0.0.1:8000/api/token/";

export const loginUser = (loginData) => {
  return axios.post(LOGIN_URL, loginData);
};