/** Subpath on handrian.space (no trailing slash). */
export var BASE_PATH = "/demo/fms";
export function withBasePath(path) {
    if (path.startsWith(BASE_PATH))
        return path;
    return "".concat(BASE_PATH).concat(path.startsWith("/") ? path : "/".concat(path));
}
