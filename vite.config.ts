import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `@use 'src/styles/main.sass' as *;`,
  //     },
  //   },
  // },
});
