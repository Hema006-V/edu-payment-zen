// Re-export auth functions from the unified server-functions module
// so that __root.tsx can continue to import from here.
export { loginFn, logoutFn, getCurrentUserFn } from "./server-functions";
