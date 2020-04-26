export const router = {
  getUrl() {
    const path = window.location.pathname;
    return path.length > 1 ? path.slice(1) : path;
  },
};
