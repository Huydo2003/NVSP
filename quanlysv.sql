-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 11, 2025 at 03:52 PM
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
-- Database: `quanlysv`
--

-- --------------------------------------------------------

--
-- Table structure for table `bangiamkhao`
--

CREATE TABLE `bangiamkhao` (
  `Id_BGK` int(11) NOT NULL,
  `id_GV` int(11) DEFAULT NULL,
  `id_HoatDongThi` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bangiamkhao`
--

INSERT INTO `bangiamkhao` (`Id_BGK`, `id_GV`, `id_HoatDongThi`) VALUES
(1, 11, 1),
(2, 12, 1),
(3, 11, 2);

-- --------------------------------------------------------

--
-- Table structure for table `bantochuc`
--

CREATE TABLE `bantochuc` (
  `Id_BTC` int(11) NOT NULL,
  `id_TK` int(11) NOT NULL,
  `id_capBTC` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bantochuc`
--

INSERT INTO `bantochuc` (`Id_BTC`, `id_TK`, `id_capBTC`) VALUES
(1, 2, 1),
(2, 2, 2),
(3, 2, 3),
(4, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `bienban`
--

CREATE TABLE `bienban` (
  `Id_BienBan` int(11) NOT NULL,
  `Id_HoatDongThi` int(11) DEFAULT NULL,
  `Id_BGK` int(11) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL,
  `ThoiGianLap` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bienban`
--

INSERT INTO `bienban` (`Id_BienBan`, `Id_HoatDongThi`, `Id_BGK`, `NoiDung`, `ThoiGianLap`) VALUES
(1, NULL, NULL, 'Nội dung biên bản 1', '2024-08-02 00:00:00'),
(2, NULL, NULL, 'Nội dung biên bản 2', '2023-10-31 00:00:00'),
(3, NULL, NULL, 'Nội dung biên bản 3', '2023-03-14 00:00:00'),
(4, NULL, NULL, 'Nội dung biên bản 4', '2024-11-23 00:00:00'),
(5, NULL, NULL, 'Nội dung biên bản 5', '2023-10-25 00:00:00'),
(6, NULL, NULL, 'Nội dung biên bản 6', '2023-10-09 00:00:00'),
(7, NULL, NULL, 'Nội dung biên bản 7', '2024-01-08 00:00:00'),
(8, NULL, NULL, 'Nội dung biên bản 8', '2024-07-01 00:00:00'),
(9, NULL, NULL, 'Nội dung biên bản 9', '2023-07-08 00:00:00'),
(10, NULL, NULL, 'Nội dung biên bản 10', '2024-07-24 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `binhchon`
--

CREATE TABLE `binhchon` (
  `Id_BinhChon` int(11) NOT NULL,
  `Id_SuKien` int(11) DEFAULT NULL,
  `tenDanhHieu` varchar(100) DEFAULT NULL,
  `thoiGianBatDau` datetime DEFAULT NULL,
  `thoiGianKetThuc` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `binhchon`
--

INSERT INTO `binhchon` (`Id_BinhChon`, `Id_SuKien`, `tenDanhHieu`, `thoiGianBatDau`, `thoiGianKetThuc`) VALUES
(1, 2, 'Sinh viên tiêu biểu', '2025-11-20 00:00:00', '2025-11-25 00:00:00'),
(2, NULL, 'Giá trị 2', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(3, NULL, 'Giá trị 3', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(4, NULL, 'Giá trị 4', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(5, NULL, 'Giá trị 5', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(6, NULL, 'Giá trị 6', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(7, NULL, 'Giá trị 7', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(8, NULL, 'Giá trị 8', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(9, NULL, 'Giá trị 9', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(10, NULL, 'Giá trị 10', '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `canbolop`
--

CREATE TABLE `canbolop` (
  `Id_CBL` int(11) NOT NULL,
  `id_SV` int(11) DEFAULT NULL,
  `id_Lop` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `canbolop`
--

INSERT INTO `canbolop` (`Id_CBL`, `id_SV`, `id_Lop`) VALUES
(2, 1, 1),
(3, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `capbantochuc`
--

CREATE TABLE `capbantochuc` (
  `Id_CapBTC` int(11) NOT NULL,
  `tenBTC` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `capbantochuc`
--

INSERT INTO `capbantochuc` (`Id_CapBTC`, `tenBTC`) VALUES
(1, 'Ban tổ chức chính'),
(2, 'Ban hỗ trợ'),
(3, 'Ban kỹ thuật');

-- --------------------------------------------------------

--
-- Table structure for table `chitietdiem`
--

CREATE TABLE `chitietdiem` (
  `Id_ChiTietDiem` int(11) NOT NULL,
  `Id_KetQua` int(11) DEFAULT NULL,
  `Id_TieuChi` int(11) DEFAULT NULL,
  `Id_BGK` int(11) DEFAULT NULL,
  `diemRubric` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chitietdiem`
--

INSERT INTO `chitietdiem` (`Id_ChiTietDiem`, `Id_KetQua`, `Id_TieuChi`, `Id_BGK`, `diemRubric`) VALUES
(1, NULL, NULL, NULL, 0),
(2, NULL, NULL, NULL, 0),
(3, NULL, NULL, NULL, 0),
(4, NULL, NULL, NULL, 0),
(5, NULL, NULL, NULL, 0),
(6, NULL, NULL, NULL, 0),
(7, NULL, NULL, NULL, 0),
(8, NULL, NULL, NULL, 0),
(9, NULL, NULL, NULL, 0),
(10, NULL, NULL, NULL, 0),
(11, 1, 1, 1, 1),
(12, 1, 2, 1, 1),
(13, 1, 3, 1, 1),
(14, 1, 4, 1, 1),
(15, 1, 5, 1, 1),
(16, 1, 6, 1, 1),
(17, 1, 7, 1, 1),
(18, 1, 8, 1, 1),
(19, 1, 9, 1, 0.5),
(20, 1, 10, 1, 1),
(21, 2, 1, 3, 0.8),
(22, 2, 2, 3, 0.8),
(23, 2, 3, 3, 0.8),
(24, 2, 4, 3, 0.8),
(25, 2, 5, 0, 0.8),
(26, 2, 6, 3, 0.8),
(27, 2, 7, 3, 0.8),
(28, 2, 8, 3, 0.8),
(29, 2, 9, 3, 0.8),
(30, 2, 10, 3, 0.8);

-- --------------------------------------------------------

--
-- Table structure for table `chitieu`
--

CREATE TABLE `chitieu` (
  `Id_ChiTieu` int(11) NOT NULL,
  `id_HoatDong` int(11) DEFAULT NULL,
  `id_Lop` int(11) DEFAULT NULL,
  `soLuongDki` int(11) DEFAULT NULL,
  `soLuongYeuCau` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chitieu`
--

INSERT INTO `chitieu` (`Id_ChiTieu`, `id_HoatDong`, `id_Lop`, `soLuongDki`, `soLuongYeuCau`) VALUES
(1, NULL, NULL, 0, 0),
(2, NULL, NULL, 0, 0),
(3, NULL, NULL, 0, 0),
(4, NULL, NULL, 0, 0),
(5, NULL, NULL, 0, 0),
(6, NULL, NULL, 0, 0),
(7, NULL, NULL, 0, 0),
(8, NULL, NULL, 0, 0),
(9, NULL, NULL, 0, 0),
(10, NULL, NULL, 0, 0),
(11, 1, 1, 0, 10),
(12, 1, 2, 0, 8),
(13, 2, 1, 0, 5);

-- --------------------------------------------------------

--
-- Table structure for table `chungnhan`
--

CREATE TABLE `chungnhan` (
  `Id_ChungNhan` int(11) NOT NULL,
  `Id_loaiCN` int(11) DEFAULT NULL,
  `Id_SV` int(11) DEFAULT NULL,
  `Id_SuKien` int(11) DEFAULT NULL,
  `Id_Giai` int(11) DEFAULT NULL,
  `Id_BTC` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chungnhan`
--

INSERT INTO `chungnhan` (`Id_ChungNhan`, `Id_loaiCN`, `Id_SV`, `Id_SuKien`, `Id_Giai`, `Id_BTC`) VALUES
(1, 1, 1, 1, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `dangki`
--

CREATE TABLE `dangki` (
  `Id_DangKi` int(11) NOT NULL,
  `id_HoatDong` int(11) DEFAULT NULL,
  `idSV` int(11) DEFAULT NULL,
  `id_Nhom` int(11) DEFAULT NULL,
  `loaiDki` varchar(50) DEFAULT NULL,
  `thoiGianDki` datetime DEFAULT NULL,
  `idCBLDuyet` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dangki`
--

INSERT INTO `dangki` (`Id_DangKi`, `id_HoatDong`, `idSV`, `id_Nhom`, `loaiDki`, `thoiGianDki`, `idCBLDuyet`) VALUES
(1, 1, 1, NULL, 'CaNhan', '2025-10-25 10:00:00', 3),
(2, 2, 2, NULL, 'CaNhan', '2025-11-06 14:30:00', 3),
(3, 3, 1, 1, 'Nhom', '2025-11-01 08:00:00', 3);

-- --------------------------------------------------------

--
-- Table structure for table `danhsachlop`
--

CREATE TABLE `danhsachlop` (
  `Id_DanhSach` int(11) NOT NULL,
  `id_Lop` int(11) DEFAULT NULL,
  `id_HoatDong` int(11) DEFAULT NULL,
  `idCBL` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `danhsachlop`
--

INSERT INTO `danhsachlop` (`Id_DanhSach`, `id_Lop`, `id_HoatDong`, `idCBL`) VALUES
(2, 2, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `danhsachtruong`
--

CREATE TABLE `danhsachtruong` (
  `Id_DanhSachTruong` int(11) NOT NULL,
  `id_HoatDong` int(11) DEFAULT NULL,
  `id_BTC` int(11) DEFAULT NULL,
  `tongsoDoi` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `danhsachtruong`
--

INSERT INTO `danhsachtruong` (`Id_DanhSachTruong`, `id_HoatDong`, `id_BTC`, `tongsoDoi`) VALUES
(1, 3, 2, 15);

-- --------------------------------------------------------

--
-- Table structure for table `diemdanh`
--

CREATE TABLE `diemdanh` (
  `Id_DiemDanh` int(11) NOT NULL,
  `Id_HoatDongThamDu` int(11) DEFAULT NULL,
  `Id_SV` int(11) DEFAULT NULL,
  `thoigianCheckin` datetime DEFAULT NULL,
  `anhMinhChung` varchar(255) DEFAULT NULL,
  `Id_CBLDuyet` int(11) DEFAULT NULL,
  `ThoiGianDuyet` datetime DEFAULT NULL,
  `LyDoTuChoi` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diemdanh`
--

INSERT INTO `diemdanh` (`Id_DiemDanh`, `Id_HoatDongThamDu`, `Id_SV`, `thoigianCheckin`, `anhMinhChung`, `Id_CBLDuyet`, `ThoiGianDuyet`, `LyDoTuChoi`) VALUES
(1, 1, 2, '2025-11-06 14:35:00', 'minhchung_sv2.jpg', 3, '2025-11-06 15:00:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `diemrenluyen`
--

CREATE TABLE `diemrenluyen` (
  `Id_DRL` int(11) NOT NULL,
  `Id_SV` int(11) DEFAULT NULL,
  `Id_HoatDong` int(11) DEFAULT NULL,
  `Id_MucDRL` int(11) DEFAULT NULL,
  `Diem` float DEFAULT NULL,
  `Kyhoc` varchar(10) DEFAULT NULL,
  `Namhoc` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diemrenluyen`
--

INSERT INTO `diemrenluyen` (`Id_DRL`, `Id_SV`, `Id_HoatDong`, `Id_MucDRL`, `Diem`, `Kyhoc`, `Namhoc`) VALUES
(1, 1, 1, 1, 95, '1', '2025'),
(2, 2, 2, 2, 85, '1', '2025');

-- --------------------------------------------------------

--
-- Table structure for table `giai`
--

CREATE TABLE `giai` (
  `Id_Giai` int(11) NOT NULL,
  `Id_HoatDongThi` int(11) DEFAULT NULL,
  `tenGiai` varchar(50) DEFAULT NULL,
  `thuTu` int(11) DEFAULT NULL,
  `soLuong` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `giai`
--

INSERT INTO `giai` (`Id_Giai`, `Id_HoatDongThi`, `tenGiai`, `thuTu`, `soLuong`) VALUES
(1, 1, 'Nhất Cá nhân', 1, 1),
(2, 1, 'Nhì Cá nhân', 2, 1),
(3, 2, 'Nhất Dự án', 1, 1),
(4, 2, 'Nhì Dự án', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `giangvien`
--

CREATE TABLE `giangvien` (
  `Id_GV` int(11) NOT NULL,
  `id_TK` int(11) DEFAULT NULL,
  `tenGV` varchar(100) DEFAULT NULL,
  `id_Khoa` int(11) DEFAULT NULL,
  `soDT` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `giangvien`
--

INSERT INTO `giangvien` (`Id_GV`, `id_TK`, `tenGV`, `id_Khoa`, `soDT`, `email`) VALUES
(11, 5, 'Trần Minh Hải', 1, '0901234567', 'haitm@hnue.edu.vn'),
(12, 5, 'Lê Thị Thu', 2, '0907654321', 'thult@hnue.edu.vn'),
(13, 5, 'Phạm Văn Tuấn', 3, '0912345678', 'tuanpv@hnue.edu.vn'),
(14, 5, 'Nguyễn Thanh Nga', 1, '0918765432', 'ngant@hnue.edu.vn');

-- --------------------------------------------------------

--
-- Table structure for table `hoatdong`
--

CREATE TABLE `hoatdong` (
  `Id_HoatDong` int(11) NOT NULL,
  `tenHoatDong` varchar(150) DEFAULT NULL,
  `idSuKien` int(11) DEFAULT NULL,
  `hinhThucDk` varchar(50) DEFAULT NULL,
  `soThanhVienToiDa` int(11) DEFAULT NULL,
  `DiaDiem` varchar(150) DEFAULT NULL,
  `Thi` tinyint(1) DEFAULT NULL,
  `ngayMoDki` date DEFAULT NULL,
  `ngayDongDki` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoatdong`
--

INSERT INTO `hoatdong` (`Id_HoatDong`, `tenHoatDong`, `idSuKien`, `hinhThucDk`, `soThanhVienToiDa`, `DiaDiem`, `Thi`, `ngayMoDki`, `ngayDongDki`) VALUES
(1, 'Vòng loại lập trình cá nhân', 3, 'CaNhan', 1, 'Phòng máy A101', 1, '2025-10-19', '2025-10-31'),
(2, 'Hiến máu nhân đạo', 3, 'CaNhan', 1, 'Sân vận động', 0, '2025-11-05', '2025-11-15'),
(3, 'Cuộc thi Dự án Công nghệ', 1, 'Nhom', 5, 'Phòng hội thảo', 1, '2025-10-25', '2025-11-10');

-- --------------------------------------------------------

--
-- Table structure for table `hoatdonghotro`
--

CREATE TABLE `hoatdonghotro` (
  `Id_HoatDongHt` int(11) NOT NULL,
  `id_HoatDong` int(11) DEFAULT NULL,
  `id_LoaiHt` int(11) DEFAULT NULL,
  `id_GvPhuTrach` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoatdonghotro`
--

INSERT INTO `hoatdonghotro` (`Id_HoatDongHt`, `id_HoatDong`, `id_LoaiHt`, `id_GvPhuTrach`) VALUES
(1, 1, 1, 11);

-- --------------------------------------------------------

--
-- Table structure for table `hoatdongthamdu`
--

CREATE TABLE `hoatdongthamdu` (
  `Id_HoatDongTD` int(11) NOT NULL,
  `id_HoatDong` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoatdongthamdu`
--

INSERT INTO `hoatdongthamdu` (`Id_HoatDongTD`, `id_HoatDong`) VALUES
(1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `hoatdongthi`
--

CREATE TABLE `hoatdongthi` (
  `Id_HoatDongThi` int(11) NOT NULL,
  `id_HoatDong` int(11) DEFAULT NULL,
  `id_Rubric` int(11) DEFAULT NULL,
  `quyChe` text DEFAULT NULL,
  `soDoiToiDa` int(11) DEFAULT NULL,
  `linkDki` varchar(255) DEFAULT NULL,
  `qrDki` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoatdongthi`
--

INSERT INTO `hoatdongthi` (`Id_HoatDongThi`, `id_HoatDong`, `id_Rubric`, `quyChe`, `soDoiToiDa`, `linkDki`, `qrDki`) VALUES
(1, 1, 1, 'Quy chế thi lập trình vòng 1...', 50, 'link_dk_hd1', 'qr_hd1'),
(2, 3, 2, 'Quy chế thi dự án công nghệ...', 20, 'link_dk_hd3', 'qr_hd3');

-- --------------------------------------------------------

--
-- Table structure for table `ketqua`
--

CREATE TABLE `ketqua` (
  `Id_KetQua` int(11) NOT NULL,
  `Id_LichThi` int(11) DEFAULT NULL,
  `Id_Nhom` int(11) DEFAULT NULL,
  `Id_SV` int(11) DEFAULT NULL,
  `Id_Giai` int(11) DEFAULT NULL,
  `diemTong` float DEFAULT NULL,
  `xepHang` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ketqua`
--

INSERT INTO `ketqua` (`Id_KetQua`, `Id_LichThi`, `Id_Nhom`, `Id_SV`, `Id_Giai`, `diemTong`, `xepHang`) VALUES
(1, 1, NULL, 1, 1, 9.5, 1),
(2, 2, 1, NULL, NULL, 8, 3);

-- --------------------------------------------------------

--
-- Table structure for table `khoa`
--

CREATE TABLE `khoa` (
  `Id_Khoa` int(11) NOT NULL,
  `maKhoa` varchar(20) DEFAULT NULL,
  `tenKhoa` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `khoa`
--

INSERT INTO `khoa` (`Id_Khoa`, `maKhoa`, `tenKhoa`) VALUES
(1, 'Khoa1', 'Khoa 1 - CNTT'),
(2, 'Khoa2', 'Khoa 2 - CNTT'),
(3, 'Khoa3', 'Khoa 3 - CNTT'),
(4, 'Khoa4', 'Khoa 4 - CNTT'),
(5, 'Khoa5', 'Khoa 5 - CNTT'),
(6, 'Khoa6', 'Khoa 6 - CNTT'),
(7, 'Khoa7', 'Khoa 7 - CNTT'),
(8, 'Khoa8', 'Khoa 8 - CNTT'),
(9, 'Khoa9', 'Khoa 9 - CNTT'),
(10, 'Khoa10', 'Khoa 10 - CNTT');

-- --------------------------------------------------------

--
-- Table structure for table `lichthi`
--

CREATE TABLE `lichthi` (
  `Id_LichThi` int(11) NOT NULL,
  `Id_HoatDongThi` int(11) DEFAULT NULL,
  `Id_Nhom` int(11) DEFAULT NULL,
  `Id_SV` int(11) DEFAULT NULL,
  `Phongthi` varchar(50) DEFAULT NULL,
  `thoigianBatdau` datetime DEFAULT NULL,
  `thoigianKetthuc` datetime DEFAULT NULL,
  `cathi` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lichthi`
--

INSERT INTO `lichthi` (`Id_LichThi`, `Id_HoatDongThi`, `Id_Nhom`, `Id_SV`, `Phongthi`, `thoigianBatdau`, `thoigianKetthuc`, `cathi`) VALUES
(1, 1, NULL, 1, 'A101', '2025-11-15 08:00:00', '2025-11-15 09:30:00', 1),
(2, 2, 1, NULL, 'HoiThao1', '2025-11-20 14:00:00', '2025-11-20 16:00:00', 2);

-- --------------------------------------------------------

--
-- Table structure for table `loaichungnhan`
--

CREATE TABLE `loaichungnhan` (
  `Id_loaiCN` int(11) NOT NULL,
  `tenloaiCN` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loaichungnhan`
--

INSERT INTO `loaichungnhan` (`Id_loaiCN`, `tenloaiCN`) VALUES
(1, 'Chứng nhận giải thưởng cá nhân'),
(2, 'Giá trị 2'),
(3, 'Giá trị 3'),
(4, 'Giá trị 4'),
(5, 'Giá trị 5'),
(6, 'Giá trị 6'),
(7, 'Giá trị 7'),
(8, 'Giá trị 8'),
(9, 'Giá trị 9'),
(10, 'Giá trị 10'),
(11, 'new');

-- --------------------------------------------------------

--
-- Table structure for table `loaihoatdong`
--

CREATE TABLE `loaihoatdong` (
  `Id_LoaiHoatDong` int(11) NOT NULL,
  `tenLoaiHoatDong` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loaihoatdong`
--

INSERT INTO `loaihoatdong` (`Id_LoaiHoatDong`, `tenLoaiHoatDong`) VALUES
(1, 'Hoạt động 1'),
(2, 'Hoạt động 2'),
(3, 'Hoạt động 3'),
(4, 'Hoạt động 4'),
(5, 'Hoạt động 5'),
(6, 'Hoạt động 6'),
(7, 'Hoạt động 7'),
(8, 'Hoạt động 8'),
(9, 'Hoạt động 9'),
(10, 'Hoạt động 10');

-- --------------------------------------------------------

--
-- Table structure for table `loaihotro`
--

CREATE TABLE `loaihotro` (
  `Id_LoaiHt` int(11) NOT NULL,
  `tenLoaiHt` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loaihotro`
--

INSERT INTO `loaihotro` (`Id_LoaiHt`, `tenLoaiHt`) VALUES
(1, 'Giá trị 1'),
(2, 'Giá trị 2'),
(3, 'Giá trị 3'),
(4, 'Giá trị 4'),
(5, 'Giá trị 5'),
(6, 'Giá trị 6'),
(7, 'Giá trị 7'),
(8, 'Giá trị 8'),
(9, 'Giá trị 9'),
(10, 'Giá trị 10');

-- --------------------------------------------------------

--
-- Table structure for table `loaisukien`
--

CREATE TABLE `loaisukien` (
  `Id_LoaiSuKien` int(11) NOT NULL,
  `tenLoaiSuKien` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loaisukien`
--

INSERT INTO `loaisukien` (`Id_LoaiSuKien`, `tenLoaiSuKien`) VALUES
(1, 'Giá trị 1'),
(2, 'Giá trị 2'),
(3, 'Giá trị 3'),
(4, 'Giá trị 4'),
(5, 'Giá trị 5'),
(6, 'Giá trị 6'),
(7, 'Giá trị 7'),
(8, 'Giá trị 8'),
(9, 'Giá trị 9'),
(10, 'Giá trị 10');

-- --------------------------------------------------------

--
-- Table structure for table `loaitaikhoan`
--

CREATE TABLE `loaitaikhoan` (
  `Id_loaiTK` int(11) NOT NULL,
  `tenLoaiTK` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loaitaikhoan`
--

INSERT INTO `loaitaikhoan` (`Id_loaiTK`, `tenLoaiTK`) VALUES
(1, 'Admin'),
(2, 'BanToChuc'),
(3, 'CanBoLop'),
(4, 'SinhVien'),
(5, 'GiamKhao');

-- --------------------------------------------------------

--
-- Table structure for table `lop`
--

CREATE TABLE `lop` (
  `Id_Lop` int(11) NOT NULL,
  `id_Khoa` int(11) DEFAULT NULL,
  `id_NienKhoa` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lop`
--

INSERT INTO `lop` (`Id_Lop`, `id_Khoa`, `id_NienKhoa`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 2, 1),
(5, 2, 2),
(6, 2, 3),
(7, 3, 1),
(8, 3, 2),
(9, 3, 3),
(10, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `mucdrl`
--

CREATE TABLE `mucdrl` (
  `Id_MucDRL` int(11) NOT NULL,
  `tenMuc` varchar(100) DEFAULT NULL,
  `diem` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mucdrl`
--

INSERT INTO `mucdrl` (`Id_MucDRL`, `tenMuc`, `diem`) VALUES
(1, 'Xuất sắc', 90),
(2, 'Tốt', 80),
(3, 'Khá', 70),
(4, 'Trung bình', 60);

-- --------------------------------------------------------

--
-- Table structure for table `nhom`
--

CREATE TABLE `nhom` (
  `Id_Nhom` int(11) NOT NULL,
  `tenNhom` varchar(100) DEFAULT NULL,
  `id_TruongNhom` int(11) DEFAULT NULL,
  `soThanhVien` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nhom`
--

INSERT INTO `nhom` (`Id_Nhom`, `tenNhom`, `id_TruongNhom`, `soThanhVien`) VALUES
(1, 'The Coders', 1, 2),
(2, 'The Innovators', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `nienkhoa`
--

CREATE TABLE `nienkhoa` (
  `Id_NienKhoa` int(11) NOT NULL,
  `maNienKhoa` varchar(20) DEFAULT NULL,
  `tenNienKhoa` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nienkhoa`
--

INSERT INTO `nienkhoa` (`Id_NienKhoa`, `maNienKhoa`, `tenNienKhoa`) VALUES
(1, 'Khoa1', 'Khoa 1 - CNTT'),
(2, 'Khoa2', 'Khoa 2 - CNTT'),
(3, 'Khoa3', 'Khoa 3 - CNTT'),
(4, 'Khoa4', 'Khoa 4 - CNTT'),
(5, 'Khoa5', 'Khoa 5 - CNTT'),
(6, 'Khoa6', 'Khoa 6 - CNTT'),
(7, 'Khoa7', 'Khoa 7 - CNTT'),
(8, 'Khoa8', 'Khoa 8 - CNTT'),
(9, 'Khoa9', 'Khoa 9 - CNTT');

-- --------------------------------------------------------

--
-- Table structure for table `phieubinhchon`
--

CREATE TABLE `phieubinhchon` (
  `Id_Phieu` int(11) NOT NULL,
  `Id_BinhChon` int(11) DEFAULT NULL,
  `Id_CBL` int(11) DEFAULT NULL,
  `Id_UngVien` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `phieubinhchon`
--

INSERT INTO `phieubinhchon` (`Id_Phieu`, `Id_BinhChon`, `Id_CBL`, `Id_UngVien`) VALUES
(1, 1, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `rubric`
--

CREATE TABLE `rubric` (
  `Id_Rubric` int(11) NOT NULL,
  `TenRubric` varchar(100) DEFAULT NULL,
  `tongDiemTieuChi` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rubric`
--

INSERT INTO `rubric` (`Id_Rubric`, `TenRubric`, `tongDiemTieuChi`) VALUES
(1, 'Giá trị 1', 0),
(2, 'Giá trị 2', 0),
(3, 'Giá trị 3', 0),
(4, 'Giá trị 4', 0),
(5, 'Giá trị 5', 0),
(6, 'Giá trị 6', 0),
(7, 'Giá trị 7', 0),
(8, 'Giá trị 8', 0),
(9, 'Giá trị 9', 0),
(10, 'Giá trị 10', 0);

-- --------------------------------------------------------

--
-- Table structure for table `sinhvien`
--

CREATE TABLE `sinhvien` (
  `Id_SV` int(11) NOT NULL,
  `id_TK` int(11) DEFAULT NULL,
  `idMSV` varchar(20) DEFAULT NULL,
  `tenSV` varchar(100) DEFAULT NULL,
  `gioiTinh` varchar(10) DEFAULT NULL,
  `ngaySinh` date DEFAULT NULL,
  `id_NienKhoa` int(11) DEFAULT NULL,
  `id_Lop` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sinhvien`
--

INSERT INTO `sinhvien` (`Id_SV`, `id_TK`, `idMSV`, `tenSV`, `gioiTinh`, `ngaySinh`, `id_NienKhoa`, `id_Lop`, `email`) VALUES
(1, 4, 'SV001', 'Nguyễn Văn A', 'Nam', '2003-05-10', 1, 1, 'nguyenvana@hnue.edu.vn'),
(2, 7, 'SV002', 'Trần Thị B', 'Nữ', '2003-06-12', 1, 1, 'tranthib@hnue.edu.vn');

-- --------------------------------------------------------

--
-- Table structure for table `sukien`
--

CREATE TABLE `sukien` (
  `Id_SuKien` int(11) NOT NULL,
  `tenSukien` varchar(150) DEFAULT NULL,
  `id_LoaiSuKien` int(11) DEFAULT NULL,
  `id_BTC` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sukien`
--

INSERT INTO `sukien` (`Id_SuKien`, `tenSukien`, `id_LoaiSuKien`, `id_BTC`) VALUES
(1, 'Cuộc thi Lập trình sinh viên 2025', 1, 2),
(2, 'Ngày hội Văn hóa - Thể thao', 5, 2),
(3, 'Tình nguyện Mùa Hè Xanh', 3, 2);

-- --------------------------------------------------------

--
-- Table structure for table `taikhoan`
--

CREATE TABLE `taikhoan` (
  `Id` int(11) NOT NULL,
  `tenTK` varchar(100) DEFAULT NULL,
  `matKhau` varchar(255) DEFAULT NULL,
  `id_loaiTK` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `trang_thai` tinyint(4) DEFAULT NULL,
  `ngay_tao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `taikhoan`
--

INSERT INTO `taikhoan` (`Id`, `tenTK`, `matKhau`, `id_loaiTK`, `email`, `trang_thai`, `ngay_tao`) VALUES
(1, 'admin', 'admin', 1, 'admin@hnue.edu.vn', 1, '2025-11-09 13:24:03'),
(2, 'btc', 'btc', 2, 'btc@hnue.edu.vn', 1, '2025-11-09 13:24:03'),
(3, 'cbl', 'cbl', 3, 'cbl@hnue.edu.vn', 1, '2025-11-09 13:24:03'),
(4, 'student', '12345678', 4, 'student@hnue.edu.vn', 1, '2025-11-09 13:24:03'),
(5, 'judge', 'matkhau123', 5, 'judge@hnue.edu.vn', 1, '2025-11-09 13:24:03'),
(7, '211242', '1', 4, 'sinhvien12@hnue.edu.vn', 1, '2025-11-10 22:31:35'),
(8, 'admin1', 'admin', 1, 'admin1@hnue.edu.vn', 1, '2025-11-09 13:24:03'),
(9, 'btc1', 'btc', 2, 'btc1@hnue.edu.vn', 1, '2025-11-09 13:24:03'),
(10, 'cbl1', 'cbl', 3, 'cbl1@hnue.edu.vn', 1, '2025-11-09 13:24:03'),
(11, 'student1', 'student', 4, 'student1@hnue.edu.vn', 1, '2025-11-09 13:24:03'),
(12, 'judge1', 'matkhau123', 5, 'judge1@hnue.edu.vn', 1, '2025-11-09 13:24:03'),
(13, '2112421', '1', 4, 'sinhvien123@hnue.edu.vn', 1, '2025-11-10 22:31:35'),
(14, '12345', '1', 4, 'user12345@hnue.edu.vn', 1, '2025-11-11 21:23:07');

-- --------------------------------------------------------

--
-- Table structure for table `thanhviennhom`
--

CREATE TABLE `thanhviennhom` (
  `Id_ThanhVien` int(11) NOT NULL,
  `id_Nhom` int(11) DEFAULT NULL,
  `id_SV` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thanhviennhom`
--

INSERT INTO `thanhviennhom` (`Id_ThanhVien`, `id_Nhom`, `id_SV`) VALUES
(1, 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tieuchi`
--

CREATE TABLE `tieuchi` (
  `Id_TieuChi` int(11) NOT NULL,
  `tenTieuChi` varchar(100) DEFAULT NULL,
  `Id_Rubric` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tieuchi`
--

INSERT INTO `tieuchi` (`Id_TieuChi`, `tenTieuChi`, `Id_Rubric`) VALUES
(1, 'Giá trị 1', 1),
(2, 'Giá trị 2', 2),
(3, 'Giá trị 3', 3),
(4, 'Giá trị 4', 4),
(5, 'Giá trị 5', 5),
(6, 'Giá trị 6', 6),
(7, 'Giá trị 7', 7),
(8, 'Giá trị 8', 8),
(9, 'Giá trị 9', 9),
(10, 'Giá trị 10', 10);

-- --------------------------------------------------------

--
-- Table structure for table `tracuu`
--

CREATE TABLE `tracuu` (
  `Id_TraCuu` int(11) NOT NULL,
  `Id_ChungNhan` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tracuu`
--

INSERT INTO `tracuu` (`Id_TraCuu`, `Id_ChungNhan`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `ungvien`
--

CREATE TABLE `ungvien` (
  `Id_UngVien` int(11) NOT NULL,
  `Id_SV` int(11) DEFAULT NULL,
  `Id_BinhChon` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ungvien`
--

INSERT INTO `ungvien` (`Id_UngVien`, `Id_SV`, `Id_BinhChon`) VALUES
(1, 2, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bangiamkhao`
--
ALTER TABLE `bangiamkhao`
  ADD PRIMARY KEY (`Id_BGK`),
  ADD KEY `id_GV` (`id_GV`);

--
-- Indexes for table `bantochuc`
--
ALTER TABLE `bantochuc`
  ADD PRIMARY KEY (`Id_BTC`),
  ADD KEY `id_capBTC` (`id_capBTC`);

--
-- Indexes for table `bienban`
--
ALTER TABLE `bienban`
  ADD PRIMARY KEY (`Id_BienBan`);

--
-- Indexes for table `binhchon`
--
ALTER TABLE `binhchon`
  ADD PRIMARY KEY (`Id_BinhChon`);

--
-- Indexes for table `canbolop`
--
ALTER TABLE `canbolop`
  ADD PRIMARY KEY (`Id_CBL`),
  ADD KEY `id_SV` (`id_SV`);

--
-- Indexes for table `capbantochuc`
--
ALTER TABLE `capbantochuc`
  ADD PRIMARY KEY (`Id_CapBTC`);

--
-- Indexes for table `chitietdiem`
--
ALTER TABLE `chitietdiem`
  ADD PRIMARY KEY (`Id_ChiTietDiem`);

--
-- Indexes for table `chitieu`
--
ALTER TABLE `chitieu`
  ADD PRIMARY KEY (`Id_ChiTieu`),
  ADD KEY `id_HoatDong` (`id_HoatDong`),
  ADD KEY `id_Lop` (`id_Lop`);

--
-- Indexes for table `chungnhan`
--
ALTER TABLE `chungnhan`
  ADD PRIMARY KEY (`Id_ChungNhan`);

--
-- Indexes for table `dangki`
--
ALTER TABLE `dangki`
  ADD PRIMARY KEY (`Id_DangKi`),
  ADD KEY `id_HoatDong` (`id_HoatDong`),
  ADD KEY `idSV` (`idSV`),
  ADD KEY `id_Nhom` (`id_Nhom`);

--
-- Indexes for table `danhsachlop`
--
ALTER TABLE `danhsachlop`
  ADD PRIMARY KEY (`Id_DanhSach`),
  ADD KEY `id_Lop` (`id_Lop`),
  ADD KEY `id_HoatDong` (`id_HoatDong`);

--
-- Indexes for table `danhsachtruong`
--
ALTER TABLE `danhsachtruong`
  ADD PRIMARY KEY (`Id_DanhSachTruong`),
  ADD KEY `id_HoatDong` (`id_HoatDong`);

--
-- Indexes for table `diemdanh`
--
ALTER TABLE `diemdanh`
  ADD PRIMARY KEY (`Id_DiemDanh`);

--
-- Indexes for table `diemrenluyen`
--
ALTER TABLE `diemrenluyen`
  ADD PRIMARY KEY (`Id_DRL`);

--
-- Indexes for table `giai`
--
ALTER TABLE `giai`
  ADD PRIMARY KEY (`Id_Giai`);

--
-- Indexes for table `giangvien`
--
ALTER TABLE `giangvien`
  ADD PRIMARY KEY (`Id_GV`),
  ADD KEY `id_TK` (`id_TK`);

--
-- Indexes for table `hoatdong`
--
ALTER TABLE `hoatdong`
  ADD PRIMARY KEY (`Id_HoatDong`),
  ADD KEY `idSuKien` (`idSuKien`);

--
-- Indexes for table `hoatdonghotro`
--
ALTER TABLE `hoatdonghotro`
  ADD PRIMARY KEY (`Id_HoatDongHt`),
  ADD KEY `id_HoatDong` (`id_HoatDong`);

--
-- Indexes for table `hoatdongthamdu`
--
ALTER TABLE `hoatdongthamdu`
  ADD PRIMARY KEY (`Id_HoatDongTD`),
  ADD KEY `id_HoatDong` (`id_HoatDong`);

--
-- Indexes for table `hoatdongthi`
--
ALTER TABLE `hoatdongthi`
  ADD PRIMARY KEY (`Id_HoatDongThi`),
  ADD KEY `id_HoatDong` (`id_HoatDong`);

--
-- Indexes for table `ketqua`
--
ALTER TABLE `ketqua`
  ADD PRIMARY KEY (`Id_KetQua`);

--
-- Indexes for table `khoa`
--
ALTER TABLE `khoa`
  ADD PRIMARY KEY (`Id_Khoa`);

--
-- Indexes for table `lichthi`
--
ALTER TABLE `lichthi`
  ADD PRIMARY KEY (`Id_LichThi`);

--
-- Indexes for table `loaichungnhan`
--
ALTER TABLE `loaichungnhan`
  ADD PRIMARY KEY (`Id_loaiCN`);

--
-- Indexes for table `loaihoatdong`
--
ALTER TABLE `loaihoatdong`
  ADD PRIMARY KEY (`Id_LoaiHoatDong`);

--
-- Indexes for table `loaihotro`
--
ALTER TABLE `loaihotro`
  ADD PRIMARY KEY (`Id_LoaiHt`);

--
-- Indexes for table `loaisukien`
--
ALTER TABLE `loaisukien`
  ADD PRIMARY KEY (`Id_LoaiSuKien`);

--
-- Indexes for table `loaitaikhoan`
--
ALTER TABLE `loaitaikhoan`
  ADD PRIMARY KEY (`Id_loaiTK`);

--
-- Indexes for table `lop`
--
ALTER TABLE `lop`
  ADD PRIMARY KEY (`Id_Lop`),
  ADD KEY `id_Khoa` (`id_Khoa`),
  ADD KEY `id_NienKhoa` (`id_NienKhoa`);

--
-- Indexes for table `mucdrl`
--
ALTER TABLE `mucdrl`
  ADD PRIMARY KEY (`Id_MucDRL`);

--
-- Indexes for table `nhom`
--
ALTER TABLE `nhom`
  ADD PRIMARY KEY (`Id_Nhom`);

--
-- Indexes for table `nienkhoa`
--
ALTER TABLE `nienkhoa`
  ADD PRIMARY KEY (`Id_NienKhoa`);

--
-- Indexes for table `phieubinhchon`
--
ALTER TABLE `phieubinhchon`
  ADD PRIMARY KEY (`Id_Phieu`);

--
-- Indexes for table `rubric`
--
ALTER TABLE `rubric`
  ADD PRIMARY KEY (`Id_Rubric`);

--
-- Indexes for table `sinhvien`
--
ALTER TABLE `sinhvien`
  ADD PRIMARY KEY (`Id_SV`),
  ADD KEY `id_TK` (`id_TK`);

--
-- Indexes for table `sukien`
--
ALTER TABLE `sukien`
  ADD PRIMARY KEY (`Id_SuKien`),
  ADD KEY `id_LoaiSuKien` (`id_LoaiSuKien`);

--
-- Indexes for table `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `id_loaiTK` (`id_loaiTK`);

--
-- Indexes for table `thanhviennhom`
--
ALTER TABLE `thanhviennhom`
  ADD PRIMARY KEY (`Id_ThanhVien`),
  ADD KEY `id_Nhom` (`id_Nhom`),
  ADD KEY `id_SV` (`id_SV`);

--
-- Indexes for table `tieuchi`
--
ALTER TABLE `tieuchi`
  ADD PRIMARY KEY (`Id_TieuChi`),
  ADD KEY `Id_Rubric` (`Id_Rubric`);

--
-- Indexes for table `tracuu`
--
ALTER TABLE `tracuu`
  ADD PRIMARY KEY (`Id_TraCuu`);

--
-- Indexes for table `ungvien`
--
ALTER TABLE `ungvien`
  ADD PRIMARY KEY (`Id_UngVien`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bangiamkhao`
--
ALTER TABLE `bangiamkhao`
  MODIFY `Id_BGK` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bienban`
--
ALTER TABLE `bienban`
  MODIFY `Id_BienBan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `binhchon`
--
ALTER TABLE `binhchon`
  MODIFY `Id_BinhChon` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `canbolop`
--
ALTER TABLE `canbolop`
  MODIFY `Id_CBL` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `chitietdiem`
--
ALTER TABLE `chitietdiem`
  MODIFY `Id_ChiTietDiem` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `chitieu`
--
ALTER TABLE `chitieu`
  MODIFY `Id_ChiTieu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `chungnhan`
--
ALTER TABLE `chungnhan`
  MODIFY `Id_ChungNhan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `dangki`
--
ALTER TABLE `dangki`
  MODIFY `Id_DangKi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `danhsachlop`
--
ALTER TABLE `danhsachlop`
  MODIFY `Id_DanhSach` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `danhsachtruong`
--
ALTER TABLE `danhsachtruong`
  MODIFY `Id_DanhSachTruong` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `diemdanh`
--
ALTER TABLE `diemdanh`
  MODIFY `Id_DiemDanh` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `diemrenluyen`
--
ALTER TABLE `diemrenluyen`
  MODIFY `Id_DRL` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `giai`
--
ALTER TABLE `giai`
  MODIFY `Id_Giai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `giangvien`
--
ALTER TABLE `giangvien`
  MODIFY `Id_GV` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `hoatdong`
--
ALTER TABLE `hoatdong`
  MODIFY `Id_HoatDong` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hoatdonghotro`
--
ALTER TABLE `hoatdonghotro`
  MODIFY `Id_HoatDongHt` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hoatdongthamdu`
--
ALTER TABLE `hoatdongthamdu`
  MODIFY `Id_HoatDongTD` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hoatdongthi`
--
ALTER TABLE `hoatdongthi`
  MODIFY `Id_HoatDongThi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ketqua`
--
ALTER TABLE `ketqua`
  MODIFY `Id_KetQua` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `khoa`
--
ALTER TABLE `khoa`
  MODIFY `Id_Khoa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `lichthi`
--
ALTER TABLE `lichthi`
  MODIFY `Id_LichThi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `loaichungnhan`
--
ALTER TABLE `loaichungnhan`
  MODIFY `Id_loaiCN` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `loaihoatdong`
--
ALTER TABLE `loaihoatdong`
  MODIFY `Id_LoaiHoatDong` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `loaihotro`
--
ALTER TABLE `loaihotro`
  MODIFY `Id_LoaiHt` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `loaisukien`
--
ALTER TABLE `loaisukien`
  MODIFY `Id_LoaiSuKien` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `loaitaikhoan`
--
ALTER TABLE `loaitaikhoan`
  MODIFY `Id_loaiTK` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `lop`
--
ALTER TABLE `lop`
  MODIFY `Id_Lop` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `mucdrl`
--
ALTER TABLE `mucdrl`
  MODIFY `Id_MucDRL` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `nhom`
--
ALTER TABLE `nhom`
  MODIFY `Id_Nhom` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `nienkhoa`
--
ALTER TABLE `nienkhoa`
  MODIFY `Id_NienKhoa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `phieubinhchon`
--
ALTER TABLE `phieubinhchon`
  MODIFY `Id_Phieu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rubric`
--
ALTER TABLE `rubric`
  MODIFY `Id_Rubric` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `sinhvien`
--
ALTER TABLE `sinhvien`
  MODIFY `Id_SV` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `sukien`
--
ALTER TABLE `sukien`
  MODIFY `Id_SuKien` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `taikhoan`
--
ALTER TABLE `taikhoan`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `thanhviennhom`
--
ALTER TABLE `thanhviennhom`
  MODIFY `Id_ThanhVien` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tieuchi`
--
ALTER TABLE `tieuchi`
  MODIFY `Id_TieuChi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tracuu`
--
ALTER TABLE `tracuu`
  MODIFY `Id_TraCuu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ungvien`
--
ALTER TABLE `ungvien`
  MODIFY `Id_UngVien` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bangiamkhao`
--
ALTER TABLE `bangiamkhao`
  ADD CONSTRAINT `bangiamkhao_ibfk_1` FOREIGN KEY (`id_GV`) REFERENCES `giangvien` (`Id_GV`);

--
-- Constraints for table `bantochuc`
--
ALTER TABLE `bantochuc`
  ADD CONSTRAINT `bantochuc_ibfk_1` FOREIGN KEY (`id_capBTC`) REFERENCES `capbantochuc` (`Id_CapBTC`);

--
-- Constraints for table `canbolop`
--
ALTER TABLE `canbolop`
  ADD CONSTRAINT `canbolop_ibfk_1` FOREIGN KEY (`id_SV`) REFERENCES `sinhvien` (`Id_SV`);

--
-- Constraints for table `chitieu`
--
ALTER TABLE `chitieu`
  ADD CONSTRAINT `chitieu_ibfk_1` FOREIGN KEY (`id_HoatDong`) REFERENCES `hoatdong` (`Id_HoatDong`),
  ADD CONSTRAINT `chitieu_ibfk_2` FOREIGN KEY (`id_Lop`) REFERENCES `lop` (`Id_Lop`);

--
-- Constraints for table `dangki`
--
ALTER TABLE `dangki`
  ADD CONSTRAINT `dangki_ibfk_1` FOREIGN KEY (`id_HoatDong`) REFERENCES `hoatdong` (`Id_HoatDong`),
  ADD CONSTRAINT `dangki_ibfk_2` FOREIGN KEY (`idSV`) REFERENCES `sinhvien` (`Id_SV`),
  ADD CONSTRAINT `dangki_ibfk_3` FOREIGN KEY (`id_Nhom`) REFERENCES `nhom` (`Id_Nhom`);

--
-- Constraints for table `danhsachlop`
--
ALTER TABLE `danhsachlop`
  ADD CONSTRAINT `danhsachlop_ibfk_1` FOREIGN KEY (`id_Lop`) REFERENCES `lop` (`Id_Lop`),
  ADD CONSTRAINT `danhsachlop_ibfk_2` FOREIGN KEY (`id_HoatDong`) REFERENCES `hoatdong` (`Id_HoatDong`);

--
-- Constraints for table `danhsachtruong`
--
ALTER TABLE `danhsachtruong`
  ADD CONSTRAINT `danhsachtruong_ibfk_1` FOREIGN KEY (`id_HoatDong`) REFERENCES `hoatdong` (`Id_HoatDong`);

--
-- Constraints for table `giangvien`
--
ALTER TABLE `giangvien`
  ADD CONSTRAINT `giangvien_ibfk_1` FOREIGN KEY (`id_TK`) REFERENCES `taikhoan` (`Id`);

--
-- Constraints for table `hoatdong`
--
ALTER TABLE `hoatdong`
  ADD CONSTRAINT `hoatdong_ibfk_1` FOREIGN KEY (`idSuKien`) REFERENCES `sukien` (`Id_SuKien`);

--
-- Constraints for table `hoatdonghotro`
--
ALTER TABLE `hoatdonghotro`
  ADD CONSTRAINT `hoatdonghotro_ibfk_1` FOREIGN KEY (`id_HoatDong`) REFERENCES `hoatdong` (`Id_HoatDong`);

--
-- Constraints for table `hoatdongthamdu`
--
ALTER TABLE `hoatdongthamdu`
  ADD CONSTRAINT `hoatdongthamdu_ibfk_1` FOREIGN KEY (`id_HoatDong`) REFERENCES `hoatdong` (`Id_HoatDong`);

--
-- Constraints for table `hoatdongthi`
--
ALTER TABLE `hoatdongthi`
  ADD CONSTRAINT `hoatdongthi_ibfk_1` FOREIGN KEY (`id_HoatDong`) REFERENCES `hoatdong` (`Id_HoatDong`);

--
-- Constraints for table `lop`
--
ALTER TABLE `lop`
  ADD CONSTRAINT `lop_ibfk_1` FOREIGN KEY (`id_Khoa`) REFERENCES `khoa` (`Id_Khoa`),
  ADD CONSTRAINT `lop_ibfk_2` FOREIGN KEY (`id_NienKhoa`) REFERENCES `nienkhoa` (`Id_NienKhoa`);

--
-- Constraints for table `sinhvien`
--
ALTER TABLE `sinhvien`
  ADD CONSTRAINT `sinhvien_ibfk_1` FOREIGN KEY (`id_TK`) REFERENCES `taikhoan` (`Id`);

--
-- Constraints for table `sukien`
--
ALTER TABLE `sukien`
  ADD CONSTRAINT `sukien_ibfk_1` FOREIGN KEY (`id_LoaiSuKien`) REFERENCES `loaisukien` (`Id_LoaiSuKien`);

--
-- Constraints for table `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD CONSTRAINT `taikhoan_ibfk_1` FOREIGN KEY (`id_loaiTK`) REFERENCES `loaitaikhoan` (`Id_loaiTK`);

--
-- Constraints for table `thanhviennhom`
--
ALTER TABLE `thanhviennhom`
  ADD CONSTRAINT `thanhviennhom_ibfk_1` FOREIGN KEY (`id_Nhom`) REFERENCES `nhom` (`Id_Nhom`),
  ADD CONSTRAINT `thanhviennhom_ibfk_2` FOREIGN KEY (`id_SV`) REFERENCES `sinhvien` (`Id_SV`);

--
-- Constraints for table `tieuchi`
--
ALTER TABLE `tieuchi`
  ADD CONSTRAINT `tieuchi_ibfk_1` FOREIGN KEY (`Id_Rubric`) REFERENCES `rubric` (`Id_Rubric`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
