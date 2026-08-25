import { Platform } from "react-native";

const DEV_URL = Platform.select({
  android: "http://10.0.2.2:8000/api",
  ios: "http://localhost:8000/api",
  default: "http://localhost:8000/api",
});

export const API_BASE_URL = DEV_URL;
