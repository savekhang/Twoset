import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { endpoints, authHeader } from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  
  // State cho form thêm user mới - đầy đủ các trường
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    gender: "other",
    birthdate: "",
    bio: "",
    avatar_url: "",
    is_premium: false,
    is_verified: false,
  });

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints.users, authHeader());
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error:", err);
      alert("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // MỞ MODAL EDIT + LẤY CHI TIẾT USER
  const openEditModal = async (user) => {
    setLoadingDetail(true);
    setSelectedUser(user);

    try {
      const res = await axios.get(`${endpoints.users}/${user.id}`, authHeader());
      const fullUser = res.data.user;

      setEditForm({
        name: fullUser.name || "",
        email: fullUser.email || "",
        gender: fullUser.gender || "other",
        birthdate: fullUser.birthdate || "",
        bio: fullUser.bio || "",
        is_premium: fullUser.is_premium == 1,
        is_verified: fullUser.is_verified == 1,
      });
    } catch (err) {
      console.error("Lấy chi tiết user lỗi:", err);
      alert("Không thể tải thông tin chi tiết người dùng");
      setSelectedUser(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // LƯU SỬA USER
  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) return alert("Tên không được để trống");
    if (!editForm.email.trim()) return alert("Email không được để trống");

    try {
      await axios.put(
        `${endpoints.users}/${selectedUser.id}`,
        {
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          gender: editForm.gender,
          birthdate: editForm.birthdate || null,
          bio: editForm.bio.trim(),
          is_premium: editForm.is_premium ? 1 : 0,
          is_verified: editForm.is_verified ? 1 : 0,
        },
        authHeader()
      );

      alert("Cập nhật người dùng thành công!");
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // XÓA USER
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")) return;

    try {
      await axios.delete(`${endpoints.users}/${id}`, authHeader());
      alert("Xóa người dùng thành công");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Xóa thất bại");
    }
  };

  // THÊM USER MỚI - ĐẦY ĐỦ CÁC TRƯỜNG
  const handleAddUser = async () => {
    if (!newUser.name.trim()) return alert("Vui lòng nhập Họ và tên");
    if (!newUser.email.trim()) return alert("Vui lòng nhập Email");
    if (!newUser.password || newUser.password.length < 6) return alert("Mật khẩu phải có ít nhất 6 ký tự");

    try {
      await axios.post(endpoints.users, {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password, // Plain text (không bcrypt)
        gender: newUser.gender,
        birthdate: newUser.birthdate || null,
        bio: newUser.bio.trim() || null,
        avatar_url: newUser.avatar_url.trim() || null,
        is_premium: newUser.is_premium ? 1 : 0,
        is_verified: newUser.is_verified ? 1 : 0,
      }, authHeader());

      alert("Thêm người dùng thành công!");
      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        gender: "other",
        birthdate: "",
        bio: "",
        avatar_url: "",
        is_premium: false,
        is_verified: false,
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Thêm người dùng thất bại");
    }
  };

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Quản lý Người dùng</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow"
        >
          + Thêm Người dùng
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Đang tải danh sách người dùng...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead className="bg-gray-100 text-gray-700 text-sm font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Avatar</th>
                <th className="px-6 py-4 text-left">Tên</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Sở thích</th>
                <th className="px-6 py-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{u.id}</td>
                  <td className="px-6 py-4">
                    <img
                      src={u.avatar_url || "/default-avatar.png"}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {u.interests && u.interests.length > 0 ? (
                        u.interests.map((i, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {i}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs italic">Chưa có</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        disabled={loadingDetail}
                        className="px-4 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition disabled:opacity-50"
                      >
                        {loadingDetail ? "Đang tải..." : "Sửa"}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                      >
                        Xem
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== MODAL SỬA NGƯỜI DÙNG ==================== */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-screen overflow-y-auto p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Sửa thông tin: {selectedUser.name} (ID: {selectedUser.id})
            </h3>

            {loadingDetail ? (
              <div className="text-center py-10">Đang tải thông tin chi tiết...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                  <select
                    value={editForm.gender || "other"}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh (để trống nếu không có)</label>
                  <input
                    type="date"
                    value={editForm.birthdate || ""}
                    onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiểu sử (Bio)</label>
                  <textarea
                    value={editForm.bio || ""}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Người dùng Premium</label>
                  <input
                    type="checkbox"
                    checked={!!editForm.is_premium}
                    onChange={(e) => setEditForm({ ...editForm, is_premium: e.target.checked })}
                    className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Đã xác minh</label>
                  <input
                    type="checkbox"
                    checked={!!editForm.is_verified}
                    onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                    className="w-6 h-6 text-green-600 rounded focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-10">
              <button
                onClick={() => setSelectedUser(null)}
                disabled={loadingDetail}
                className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loadingDetail}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-50"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL THÊM NGƯỜI DÙNG MỚI (ĐẦY ĐỦ) ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Thêm Người dùng Mới</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                <select
                  value={newUser.gender}
                  onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                <input
                  type="date"
                  value={newUser.birthdate}
                  onChange={(e) => setNewUser({ ...newUser, birthdate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiểu sử (Bio)</label>
                <textarea
                  value={newUser.bio}
                  onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
                  rows="4"
                  placeholder="Giới thiệu về bản thân..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Avatar (tùy chọn)</label>
                <input
                  type="url"
                  value={newUser.avatar_url}
                  onChange={(e) => setNewUser({ ...newUser, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                />
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={newUser.is_premium}
                  onChange={(e) => setNewUser({ ...newUser, is_premium: e.target.checked })}
                  className="w-6 h-6 text-green-600 rounded focus:ring-green-500"
                />
                <label className="text-sm font-medium text-gray-700">Người dùng Premium</label>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={newUser.is_verified}
                  onChange={(e) => setNewUser({ ...newUser, is_verified: e.target.checked })}
                  className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">Đã xác minh email</label>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-10">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewUser({
                    name: "", email: "", password: "", gender: "other",
                    birthdate: "", bio: "", avatar_url: "", is_premium: false, is_verified: false
                  });
                }}
                className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleAddUser}
                className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow"
              >
                Thêm Người dùng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}