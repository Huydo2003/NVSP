-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2025 at 04:19 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
  `id_hd` int(11) NOT NULL COMMENT 'ID hoạt động thi, FK to hoat_dong_thi(id_hd)',
  `ma_gv` varchar(50) NOT NULL COMMENT 'FK to giang_vien(ma_giang_vien)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ban_to_chuc`
--

CREATE TABLE `ban_to_chuc` (
  `ma_giang_vien` varchar(50) NOT NULL COMMENT 'PK, FK to giang_vien(ma_giang_vien)',
  `bat_dau_nk` date NOT NULL COMMENT 'Thời gian bắt đầu nhiệm kì',
  `ket_thuc_nk` date DEFAULT NULL COMMENT 'Thời gian kết thúc nhiệm kì',
  `trang_thai` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái đương nhiệm (TRUE) hoặc tiền nhiệm (FALSE)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ban_to_chuc`
--

INSERT INTO `ban_to_chuc` (`ma_giang_vien`, `bat_dau_nk`, `ket_thuc_nk`, `trang_thai`) VALUES
('GV001', '2024-09-01', '2026-09-01', 1),
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
  `ma_giang_vien` varchar(50) NOT NULL COMMENT 'PK, FK to giang_vien(ma_giang_vien)',
  `khoa` varchar(255) NOT NULL,
  `bat_dau_nk` date NOT NULL COMMENT 'Thời gian bắt đầu nhiệm kì',
  `ket_thuc_nk` date DEFAULT NULL COMMENT 'Thời gian kết thúc nhiệm kì',
  `trang_thai` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái đương nhiệm (TRUE) hoặc tiền nhiệm (FALSE)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bcn_khoa`
--

INSERT INTO `bcn_khoa` (`ma_giang_vien`, `khoa`, `bat_dau_nk`, `ket_thuc_nk`, `trang_thai`) VALUES
('GV001', 'Khoa Sư phạm', '2024-09-01', '2028-09-01', 1),
('GV002', 'Khoa Tâm lý', '2024-09-01', '2028-09-01', 1),
('GV003', 'Khoa Ngoại ngữ', '2023-09-01', '2027-09-01', 1),
('GV004', 'Khoa Toán', '2024-09-01', '2028-09-01', 1),
('GV005', 'Khoa Sinh học', '2023-09-01', '2027-09-01', 1),
('GV006', 'Khoa mới', '2025-11-14', '2025-11-21', 1);

-- --------------------------------------------------------

--
-- Table structure for table `can_bo_lop`
--

CREATE TABLE `can_bo_lop` (
  `ma_sinh_vien` varchar(50) NOT NULL COMMENT 'PK, FK to sinh_vien(ma_sinh_vien)',
  `bat_dau_nk` date NOT NULL COMMENT 'Thời gian bắt đầu nhiệm kì',
  `ket_thuc_nk` date DEFAULT NULL COMMENT 'Thời gian kết thúc nhiệm kì',
  `trang_thai` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái đương nhiệm (TRUE) hoặc tiền nhiệm (FALSE)'
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
  `id_hd_thi` int(11) NOT NULL COMMENT 'FK to hoat_dong_thi(id_hd)',
  `loai_bai_thi` enum('Cá nhân','Nhóm') NOT NULL COMMENT 'Loại bài thi: Cá nhân/Nhóm',
  `id_dang_ky` int(11) NOT NULL COMMENT 'Liên kết tới dang_ky_ca_nhan(id) hoặc dang_ky_nhom(id_nhom)',
  `diem` decimal(4,2) DEFAULT NULL COMMENT 'Điểm tổng sau khi tính theo rubric',
  `nhan_xet` text DEFAULT NULL,
  `ma_bgk` varchar(50) NOT NULL COMMENT 'Mã BGK chấm điểm'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chi_tiet_rubric`
--

CREATE TABLE `chi_tiet_rubric` (
  `id_rubric` int(11) NOT NULL COMMENT 'FK to ds_rubrics(id_rubric)',
  `tieu_chi` varchar(50) NOT NULL COMMENT 'Tên tiêu chí',
  `diem_toi_da` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chi_tiet_rubric`
--

INSERT INTO `chi_tiet_rubric` (`id_rubric`, `tieu_chi`, `diem_toi_da`) VALUES
(1, 'Kỹ năng giao tiếp', 3),
(1, 'Nội dung trình bày', 5),
(1, 'Trả lời câu hỏi', 2),
(2, 'Cấu trúc bài viết', 2),
(2, 'Ngữ pháp & từ vựng', 2),
(2, 'Phân tích & lập luận', 5),
(3, 'Chức năng hoạt động', 5),
(3, 'Giao diện người dùng', 3),
(3, 'Tính sáng tạo', 2),
(4, 'Hiệu quả kinh tế dự kiến', 3),
(4, 'Mức độ đổi mới sáng tạo', 3),
(4, 'Tính khả thi của ý tưởng', 4),
(5, 'Kết luận & đề xuất', 3),
(5, 'Phân tích dữ liệu', 3),
(5, 'Phương pháp nghiên cứu', 4),
(6, 'Chất lượng kết quả', 3),
(6, 'Tiến độ & hoàn thành dự án', 4),
(6, 'Đóng góp của từng thành viên', 3),
(7, 'Khả năng giao tiếp & truyền cảm hứng', 3),
(7, 'Khả năng lãnh đạo nhóm', 4),
(7, 'Kỹ năng ra quyết định', 3),
(9, 'Cách trình bày quan điểm', 3),
(9, 'Khả năng phản biện câu hỏi', 3),
(9, 'Lập luận logic', 4),
(10, 'Bố cục hồ sơ', 3),
(10, 'Nội dung & minh chứng', 5),
(10, 'Tính thẩm mỹ', 2),
(12, 'Ngữ pháp & từ vựng', 5);

-- --------------------------------------------------------

--
-- Table structure for table `dang_ky_ca_nhan`
--

CREATE TABLE `dang_ky_ca_nhan` (
  `id` int(11) NOT NULL,
  `id_hd` int(11) NOT NULL COMMENT 'ID của hoạt động thi, FK to hoat_dong_thi(id_hd)',
  `ma_sv` varchar(50) NOT NULL COMMENT 'FK to sinh_vien(ma_sinh_vien)',
  `trang_thai` tinyint(4) DEFAULT 0 COMMENT '1 = Đã duyệt, 0 = Chưa duyệt, -1 = Từ chối'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dang_ky_nhom`
--

CREATE TABLE `dang_ky_nhom` (
  `id_nhom` int(11) NOT NULL,
  `ten_nhom` varchar(255) NOT NULL,
  `ma_tham_gia` int(11) NOT NULL COMMENT 'Mã được sinh tự động khi tạo nhóm',
  `id_hd` int(11) NOT NULL COMMENT 'ID của hoạt động thi, FK to hoat_dong_thi(id_hd)',
  `trang_thai` tinyint(4) DEFAULT 0 COMMENT '1 = Đã duyệt, 0 = Chưa duyệt, -1 = Từ chối'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dang_ky_tham_du`
--

CREATE TABLE `dang_ky_tham_du` (
  `ma_sv` varchar(50) NOT NULL COMMENT 'FK to sinh_vien(ma_sinh_vien)',
  `id_hd` int(11) NOT NULL COMMENT 'ID hoạt động tham dự, FK to hoat_dong_tham_du(id_hd_tham_du)',
  `trang_thai` tinyint(4) DEFAULT 0 COMMENT '1 = Đã duyệt, 0 = Chưa duyệt, -1 = Từ chối'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `diem_danh`
--

CREATE TABLE `diem_danh` (
  `id` int(11) NOT NULL,
  `ma_sv` varchar(50) NOT NULL COMMENT 'Sinh viên điểm danh, FK to sinh_vien(ma_sinh_vien)',
  `id_hd` int(11) NOT NULL COMMENT 'Hoạt động tham dự/cổ vũ, FK to hoat_dong_tham_du(id_hd_tham_du)',
  `anh_minh_chung` longblob DEFAULT NULL COMMENT 'Ảnh minh chứng điểm danh',
  `thoi_gian` datetime DEFAULT current_timestamp() COMMENT 'Thời gian mà sinh viên điểm danh',
  `trang_thai` tinyint(4) DEFAULT 0 COMMENT '1 = Đã duyệt, 0 = Chưa duyệt, -1 = Từ chối'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `diem_ren_luyen`
--

CREATE TABLE `diem_ren_luyen` (
  `id` int(11) NOT NULL,
  `ma_sv` varchar(50) NOT NULL COMMENT 'FK to sinh_vien(ma_sinh_vien)',
  `diem` int(11) NOT NULL,
  `xep_loai` varchar(20) DEFAULT NULL,
  `ky_hoc` varchar(10) NOT NULL,
  `nam_hoc` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ds_rubrics`
--

CREATE TABLE `ds_rubrics` (
  `id_rubric` int(11) NOT NULL,
  `ten_rubric` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ds_rubrics`
--

INSERT INTO `ds_rubrics` (`id_rubric`, `ten_rubric`) VALUES
(12, 'Đánh giá bài thực hành lab1'),
(2, 'Đánh giá bài viết học thuật'),
(6, 'Đánh giá dự án nhóm'),
(10, 'Đánh giá hồ sơ portfolio'),
(9, 'Đánh giá kỹ năng phản biện'),
(7, 'Đánh giá năng lực lãnh đạo'),
(5, 'Đánh giá nghiên cứu khoa học'),
(3, 'Đánh giá sản phẩm phần mềm'),
(1, 'Đánh giá thuyết trình'),
(4, 'Đánh giá ý tưởng khởi nghiệp');

-- --------------------------------------------------------

--
-- Table structure for table `giang_vien`
--

CREATE TABLE `giang_vien` (
  `ma_giang_vien` varchar(50) NOT NULL COMMENT 'PK, FK to tai_khoan(ma_ca_nhan)',
  `khoa` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `giang_vien`
--

INSERT INTO `giang_vien` (`ma_giang_vien`, `khoa`) VALUES
('GV001', 'Khoa Sư phạm'),
('GV0012', 'Khoa Y'),
('GV0013', 'Khoa Xây dựng'),
('GV002', 'Khoa Tâm lý'),
('GV003', 'Khoa Ngoại ngữ'),
('GV004', 'Khoa Toán Hình'),
('GV005', 'Khoa Sinh học'),
('GV006', 'Khoa Văn Học'),
('GV007', 'Khoa Sinh học');

-- --------------------------------------------------------

--
-- Table structure for table `hoat_dong_ho_tro`
--

CREATE TABLE `hoat_dong_ho_tro` (
  `id_hd_ho_tro` int(11) NOT NULL,
  `ten_hd` varchar(255) NOT NULL,
  `loai_ho_tro` enum('Tập huấn','Phổ biến','Hướng dẫn hồ sơ') NOT NULL COMMENT 'Loại hđ hỗ trợ',
  `tg_bat_dau` date NOT NULL,
  `tg_ket_thuc` date NOT NULL,
  `dia_diem` varchar(50) DEFAULT NULL,
  `id_hd` int(11) NOT NULL COMMENT 'Hoạt động thi cần hỗ trợ, FK to hoat_dong_thi(id_hd)',
  `ma_gv` varchar(50) NOT NULL COMMENT 'Giảng viên phụ trách hoạt động hỗ trợ, FK to giang_vien(ma_giang_vien)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hoat_dong_tham_du`
--

CREATE TABLE `hoat_dong_tham_du` (
  `id_hd_tham_du` int(11) NOT NULL,
  `ten_hd` varchar(255) NOT NULL,
  `id_hd` int(11) DEFAULT NULL COMMENT 'ID hoạt động thi sẽ tham gia cổ vũ, FK to hoat_dong_thi(id_hd)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hoat_dong_thi`
--

CREATE TABLE `hoat_dong_thi` (
  `id_hd` int(11) NOT NULL,
  `ten_hd` varchar(255) NOT NULL,
  `id_rubric` int(11) DEFAULT NULL COMMENT 'FK to ds_rubrics(id_rubric)',
  `hinh_thuc` enum('Cá nhân','Nhóm') NOT NULL COMMENT 'Hình thức: Cá nhân/Nhóm',
  `tg_bat_dau` date NOT NULL,
  `tg_ket_thuc` date NOT NULL,
  `dia_diem` varchar(50) DEFAULT NULL,
  `id_sk` int(11) NOT NULL COMMENT 'FK to su_kien(id_sk)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ket_qua`
--

CREATE TABLE `ket_qua` (
  `id` int(11) NOT NULL,
  `id_cham_diem` int(11) NOT NULL COMMENT 'FK to cham_diem(id)',
  `giai_thuong` varchar(50) NOT NULL,
  `trang_thai` tinyint(4) DEFAULT 0 COMMENT '1 = Đã duyệt, 0 = Chưa duyệt, -1 = Từ chối'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `log_gcn`
--

CREATE TABLE `log_gcn` (
  `id` int(11) NOT NULL,
  `id_gcn` int(11) NOT NULL COMMENT 'FK to thong_tin_gcn(id)',
  `hanh_dong` text NOT NULL COMMENT 'Lưu lại hành động: "Phát hành" hay "Thu hồi"',
  `thoi_gian` datetime DEFAULT current_timestamp(),
  `ma_btc` varchar(50) NOT NULL COMMENT 'Mã BTC thực hiện'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `log_tra_cuu`
--

CREATE TABLE `log_tra_cuu` (
  `id` int(11) NOT NULL,
  `id_gcn` int(11) NOT NULL COMMENT 'FK to thong_tin_gcn(id)',
  `tg_tra_cuu` datetime DEFAULT current_timestamp() COMMENT 'Thời gian người dùng tra cứu'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sinh_vien`
--

CREATE TABLE `sinh_vien` (
  `ma_sinh_vien` varchar(50) NOT NULL COMMENT 'PK, FK to tai_khoan(ma_ca_nhan)',
  `nien_khoa` varchar(10) DEFAULT NULL COMMENT 'Niên khóa',
  `lop` varchar(10) DEFAULT NULL,
  `nganh` varchar(255) NOT NULL COMMENT 'Ngành học',
  `khoa` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sinh_vien`
--

INSERT INTO `sinh_vien` (`ma_sinh_vien`, `nien_khoa`, `lop`, `nganh`, `khoa`) VALUES
('SV001', '2021', 'K61', 'CNTT', 'CNTT'),
('SV004', '2022', 'K62', 'Math', 'Math'),
('SV005', '2021', 'K61', 'CNTT', 'CNTT'),
('SV10001', 'K54', 'K54A', 'Sư phạm Văn', 'Khoa Sư phạm'),
('SV10002', 'K54', 'K54A', 'Sư phạm Văn', 'Khoa Sư phạm'),
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
  `ma_btc` varchar(50) NOT NULL COMMENT 'Mã của BTC tạo sự kiện',
  `trang_thai` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'TRUE = Mở đăng ký, FALSE = Đóng đăng ký'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tai_khoan`
--

CREATE TABLE `tai_khoan` (
  `id` int(11) NOT NULL,
  `ma_ca_nhan` varchar(50) NOT NULL COMMENT 'Mã sinh viên/giảng viên/admin. Dùng để đăng nhập và liên kết tới bảng sinh_vien, giang_vien',
  `ho_ten` varchar(50) NOT NULL,
  `mat_khau` varchar(255) NOT NULL COMMENT 'Mật khẩu mã hóa',
  `loai_tk` enum('Sinh viên','Giảng viên','Admin') NOT NULL COMMENT 'Loại tài khoản: Sinh viên, Giảng viên, Admin',
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tai_khoan`
--

INSERT INTO `tai_khoan` (`id`, `ma_ca_nhan`, `ho_ten`, `mat_khau`, `loai_tk`, `email`, `created_at`, `updated_at`) VALUES
(1, 'ADM001', 'Nguyễn Văn Admin nè', '96e79218965eb72c92a549dd5a330112', 'Admin', 'adminne@hnue.edu.vn', '2025-11-12 13:22:17', '2025-11-13 08:04:11'),
(2, 'GV001', 'Trần Thị Thu', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'thuttt@hnue.edu.vn', '2025-11-12 13:22:17', '2025-11-12 13:43:36'),
(3, 'GV002', 'Lê Hoàng Anh', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'anhlh@hnue.edu.vn', '2025-11-12 13:22:17', '2025-11-12 13:43:36'),
(4, 'GV003', 'Phạm Minh Tú', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'tupm@hnue.edu.vn', '2025-11-12 13:22:17', '2025-11-12 13:43:36'),
(5, 'GV004', 'Đặng Kim Ngân', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'nganABdk@hnue.edu.vn', '2025-11-12 13:22:17', '2025-11-12 16:22:49'),
(6, 'GV005', 'Huỳnh Quang Hải', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'haihq@hnue.edu.vn', '2025-11-12 13:22:17', '2025-11-12 13:43:36'),
(7, 'SV10001', 'Đỗ Thị Mai', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'maidt.k54@hnue.edu.vn', '2025-11-12 13:22:17', '2025-11-12 13:43:36'),
(8, 'SV10002', 'Hoàng Văn Nam', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'namhv.k54@hnue.edu.vn', '2025-11-12 13:22:17', '2025-11-12 13:43:36'),
(9, 'SV10003', 'Nguyễn Thị Lan', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'lannt.k55@hnue.edu.vn', '2025-11-12 13:22:17', '2025-11-12 13:43:36'),
(10, 'SV10004', 'Trần Anh Đức', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'ducta.k55@hnue.edu.vn', '2025-11-12 13:22:17', '2025-11-12 13:43:36'),
(23, 'SV10006', 'Nguyễn Văn B', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'nvb@hnue.edu.vn', '2025-11-13 00:28:55', '2025-11-13 00:28:55'),
(25, 'GV006', 'Lê Thị Thu Hoa', 'f951b7cfbe11e84ed53c134c10ac41f1', 'Giảng viên', 'lethithuhoa@hnue.edu.vn', '2025-11-13 01:02:31', '2025-11-13 02:44:31'),
(26, 'GV007', 'Trần Văn Cảnh', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'tvc@hnue.edu.vn', '2025-11-13 01:45:33', '2025-11-13 01:45:33'),
(43, 'SV005', 'Nguyễn Văn A', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'nguyenvana@hnue.edu.vn', '2025-11-13 09:11:09', '2025-11-13 09:11:09'),
(44, 'GV0012', 'Trần Thị B', 'c4ca4238a0b923820dcc509a6f75849b', 'Giảng viên', 'tranthib@hnue.edu.vn', '2025-11-13 09:11:09', '2025-11-13 09:11:09'),
(45, 'GV0013', 'Phạm Văn D', '6082b2fd4baf21f38e38fb4a12721f35', 'Giảng viên', 'phamvandnew@hnue.edu.vn', '2025-11-13 09:11:09', '2025-11-13 14:50:35'),
(46, 'SV001', 'Trùng Mã', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'dup@hnue.edu.vn', '2025-11-13 09:11:09', '2025-11-13 09:11:09'),
(47, 'ADMIN21', 'Quản Trị Viên', 'c4ca4238a0b923820dcc509a6f75849b', 'Admin', 'admin002@hnue.edu.vn', '2025-11-13 09:11:09', '2025-11-13 09:11:09'),
(48, 'SV004', 'Nguyễn Văn G', 'c4ca4238a0b923820dcc509a6f75849b', 'Sinh viên', 'nvg@hnue.edu.vn', '2025-11-13 09:11:09', '2025-11-13 09:11:09');

-- --------------------------------------------------------

--
-- Table structure for table `thanh_vien_nhom`
--

CREATE TABLE `thanh_vien_nhom` (
  `id_nhom` int(11) NOT NULL COMMENT 'FK to dang_ky_nhom(id_nhom)',
  `ma_sv` varchar(50) NOT NULL COMMENT 'FK to sinh_vien(ma_sinh_vien)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `thong_tin_gcn`
--

CREATE TABLE `thong_tin_gcn` (
  `id` int(11) NOT NULL,
  `loai_chung_nhan` enum('Cá nhân','Nhóm','CBL') NOT NULL COMMENT 'Loại chứng nhận: Cá nhân/Nhóm/CBL',
  `doi_tuong` varchar(255) NOT NULL COMMENT 'Tên sinh viên/tên nhóm/CBL',
  `giai_thuong` varchar(50) DEFAULT NULL COMMENT 'Giải thưởng (nếu có)',
  `id_hd` int(11) NOT NULL COMMENT 'Hoạt động thi/HĐ Tham dự, FK to hoat_dong_thi(id_hd) hoặc hoat_dong_tham_du(id_hd_tham_du)',
  `trang_thai` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'TRUE = Hợp lệ, FALSE = Thu hồi',
  `ma_btc` varchar(50) NOT NULL COMMENT 'Mã BTC phát hành'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ban_giam_khao`
--
ALTER TABLE `ban_giam_khao`
  ADD PRIMARY KEY (`id_hd`,`ma_gv`),
  ADD KEY `ma_gv` (`ma_gv`);

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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_bai_thi_bgk` (`id_hd_thi`,`id_dang_ky`,`ma_bgk`),
  ADD KEY `ma_bgk` (`ma_bgk`);

--
-- Indexes for table `chi_tiet_rubric`
--
ALTER TABLE `chi_tiet_rubric`
  ADD PRIMARY KEY (`id_rubric`,`tieu_chi`);

--
-- Indexes for table `dang_ky_ca_nhan`
--
ALTER TABLE `dang_ky_ca_nhan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_sv_hd` (`ma_sv`,`id_hd`),
  ADD KEY `id_hd` (`id_hd`);

--
-- Indexes for table `dang_ky_nhom`
--
ALTER TABLE `dang_ky_nhom`
  ADD PRIMARY KEY (`id_nhom`),
  ADD UNIQUE KEY `ma_tham_gia` (`ma_tham_gia`),
  ADD KEY `id_hd` (`id_hd`);

--
-- Indexes for table `dang_ky_tham_du`
--
ALTER TABLE `dang_ky_tham_du`
  ADD PRIMARY KEY (`ma_sv`,`id_hd`),
  ADD KEY `id_hd` (`id_hd`);

--
-- Indexes for table `diem_danh`
--
ALTER TABLE `diem_danh`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_sv_hd_diem_danh` (`ma_sv`,`id_hd`),
  ADD KEY `id_hd` (`id_hd`);

--
-- Indexes for table `diem_ren_luyen`
--
ALTER TABLE `diem_ren_luyen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_sv_ky_nam` (`ma_sv`,`ky_hoc`,`nam_hoc`);

--
-- Indexes for table `ds_rubrics`
--
ALTER TABLE `ds_rubrics`
  ADD PRIMARY KEY (`id_rubric`),
  ADD UNIQUE KEY `ten_rubric` (`ten_rubric`);

--
-- Indexes for table `giang_vien`
--
ALTER TABLE `giang_vien`
  ADD PRIMARY KEY (`ma_giang_vien`);

--
-- Indexes for table `hoat_dong_ho_tro`
--
ALTER TABLE `hoat_dong_ho_tro`
  ADD PRIMARY KEY (`id_hd_ho_tro`),
  ADD KEY `id_hd` (`id_hd`),
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
  ADD UNIQUE KEY `uk_ten_hd_id_sk` (`ten_hd`,`id_sk`),
  ADD KEY `id_rubric` (`id_rubric`),
  ADD KEY `id_sk` (`id_sk`);

--
-- Indexes for table `ket_qua`
--
ALTER TABLE `ket_qua`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_cham_diem` (`id_cham_diem`);

--
-- Indexes for table `log_gcn`
--
ALTER TABLE `log_gcn`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_gcn` (`id_gcn`),
  ADD KEY `ma_btc` (`ma_btc`);

--
-- Indexes for table `log_tra_cuu`
--
ALTER TABLE `log_tra_cuu`
  ADD PRIMARY KEY (`id`),
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
  ADD PRIMARY KEY (`id_sk`),
  ADD UNIQUE KEY `uk_ten_sk_nam_hoc` (`ten_sk`,`nam_hoc`),
  ADD KEY `ma_btc` (`ma_btc`);

--
-- Indexes for table `tai_khoan`
--
ALTER TABLE `tai_khoan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ma_ca_nhan` (`ma_ca_nhan`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `thanh_vien_nhom`
--
ALTER TABLE `thanh_vien_nhom`
  ADD PRIMARY KEY (`id_nhom`,`ma_sv`),
  ADD KEY `ma_sv` (`ma_sv`);

--
-- Indexes for table `thong_tin_gcn`
--
ALTER TABLE `thong_tin_gcn`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ma_btc` (`ma_btc`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cham_diem`
--
ALTER TABLE `cham_diem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dang_ky_ca_nhan`
--
ALTER TABLE `dang_ky_ca_nhan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dang_ky_nhom`
--
ALTER TABLE `dang_ky_nhom`
  MODIFY `id_nhom` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `ds_rubrics`
--
ALTER TABLE `ds_rubrics`
  MODIFY `id_rubric` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `hoat_dong_ho_tro`
--
ALTER TABLE `hoat_dong_ho_tro`
  MODIFY `id_hd_ho_tro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hoat_dong_tham_du`
--
ALTER TABLE `hoat_dong_tham_du`
  MODIFY `id_hd_tham_du` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hoat_dong_thi`
--
ALTER TABLE `hoat_dong_thi`
  MODIFY `id_hd` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ket_qua`
--
ALTER TABLE `ket_qua`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `log_gcn`
--
ALTER TABLE `log_gcn`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `log_tra_cuu`
--
ALTER TABLE `log_tra_cuu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `su_kien`
--
ALTER TABLE `su_kien`
  MODIFY `id_sk` int(11) NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `ban_giam_khao_ibfk_1` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong_thi` (`id_hd`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ban_giam_khao_ibfk_2` FOREIGN KEY (`ma_gv`) REFERENCES `giang_vien` (`ma_giang_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Constraints for table `cham_diem`
--
ALTER TABLE `cham_diem`
  ADD CONSTRAINT `cham_diem_ibfk_1` FOREIGN KEY (`id_hd_thi`) REFERENCES `hoat_dong_thi` (`id_hd`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `cham_diem_ibfk_2` FOREIGN KEY (`ma_bgk`) REFERENCES `giang_vien` (`ma_giang_vien`) ON UPDATE CASCADE;

--
-- Constraints for table `chi_tiet_rubric`
--
ALTER TABLE `chi_tiet_rubric`
  ADD CONSTRAINT `chi_tiet_rubric_ibfk_1` FOREIGN KEY (`id_rubric`) REFERENCES `ds_rubrics` (`id_rubric`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `dang_ky_ca_nhan`
--
ALTER TABLE `dang_ky_ca_nhan`
  ADD CONSTRAINT `dang_ky_ca_nhan_ibfk_1` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong_thi` (`id_hd`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `dang_ky_ca_nhan_ibfk_2` FOREIGN KEY (`ma_sv`) REFERENCES `sinh_vien` (`ma_sinh_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `dang_ky_nhom`
--
ALTER TABLE `dang_ky_nhom`
  ADD CONSTRAINT `dang_ky_nhom_ibfk_1` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong_thi` (`id_hd`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `dang_ky_tham_du`
--
ALTER TABLE `dang_ky_tham_du`
  ADD CONSTRAINT `dang_ky_tham_du_ibfk_1` FOREIGN KEY (`ma_sv`) REFERENCES `sinh_vien` (`ma_sinh_vien`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `dang_ky_tham_du_ibfk_2` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong_tham_du` (`id_hd_tham_du`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Constraints for table `giang_vien`
--
ALTER TABLE `giang_vien`
  ADD CONSTRAINT `giang_vien_ibfk_1` FOREIGN KEY (`ma_giang_vien`) REFERENCES `tai_khoan` (`ma_ca_nhan`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `hoat_dong_ho_tro`
--
ALTER TABLE `hoat_dong_ho_tro`
  ADD CONSTRAINT `hoat_dong_ho_tro_ibfk_1` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong_thi` (`id_hd`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hoat_dong_ho_tro_ibfk_2` FOREIGN KEY (`ma_gv`) REFERENCES `giang_vien` (`ma_giang_vien`) ON UPDATE CASCADE;

--
-- Constraints for table `hoat_dong_tham_du`
--
ALTER TABLE `hoat_dong_tham_du`
  ADD CONSTRAINT `hoat_dong_tham_du_ibfk_1` FOREIGN KEY (`id_hd`) REFERENCES `hoat_dong_thi` (`id_hd`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `hoat_dong_thi`
--
ALTER TABLE `hoat_dong_thi`
  ADD CONSTRAINT `hoat_dong_thi_ibfk_1` FOREIGN KEY (`id_rubric`) REFERENCES `ds_rubrics` (`id_rubric`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `hoat_dong_thi_ibfk_2` FOREIGN KEY (`id_sk`) REFERENCES `su_kien` (`id_sk`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ket_qua`
--
ALTER TABLE `ket_qua`
  ADD CONSTRAINT `ket_qua_ibfk_1` FOREIGN KEY (`id_cham_diem`) REFERENCES `cham_diem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `log_gcn`
--
ALTER TABLE `log_gcn`
  ADD CONSTRAINT `log_gcn_ibfk_1` FOREIGN KEY (`id_gcn`) REFERENCES `thong_tin_gcn` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `log_gcn_ibfk_2` FOREIGN KEY (`ma_btc`) REFERENCES `ban_to_chuc` (`ma_giang_vien`) ON UPDATE CASCADE;

--
-- Constraints for table `log_tra_cuu`
--
ALTER TABLE `log_tra_cuu`
  ADD CONSTRAINT `log_tra_cuu_ibfk_1` FOREIGN KEY (`id_gcn`) REFERENCES `thong_tin_gcn` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sinh_vien`
--
ALTER TABLE `sinh_vien`
  ADD CONSTRAINT `sinh_vien_ibfk_1` FOREIGN KEY (`ma_sinh_vien`) REFERENCES `tai_khoan` (`ma_ca_nhan`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `su_kien`
--
ALTER TABLE `su_kien`
  ADD CONSTRAINT `su_kien_ibfk_1` FOREIGN KEY (`ma_btc`) REFERENCES `ban_to_chuc` (`ma_giang_vien`) ON UPDATE CASCADE;

--
-- Constraints for table `thanh_vien_nhom`
--
ALTER TABLE `thanh_vien_nhom`
  ADD CONSTRAINT `thanh_vien_nhom_ibfk_1` FOREIGN KEY (`id_nhom`) REFERENCES `dang_ky_nhom` (`id_nhom`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thanh_vien_nhom_ibfk_2` FOREIGN KEY (`ma_sv`) REFERENCES `sinh_vien` (`ma_sinh_vien`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `thong_tin_gcn`
--
ALTER TABLE `thong_tin_gcn`
  ADD CONSTRAINT `thong_tin_gcn_ibfk_1` FOREIGN KEY (`ma_btc`) REFERENCES `ban_to_chuc` (`ma_giang_vien`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
