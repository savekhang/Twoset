import React from "react";
import { FaHeart, FaBolt, FaShieldAlt } from "react-icons/fa";

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900">

      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-pink-600">Twoset</h1>
        <nav className="hidden sm:flex gap-6 text-gray-700 font-medium">
          <a href="#features" className="hover:text-pink-600">Tính năng</a>
          <a href="#download" className="hover:text-pink-600">Tải App</a>
          <a href="#contact" className="hover:text-pink-600">Liên hệ</a>
        </nav>
      </header>

      {/* Hero section */}
      <section className="px-8 py-20 text-center bg-pink-50" id="hero">
        <h2 className="text-4xl sm:text-6xl font-bold mb-6 text-pink-600">
          Ứng dụng hẹn hò Twoset
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Kết nối nhanh chóng – tìm được người phù hợp chỉ với một lần vuốt.
          Trải nghiệm hẹn hò mới dành cho giới trẻ Việt Nam.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button className="px-6 py-3 bg-pink-600 text-white rounded-xl shadow hover:bg-pink-700">
            Tải về cho Android
          </button>
          <button className="px-6 py-3 bg-gray-900 text-white rounded-xl shadow hover:bg-gray-700">
            Tải về cho iOS
          </button>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="px-8 py-20">
        <h3 className="text-3xl font-extrabold text-center mb-12">
          Tính năng nổi bật
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-5xl mx-auto">

          <div className="p-6 bg-white shadow rounded-2xl text-center">
            <FaHeart className="text-pink-500 text-4xl mx-auto mb-4" />
            <h4 className="font-bold text-xl mb-2">Ghép đôi thông minh</h4>
            <p className="text-gray-600">
              Thuật toán đề xuất người phù hợp dựa trên sở thích và vị trí.
            </p>
          </div>

          <div className="p-6 bg-white shadow rounded-2xl text-center">
            <FaBolt className="text-yellow-500 text-4xl mx-auto mb-4" />
            <h4 className="font-bold text-xl mb-2">Super Like</h4>
            <p className="text-gray-600">
              Tăng 90% cơ hội match với người bạn thích. Không giới hạn với Premium.
            </p>
          </div>

          <div className="p-6 bg-white shadow rounded-2xl text-center">
            <FaShieldAlt className="text-blue-500 text-4xl mx-auto mb-4" />
            <h4 className="font-bold text-xl mb-2">Bảo mật cao</h4>
            <p className="text-gray-600">
              Tất cả dữ liệu người dùng đều được mã hoá và bảo vệ an toàn.
            </p>
          </div>

        </div>
      </section>

      {/* Screenshot / UI */}
      <section className="px-8 py-20 bg-gray-50">
        <h3 className="text-3xl font-extrabold text-center mb-12">
          Giao diện trực quan, dễ sử dụng
        </h3>

        <div className="flex justify-center">
          <img
            src="https://dummyimage.com/600x400/ddd/000&text=App+Screenshot"
            alt="App Preview"
            className="rounded-2xl shadow-lg w-full sm:w-2/3"
          />
        </div>
      </section>

      {/* Call to Action */}
      <section id="download" className="px-8 py-20 text-center">
        <h3 className="text-3xl sm:text-4xl font-bold mb-6">
          Sẵn sàng tìm một nửa của bạn?
        </h3>

        <button className="px-8 py-4 bg-pink-600 text-white text-lg rounded-xl shadow hover:bg-pink-700">
          Tải ngay
        </button>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 text-center text-gray-500 border-t">
        © {new Date().getFullYear()} Twoset. All rights reserved.
      </footer>

    </div>
  );
}
