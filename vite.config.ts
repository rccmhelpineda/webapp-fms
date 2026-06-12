import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

/** Must match `BASE_PATH` in `src/lib/base-path.ts`. */
const BASE_PATH = "/demo/fms";

const UPLOAD_API_TARGET =
  "https://yz1zrecbsj.execute-api.ap-southeast-1.amazonaws.com";
const UPLOAD_API_PATH = "/dev/RnD/webapp/file/upload";

const uploadProxy = {
  target: UPLOAD_API_TARGET,
  changeOrigin: true,
  rewrite: () => UPLOAD_API_PATH,
} as const;

// https://vitejs.dev/config/
export default defineConfig({
  base: `${BASE_PATH}/`,
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    proxy: {
      [`${BASE_PATH}/api/upload`]: uploadProxy,
    },
  },
  preview: {
    proxy: {
      [`${BASE_PATH}/api/upload`]: uploadProxy,
    },
  },
});
