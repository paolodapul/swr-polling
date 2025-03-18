import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Enable global variables like `describe`, `it`, etc.
    environment: "jsdom", // Use JSDOM for DOM testing
    setupFiles: "./test/setup.ts", // Optional: Global setup file
    coverage: {
      provider: "v8", // Use V8 for coverage
      reporter: ["text", "json", "html"], // Output coverage in multiple formats
    },
  },
});
