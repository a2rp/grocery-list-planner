import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/grocery-list-planner/",
    build: { sourcemap: false },
    plugins: [react()],
});