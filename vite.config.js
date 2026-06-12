var _a, _b;
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
/** Must match `BASE_PATH` in `src/lib/base-path.ts`. */
var BASE_PATH = "/demo/fms";
var UPLOAD_API_TARGET = "https://yz1zrecbsj.execute-api.ap-southeast-1.amazonaws.com";
var UPLOAD_API_PATH = "/dev/RnD/webapp/file/upload";
var LIST_FILES_API_PATH = "/dev/RnD/webapp/file/list";
var uploadProxy = {
    target: UPLOAD_API_TARGET,
    changeOrigin: true,
    rewrite: function () { return UPLOAD_API_PATH; },
};
var listFilesProxy = {
    target: UPLOAD_API_TARGET,
    changeOrigin: true,
    rewrite: function () { return LIST_FILES_API_PATH; },
};
// https://vitejs.dev/config/
export default defineConfig({
    base: "".concat(BASE_PATH, "/"),
    plugins: [react(), tsconfigPaths(), tailwindcss()],
    server: {
        proxy: (_a = {},
            _a["".concat(BASE_PATH, "/api/upload")] = uploadProxy,
            _a["".concat(BASE_PATH, "/api/files")] = listFilesProxy,
            _a),
    },
    preview: {
        proxy: (_b = {},
            _b["".concat(BASE_PATH, "/api/upload")] = uploadProxy,
            _b["".concat(BASE_PATH, "/api/files")] = listFilesProxy,
            _b),
    },
});
