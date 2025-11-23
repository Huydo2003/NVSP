-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
<<<<<<< HEAD
-- Generation Time: Nov 23, 2025 at 04:16 PM
=======
-- Generation Time: Nov 23, 2025 at 08:19 AM
>>>>>>> 8839e623a717ba6ebae624338c638df3ccb2a12d
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nvsp`
--

-- --------------------------------------------------------

--
-- Table structure for table `ban_giam_khao`
--

CREATE TABLE `ban_giam_khao` (
  `id_hd` int(11) NOT NULL,
  `ma_giang_vien` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ban_giam_khao`
--

INSERT INTO `ban_giam_khao` (`id_hd`, `ma_giang_vien`) VALUES
(1, 'GV001'),
(1, 'GV0013'),
(2, 'GV0012'),
(3, 'GV0013'),
(3, 'GV007'),
(4, 'GV004'),
(4, 'GV006');

-- --------------------------------------------------------

--
-- Table structure for table `ban_to_chuc`
--

CREATE TABLE `ban_to_chuc` (
  `ma_giang_vien` varchar(50) NOT NULL,
  `bat_dau_nk` date NOT NULL,
  `ket_thuc_nk` date NOT NULL,
  `trang_thai` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ban_to_chuc`
--

INSERT INTO `ban_to_chuc` (`ma_giang_vien`, `bat_dau_nk`, `ket_thuc_nk`, `trang_thai`) VALUES
('GV001', '2024-09-01', '2026-09-01', 1),
('GV0012', '2025-11-22', '2025-11-30', 1),
('GV0013', '2025-11-15', '2025-11-29', 1),
('GV002', '2024-01-01', '2025-12-31', 1),
('GV003', '2023-01-01', '2024-12-31', 1),
('GV004', '2024-12-31', '2026-12-30', 0),
('GV005', '2023-09-01', '2025-09-01', 1);

-- --------------------------------------------------------

--
-- Table structure for table `bcn_khoa`
--

CREATE TABLE `bcn_khoa` (
  `ma_giang_vien` varchar(50) NOT NULL,
  `khoa` varchar(100) NOT NULL,
  `bat_dau_nk` date NOT NULL,
  `ket_thuc_nk` date NOT NULL,
  `trang_thai` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bcn_khoa`
--

INSERT INTO `bcn_khoa` (`ma_giang_vien`, `khoa`, `bat_dau_nk`, `ket_thuc_nk`, `trang_thai`) VALUES
('GV001', 'Khoa Toán Học', '2024-09-01', '2028-09-01', 1),
('GV002', 'Khoa Vật Lý', '2024-09-01', '2028-09-01', 1),
('GV003', 'Khoa Ngoại ngữ', '2023-09-01', '2027-09-01', 1),
('GV004', 'Khoa Toán Học', '2024-09-01', '2028-09-01', 1),
('GV005', 'Khoa Sinh học', '2023-09-01', '2027-09-01', 1),
('GV006', 'Khoa Sinh Học', '2025-11-14', '2025-11-21', 1);

-- --------------------------------------------------------

--
-- Table structure for table `can_bo_lop`
--

CREATE TABLE `can_bo_lop` (
  `ma_sinh_vien` varchar(50) NOT NULL,
  `bat_dau_nk` date NOT NULL,
  `ket_thuc_nk` date NOT NULL,
  `trang_thai` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `can_bo_lop`
--

INSERT INTO `can_bo_lop` (`ma_sinh_vien`, `bat_dau_nk`, `ket_thuc_nk`, `trang_thai`) VALUES
('SV10001', '2024-08-30', '2025-08-30', 1),
('SV10003', '2024-09-01', '2025-09-01', 1),
('SV10004', '2024-09-01', '2025-09-01', 1);

-- --------------------------------------------------------

--
-- Table structure for table `cham_diem`
--

CREATE TABLE `cham_diem` (
  `id` int(11) NOT NULL,
  `id_dang_ky` int(11) NOT NULL,
  `diem` decimal(2,2) NOT NULL,
  `nhan_xet` text NOT NULL,
  `ma_bgk` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chi_tiet_rubric`
--

CREATE TABLE `chi_tiet_rubric` (
  `id_rubric` int(11) NOT NULL,
  `tieu_chi` varchar(50) NOT NULL,
  `diem_toi_da` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chi_tiet_rubric`
--

INSERT INTO `chi_tiet_rubric` (`id_rubric`, `tieu_chi`, `diem_toi_da`) VALUES
(1, 'Kỹ năng giao tiếp', 3.00),
(1, 'Nội dung trình bày', 5.00),
(1, 'Trả lời câu hỏi', 2.00),
(2, 'Cấu trúc bài viết', 2.00),
(2, 'Ngữ pháp & từ vựng', 2.00),
(2, 'Phân tích & lập luận', 5.00),
(3, 'Chức năng hoạt động', 5.00),
(3, 'Giao diện người dùng', 3.00),
(3, 'Tính sáng tạo', 2.00),
(4, 'Hiệu quả kinh tế dự kiến', 3.00),
(4, 'Mức độ đổi mới sáng tạo', 3.00),
(4, 'Tính khả thi của ý tưởng', 4.00),
(5, 'Kết luận & đề xuất', 3.00),
(5, 'Phân tích dữ liệu', 3.00),
(5, 'Phương pháp nghiên cứu', 4.00),
(6, 'Chất lượng kết quả', 3.00),
(6, 'Tiến độ & hoàn thành dự án', 4.00),
(6, 'Đóng góp của từng thành viên', 3.00),
(7, 'Khả năng giao tiếp & truyền cảm hứng', 3.00),
(7, 'Khả năng lãnh đạo nhóm', 4.00),
(7, 'Kỹ năng ra quyết định', 3.00),
(9, 'Cách trình bày quan điểm', 3.00),
(9, 'Khả năng phản biện câu hỏi', 3.00),
(9, 'Lập luận logic', 4.00),
(10, 'Bố cục hồ sơ', 3.00),
(10, 'Nội dung & minh chứng', 5.00),
(10, 'Tính thẩm mỹ', 2.00),
(12, '1', 2.00),
(12, 'Ngữ pháp & từ vựng', 4.50);

-- --------------------------------------------------------

--
-- Table structure for table `dang_ky_thi`
--

CREATE TABLE `dang_ky_thi` (
  `id` int(11) NOT NULL,
  `id_hd` int(11) NOT NULL,
  `hinh_thuc` enum('Cá nhân','Nhóm') NOT NULL,
  `ma_sv` varchar(50) DEFAULT NULL,
  `ten_nhom` varchar(50) DEFAULT NULL,
  `ma_tham_gia` int(11) DEFAULT NULL,
  `trang_thai` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `diem_danh`
--

CREATE TABLE `diem_danh` (
  `id` int(11) NOT NULL,
  `thoi_gian` datetime NOT NULL,
  `ma_sv` varchar(50) NOT NULL,
  `id_hd` int(11) NOT NULL,
  `anh_minh_chung` longblob NOT NULL,
  `trang_thai` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `diem_ren_luyen`
--

CREATE TABLE `diem_ren_luyen` (
  `id` int(11) NOT NULL,
  `ma_sv` varchar(50) NOT NULL,
  `diem` int(11) NOT NULL,
  `xep_loai` varchar(15) NOT NULL,
  `ky_hoc` varchar(10) NOT NULL,
  `nam_hoc` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dki_tham_du`
--

CREATE TABLE `dki_tham_du` (
  `ma_sv` varchar(50) NOT NULL,
  `id_hd` int(11) NOT NULL,
  `trang_thai` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ds_rubric`
--

CREATE TABLE `ds_rubric` (
  `id_rubric` int(11) NOT NULL,
  `ten_rubric` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ds_rubric`
--

INSERT INTO `ds_rubric` (`id_rubric`, `ten_rubric`) VALUES
(1, 'Đánh giá thuyết trình'),
(2, 'Đánh giá bài viết học thuật'),
(3, 'Đánh giá sản phẩm phần mềm'),
(4, 'Đánh giá ý tưởng khởi nghiệp'),
(5, 'Đánh giá nghiên cứu khoa học'),
(6, 'Đánh giá dự án nhóm'),
(7, 'Đánh giá năng lực lãnh đạo'),
(9, 'Đánh giá kỹ năng phản biện'),
(10, 'Đánh giá hồ sơ portfolio'),
(12, 'Đánh giá bài thực hành lab1'),
(13, 'Đánh giá bài viết học thuật2');

-- --------------------------------------------------------

--
-- Table structure for table `giang_vien`
--

CREATE TABLE `giang_vien` (
  `ma_giang_vien` varchar(50) NOT NULL,
  `khoa` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `giang_vien`
--

INSERT INTO `giang_vien` (`ma_giang_vien`, `khoa`) VALUES
('GV001', 'Khoa Văn học'),
('GV0012', 'Khoa Thể dục'),
('GV0013', 'Khoa Lý'),
('GV002', 'Khoa Toán'),
('GV003', 'Khoa Ngoại ngữ'),
('GV004', 'Khoa Toán Hình'),
('GV005', 'Khoa Văn học'),
('GV006', 'Khoa Văn Học'),
('GV007', 'Khoa Sinh học');

-- --------------------------------------------------------

--
-- Table structure for table `hoat_dong`
--

CREATE TABLE `hoat_dong` (
  `id_hd` int(11) NOT NULL,
  `ten_hd` varchar(255) NOT NULL,
  `loai_hd` enum('Thi','Tọa đàm') NOT NULL,
  `tg_bat_dau` datetime NOT NULL,
  `tg_ket_thuc` datetime NOT NULL,
  `dia_diem` varchar(50) NOT NULL,
  `id_sk` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoat_dong`
--

INSERT INTO `hoat_dong` (`id_hd`, `ten_hd`, `loai_hd`, `tg_bat_dau`, `tg_ket_thuc`, `dia_diem`, `id_sk`) VALUES
(1, 'Lao động', 'Thi', '2025-11-22 03:00:00', '2025-11-21 17:00:00', 'Sân sau khu E', 23),
(2, 'Tiếp sức mùa Thi', 'Tọa đàm', '2025-11-26 22:37:00', '2025-11-28 10:36:00', 'THPT XYZ', 24),
(3, 'Hội khỏe phù đổng', 'Thi', '2025-11-15 21:53:00', '2025-11-21 21:53:00', 'Sân Thể Dục', 23),
(4, 'Cắm trại', 'Thi', '2025-12-01 21:59:00', '2025-12-06 22:00:00', 'Khuôn viên trường', 28),
(5, 'X', 'Thi', '2025-11-14 14:14:00', '2025-11-05 14:14:00', 'x', 28);

-- --------------------------------------------------------

--
-- Table structure for table `hoat_dong_ho_tro`
--

CREATE TABLE `hoat_dong_ho_tro` (
  `id_hd_ho_tro` int(11) NOT NULL,
  `ten_hd` varchar(255) NOT NULL,
  `loai_ho_tro` enum('Tập huấn','Phổ biến','Hướng dẫn hồ sơ') NOT NULL,
  `id_hd` int(11) NOT NULL,
  `ma_gv` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoat_dong_ho_tro`
--

INSERT INTO `hoat_dong_ho_tro` (`id_hd_ho_tro`, `ten_hd`, `loai_ho_tro`, `id_hd`, `ma_gv`) VALUES
(2, 'Nước', 'Tập huấn', 4, 'GV001');

-- --------------------------------------------------------

--
-- Table structure for table `hoat_dong_tham_du`
--

CREATE TABLE `hoat_dong_tham_du` (
  `id_hd_tham_du` int(11) NOT NULL,
  `ten_hd` varchar(255) NOT NULL,
  `id_hd` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoat_dong_tham_du`
--

INSERT INTO `hoat_dong_tham_du` (`id_hd_tham_du`, `ten_hd`, `id_hd`) VALUES
(1, 'XYZs', 2),
(2, '1s', 4);

-- --------------------------------------------------------

--
-- Table structure for table `hoat_dong_thi`
--

CREATE TABLE `hoat_dong_thi` (
  `id_hd` int(11) NOT NULL,
  `id_rubric` int(11) NOT NULL,
  `hinh_thuc` enum('Cá nhân','Nhóm') NOT NULL,
  `so_luong_tv` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoat_dong_thi`
--

INSERT INTO `hoat_dong_thi` (`id_hd`, `id_rubric`, `hinh_thuc`, `so_luong_tv`) VALUES
(1, 12, 'Nhóm', 2),
(2, 6, 'Nhóm', 8),
(3, 6, 'Nhóm', 6),
(4, 12, 'Nhóm', 7),
(5, 5, 'Cá nhân', 1);

-- --------------------------------------------------------

--
-- Table structure for table `ket_qua`
--

CREATE TABLE `ket_qua` (
  `id_dang_ky` int(11) NOT NULL,
  `giai_thuong` varchar(50) NOT NULL,
  `trang_thai` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `log_gcn`
--

CREATE TABLE `log_gcn` (
  `id_gcn` int(11) NOT NULL,
  `hanh_dong` text NOT NULL,
  `thoi_gian` datetime NOT NULL,
  `ma_btc` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sinh_vien`
--

CREATE TABLE `sinh_vien` (
  `ma_sinh_vien` varchar(50) NOT NULL,
  `nien_khoa` varchar(10) NOT NULL,
  `lop` varchar(10) NOT NULL,
  `nganh` varchar(100) NOT NULL,
  `khoa` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sinh_vien`
--

INSERT INTO `sinh_vien` (`ma_sinh_vien`, `nien_khoa`, `lop`, `nganh`, `khoa`) VALUES
('SV001', '2021', 'K61', 'Toán Học', 'Khoa Toán'),
('SV004', '2022', 'K62', 'Toán Học', 'Khoa Toán'),
('SV005', '2021', 'K61', 'Vật lý điện tử', 'Khoa Lý'),
('SV10001', 'K54', 'K54A', 'Sư phạm Văn', 'Khoa Văn Học'),
('SV10002', 'K54', 'K54A', 'Sư phạm Văn', 'Khoa Toán'),
('SV10003', 'K55', 'K55B', 'Sư phạm Anh', 'Khoa Ngoại ngữ'),
('SV10004', 'K55', 'K55C', 'Sư phạm Toán', 'Khoa Toán');

-- --------------------------------------------------------

--
-- Table structure for table `su_kien`
--

CREATE TABLE `su_kien` (
  `id_sk` int(11) NOT NULL,
  `ten_sk` varchar(255) NOT NULL,
  `nam_hoc` year(4) NOT NULL,
  `ma_btc` varchar(50) NOT NULL,
  `trang_thai` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `su_kien`
--

INSERT INTO `su_kien` (`id_sk`, `ten_sk`, `nam_hoc`, `ma_btc`, `trang_thai`) VALUES
(23, 'Hoạt động mùa hè', '2025', 'GV0013', 0),
(24, 'Tình nguyện mùa thi THPT', '2025', 'GV0013', 1),
(25, 'Tình nguyện mùa thi THPT', '2024', 'GV0013', 1),
(26, 'Tình nguyện mùa thi THPT', '2023', 'GV0013', 1),
(28, 'Hội Thao Xuân 2025', '2025', 'GV0013', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tai_khoan`
--

CREATE TABLE `tai_khoan` (
  `id` int(11) NOT NULL,
  `ma_ca_nhan` varchar(50) NOT NULL,
  `ho_ten` varchar(50) NOT NULL,
  `mat_khau` varchar(50) NOT NULL,
  `loai_tk` enum('Admin','Sinh viên','Giảng viên') NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tai_khoan`
--

INSERT INTO `tai_khoan` (`id`, `ma_ca_nhan`, `ho_ten`, `mat_khau`, `loai_tk`, `email`, `created_at`, `updated_at`) VALUES
(1, 'ADM001', 'Nguyễn Văn Admin nè', '96e79218965eb72c92a549dd5a330112', 'Admin', 'adminne@hnue.edu.vn', '2025-11-12 06:22:17', '2025-11-13 01:04:11'),
(2, 'GV001', 'Trần Thị Thu', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'thuttt@hnue.edu.vn', '2025-11-12 06:22:17', '2025-11-12 06:43:36'),
(3, 'GV002', 'Lê Hoàng Anh', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'anhlh@hnue.edu.vn', '2025-11-12 06:22:17', '2025-11-12 06:43:36'),
(4, 'GV003', 'Phạm Minh Tú', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'tupm@hnue.edu.vn', '2025-11-12 06:22:17', '2025-11-12 06:43:36'),
(5, 'GV004', 'Đặng Kim Ngân', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'nganABdk@hnue.edu.vn', '2025-11-12 06:22:17', '2025-11-12 09:22:49'),
(6, 'GV005', 'Huỳnh Quang Hải', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'haihq@hnue.edu.vn', '2025-11-12 06:22:17', '2025-11-12 06:43:36'),
(7, 'SV10001', 'Đỗ Thị Mai', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'maidt.k54@hnue.edu.vn', '2025-11-12 06:22:17', '2025-11-12 06:43:36'),
(8, 'SV10002', 'Hoàng Văn Nam', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'namhv.k54@hnue.edu.vn', '2025-11-12 06:22:17', '2025-11-12 06:43:36'),
(9, 'SV10003', 'Nguyễn Thị Lan', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'lannt.k55@hnue.edu.vn', '2025-11-12 06:22:17', '2025-11-12 06:43:36'),
(10, 'SV10004', 'Trần Anh Đức', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'ducta.k55@hnue.edu.vn', '2025-11-12 06:22:17', '2025-11-12 06:43:36'),
(23, 'SV10006', 'Nguyễn Văn B', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'nvb@hnue.edu.vn', '2025-11-12 17:28:55', '2025-11-12 17:28:55'),
(25, 'GV006', 'Lê Thị Thu Hoa', 'f951b7cfbe11e84ed53c134c10ac41f1', 'Giảng viên', 'lethithuhoa@hnue.edu.vn', '2025-11-12 18:02:31', '2025-11-12 19:44:31'),
(26, 'GV007', 'Trần Văn Cảnh', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'tvc@hnue.edu.vn', '2025-11-12 18:45:33', '2025-11-12 18:45:33'),
(43, 'SV005', 'Nguyễn Văn A', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'nguyenvana@hnue.edu.vn', '2025-11-13 02:11:09', '2025-11-13 02:11:09'),
(44, 'GV0012', 'Trần Thị B', 'df030274605ce6de120181c4410ea67b', 'Giảng viên', 'tranthib@hnue.edu.vn', '2025-11-13 02:11:09', '2025-11-15 03:49:44'),
(45, 'GV0013', 'Phạm Văn D', '6082b2fd4baf21f38e38fb4a12721f35', 'Giảng viên', 'phamvandnew@hnue.edu.vn', '2025-11-13 02:11:09', '2025-11-13 07:50:35'),
(46, 'SV001', 'Trùng Mã', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'dup@hnue.edu.vn', '2025-11-13 02:11:09', '2025-11-13 02:11:09'),
(47, 'ADMIN21', 'Quản Trị Viên', 'c4ca4238a0b923820dcc509a6f75849b', 'Admin', 'admin002@hnue.edu.vn', '2025-11-13 02:11:09', '2025-11-13 02:11:09'),
(48, 'SV004', 'Nguyễn Văn G', '4a9585c67cfded7ef30bf2281049dbce', 'Sinh viên', 'nvg@hnue.edu.vn', '2025-11-13 02:11:09', '2025-11-15 03:33:14');

-- --------------------------------------------------------

--
-- Table structure for table `thanh_vien_nhom`
--

CREATE TABLE `thanh_vien_nhom` (
  `ten_nhom` varchar(50) NOT NULL,
  `ma_sv` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `thong_tin_gcn`
--

CREATE TABLE `thong_tin_gcn` (
  `id` int(11) NOT NULL,
  `loai_chung_nhan` enum('Cá nhân','Nhóm') NOT NULL,
  `doi_tuong` int(11) NOT NULL,
  `noi_dung` text NOT NULL,
  `trang_thai` tinyint(1) NOT NULL,
  `ma_btc` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ban_giam_khao`
--
ALTER TABLE `ban_giam_khao`
  ADD PRIMARY KEY (`id_hd`,`ma_giang_vien`),
  ADD KEY `mã gv của bgk` (`ma_giang_vien`);

--
-- Indexes for table `ban_to_chuc`
--
ALTER TABLE `ban_to_chuc`
  ADD PRIMARY KEY (`ma_giang_vien`);

--
-- Indexes for table `bcn_khoa`
--
ALTER TABLE `bcn_khoa`
  ADD PRIMARY KEY (`ma_giang_vien`);

--
-- Indexes for table `can_bo_lop`
--
ALTER TABLE `can_bo_lop`
  ADD PRIMARY KEY (`ma_sinh_vien`);

--
-- Indexes for table `cham_diem`
--
ALTER TABLE `cham_diem`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chi_tiet_rubric`
--
ALTER TABLE `chi_tiet_rubric`
  ADD PRIMARY KEY (`id_rubric`,`tieu_chi`);

--
-- Indexes for table `dang_ky_thi`
--
ALTER TABLE `dang_ky_thi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ten_nhom` (`ten_nhom`),
  ADD KEY `id_hd` (`id_hd`),
  ADD KEY `ma_sv` (`ma_sv`);

--
-- Indexes for table `diem_danh`
--
ALTER TABLE `diem_danh`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ma_sv` (`ma_sv`),
  ADD KEY `id_hd` (`id_hd`);

--
-- Indexes for table `diem_ren_luyen`
--
ALTER TABLE `diem_ren_luyen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ma_sv` (`ma_sv`);

--
-- Indexes for table `dki_tham_du`
--
ALTER TABLE `dki_tham_du`
  ADD PRIMARY KEY (`ma_sv`,`id_hd`),
  ADD KEY `id_hd` (`id_hd`);

--
-- Indexes for table `ds_rubric`
--
ALTER TABLE `ds_rubric`
  ADD PRIMARY KEY (`id_rubric`);

--
-- Indexes for table `giang_vien`
--
ALTER TABLE `giang_vien`
  ADD PRIMARY KEY (`ma_giang_vien`);

--
-- Indexes for table `hoat_dong`
--
ALTER TABLE `hoat_dong`
  ADD PRIMARY KEY (`id_hd`),
  ADD KEY `id_sk` (`id_sk`);

--
-- Indexes for table `hoat_dong_ho_tro`
--
ALTER TABLE `hoat_dong_ho_tro`
  ADD PRIMARY KEY (`id_hd_ho_tro`),
  ADD KEY `ma_gv` (`ma_gv`);

--
-- Indexes for table `hoat_dong_tham_du`
--
ALTER TABLE `hoat_dong_tham_du`
  ADD PRIMARY KEY (`id_hd_tham_du`),
  ADD KEY `id_hd` (`id_hd`);

--
-- Indexes for table `hoat_dong_thi`
--
ALTER TABLE `hoat_dong_thi`
  ADD PRIMARY KEY (`id_hd`),
  ADD KEY `id_rubric` (`id_rubric`);

--
-- Indexes for table `ket_qua`
--
ALTER TABLE `ket_qua`
  ADD PRIMARY KEY (`id_dang_ky`);

--
-- Indexes for table `log_gcn`
--
ALTER TABLE `log_gcn`
  ADD KEY `id_gcn` (`id_gcn`);

--
-- Indexes for table `sinh_vien`
--
ALTER TABLE `sinh_vien`
  ADD PRIMARY KEY (`ma_sinh_vien`);

--
-- Indexes for table `su_kien`
--
ALTER TABLE `su_kien`
  ADD PRIMARY KEY (`id_sk`);

--
-- Indexes for table `tai_khoan`
--
ALTER TABLE `tai_khoan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role` (`ma_ca_nhan`);

--
-- Indexes for table `thanh_vien_nhom`
--
ALTER TABLE `thanh_vien_nhom`
  ADD PRIMARY KEY (`ten_nhom`,`ma_sv`),
  ADD KEY `ma_sv` (`ma_sv`);

--
-- Indexes for table `thong_tin_gcn`
--
ALTER TABLE `thong_tin_gcn`
  ADD PRIMARY KEY (`id`),
  ADD KEY `doi_tuong` (`doi_tuong`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cham_diem`
--
ALTER TABLE `cham_diem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dang_ky_thi`
--
ALTER TABLE `dang_ky_thi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `diem_danh`
--
ALTER TABLE `diem_danh`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `diem_ren_luyen`
--
ALTER TABLE `diem_ren_luyen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ds_rubric`
--
ALTER TABLE `ds_rubric`
  MODIFY `id_rubric` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `hoat_dong`
--
ALTER TABLE `hoat_dong`
  MODIFY `id_hd` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hoat_dong_ho_tro`
--
ALTER TABLE `hoat_dong_ho_tro`
  MODIFY `id_hd_ho_tro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hoat_dong_tham_du`
--
ALTER TABLE `hoat_dong_tham_du`
  MODIFY `id_hd_tham_du` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `su_kien`
--
ALTER TABLE `su_kien`
  MODIFY `id_sk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `tai_khoan`
--
ALTER TABLE `tai_khoan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `thong_tin_gcn`
--
ALTER TABLE `thong_tin_gcn`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ban_giam_khao`
--
ALTER TABLE `ban_giam_khao`
  ADD CONSTRAINT `hoạt động thi nào` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong_thi` (`id_hd`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mã gv của bgk` FOREIGN KEY (`ma_giang_vien`) REFERENCES `giang_vien` (`ma_giang_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ban_to_chuc`
--
ALTER TABLE `ban_to_chuc`
  ADD CONSTRAINT `ban_to_chuc_ibfk_1` FOREIGN KEY (`ma_giang_vien`) REFERENCES `giang_vien` (`ma_giang_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bcn_khoa`
--
ALTER TABLE `bcn_khoa`
  ADD CONSTRAINT `bcn_khoa_ibfk_1` FOREIGN KEY (`ma_giang_vien`) REFERENCES `giang_vien` (`ma_giang_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `can_bo_lop`
--
ALTER TABLE `can_bo_lop`
  ADD CONSTRAINT `can_bo_lop_ibfk_1` FOREIGN KEY (`ma_sinh_vien`) REFERENCES `sinh_vien` (`ma_sinh_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chi_tiet_rubric`
--
ALTER TABLE `chi_tiet_rubric`
  ADD CONSTRAINT `chi_tiet_rubric_ibfk_1` FOREIGN KEY (`id_rubric`) REFERENCES `ds_rubric` (`id_rubric`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `dang_ky_thi`
--
ALTER TABLE `dang_ky_thi`
  ADD CONSTRAINT `dang_ky_thi_ibfk_1` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong_thi` (`id_hd`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `dang_ky_thi_ibfk_2` FOREIGN KEY (`ma_sv`) REFERENCES `sinh_vien` (`ma_sinh_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `diem_danh`
--
ALTER TABLE `diem_danh`
  ADD CONSTRAINT `diem_danh_ibfk_1` FOREIGN KEY (`ma_sv`) REFERENCES `sinh_vien` (`ma_sinh_vien`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `diem_danh_ibfk_2` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong_tham_du` (`id_hd_tham_du`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `diem_ren_luyen`
--
ALTER TABLE `diem_ren_luyen`
  ADD CONSTRAINT `diem_ren_luyen_ibfk_1` FOREIGN KEY (`ma_sv`) REFERENCES `sinh_vien` (`ma_sinh_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `dki_tham_du`
--
ALTER TABLE `dki_tham_du`
  ADD CONSTRAINT `dki_tham_du_ibfk_1` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong_tham_du` (`id_hd_tham_du`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `dki_tham_du_ibfk_2` FOREIGN KEY (`ma_sv`) REFERENCES `sinh_vien` (`ma_sinh_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `giang_vien`
--
ALTER TABLE `giang_vien`
  ADD CONSTRAINT `giang_vien_ibfk_1` FOREIGN KEY (`ma_giang_vien`) REFERENCES `tai_khoan` (`ma_ca_nhan`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hoat_dong`
--
ALTER TABLE `hoat_dong`
  ADD CONSTRAINT `hoat_dong_ibfk_1` FOREIGN KEY (`id_sk`) REFERENCES `su_kien` (`id_sk`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hoat_dong_ho_tro`
--
ALTER TABLE `hoat_dong_ho_tro`
  ADD CONSTRAINT `hoat_dong_ho_tro_ibfk_1` FOREIGN KEY (`ma_gv`) REFERENCES `giang_vien` (`ma_giang_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hoat_dong_tham_du`
--
ALTER TABLE `hoat_dong_tham_du`
  ADD CONSTRAINT `hoat_dong_tham_du_ibfk_1` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong` (`id_hd`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hoat_dong_thi`
--
ALTER TABLE `hoat_dong_thi`
  ADD CONSTRAINT `hoat_dong_thi_ibfk_1` FOREIGN KEY (`id_rubric`) REFERENCES `ds_rubric` (`id_rubric`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hoat_dong_thi_ibfk_2` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong` (`id_hd`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ket_qua`
--
ALTER TABLE `ket_qua`
  ADD CONSTRAINT `ket_qua_ibfk_1` FOREIGN KEY (`id_dang_ky`) REFERENCES `dang_ky_thi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `log_gcn`
--
ALTER TABLE `log_gcn`
  ADD CONSTRAINT `log_gcn_ibfk_1` FOREIGN KEY (`id_gcn`) REFERENCES `thong_tin_gcn` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sinh_vien`
--
ALTER TABLE `sinh_vien`
  ADD CONSTRAINT `mã sinh viên` FOREIGN KEY (`ma_sinh_vien`) REFERENCES `tai_khoan` (`ma_ca_nhan`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `thanh_vien_nhom`
--
ALTER TABLE `thanh_vien_nhom`
  ADD CONSTRAINT `thanh_vien_nhom_ibfk_1` FOREIGN KEY (`ten_nhom`) REFERENCES `dang_ky_thi` (`ten_nhom`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thanh_vien_nhom_ibfk_2` FOREIGN KEY (`ma_sv`) REFERENCES `sinh_vien` (`ma_sinh_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `thong_tin_gcn`
--
ALTER TABLE `thong_tin_gcn`
  ADD CONSTRAINT `thong_tin_gcn_ibfk_1` FOREIGN KEY (`doi_tuong`) REFERENCES `ket_qua` (`id_dang_ky`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
