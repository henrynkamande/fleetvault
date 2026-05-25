"use client";

import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useThemeStore } from "@/store/useThemeStore";

export function AppToasts() {
  const resolved = useThemeStore((s) => s.resolved);
  return (
    <ToastContainer
      position="top-right"
      autoClose={4800}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={resolved === "dark" ? "dark" : "light"}
      transition={Bounce}
    />
  );
}
