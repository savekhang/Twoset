

export const endpoints = {
  login: `${process.env.REACT_APP_ADMIN_BE}/login`,
  users: `${process.env.REACT_APP_ADMIN_BE}/users`,
  userDetail: (id) => `${process.env.REACT_APP_ADMIN_BE}/users/${id}`,
  userAlbums: (id) => `${process.env.REACT_APP_ADMIN_BE}/users/${id}/albums`,
  interactions: `${process.env.REACT_APP_ADMIN_BE}/interactions`,
  reports: `${process.env.REACT_APP_ADMIN_BE}/reports`,
  stats: `${process.env.REACT_APP_ADMIN_BE}/stats`,
};

export function authHeader() {
  const token = localStorage.getItem("adminToken");
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
}
