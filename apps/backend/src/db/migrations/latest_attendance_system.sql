-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 26, 2026 at 08:46 PM
-- Server version: 10.11.11-MariaDB-0+deb12u1-log
-- PHP Version: 8.4.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `drnadech_attendance_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_login_logs`
--

CREATE TABLE `auth_login_logs` (
  `login_log_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัส log การ login ใช้เป็น Primary Key ของตารางบันทึกการเข้าใช้งาน',
  `user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'อ้างอิงผู้ใช้ที่เกี่ยวข้องกับความพยายาม login ครั้งนี้ หากหา user ไม่พบสามารถเป็น NULL ได้',
  `login_method` varchar(50) NOT NULL COMMENT 'วิธีการ login ที่ใช้ เช่น local หรือ sso',
  `provider_code` varchar(100) DEFAULT NULL COMMENT 'รหัสผู้ให้บริการ SSO กรณี login ผ่าน SSO เช่น google หรือ kku_sso',
  `login_identifier` varchar(255) DEFAULT NULL COMMENT 'ตัวระบุที่ใช้ login เช่น email ที่ผู้ใช้กรอกหรือ email ที่ provider ส่งกลับมา',
  `login_status` varchar(50) NOT NULL COMMENT 'ผลลัพธ์ของการ login เช่น success, failed, rejected_no_user, rejected_inactive',
  `failure_reason` varchar(255) DEFAULT NULL COMMENT 'เหตุผลเพิ่มเติมกรณี login ไม่สำเร็จหรือถูกปฏิเสธ',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP Address ของผู้ที่พยายาม login รองรับทั้ง IPv4 และ IPv6',
  `user_agent` text DEFAULT NULL COMMENT 'ค่า User-Agent ของอุปกรณ์หรือเบราว์เซอร์ที่ใช้ login',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่เกิดเหตุการณ์ login นี้'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บประวัติความพยายาม login ทั้งแบบสำเร็จและไม่สำเร็จ เพื่อใช้ตรวจสอบย้อนหลังและ debug ระบบ';

--
-- Dumping data for table `auth_login_logs`
--

INSERT INTO `auth_login_logs` (`login_log_id`, `user_id`, `login_method`, `provider_code`, `login_identifier`, `login_status`, `failure_reason`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'local', NULL, 'admin@attendance.local', 'success', NULL, '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.0.0', '2026-03-31 09:15:00'),
(2, 4, 'sso', 'kku_sso', 'advisor@kku.ac.th', 'success', NULL, '10.10.10.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.0.0', '2026-03-30 14:20:00'),
(3, NULL, 'sso', 'kku_sso', 'unknown.user@kku.ac.th', 'rejected_no_user', 'Email จาก SSO ไม่มีอยู่ในระบบ จึงไม่อนุญาตให้เข้าใช้งาน', '10.10.10.88', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.0.0', '2026-03-30 14:35:00');

-- --------------------------------------------------------

--
-- Table structure for table `auth_sso_accounts`
--

CREATE TABLE `auth_sso_accounts` (
  `sso_account_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสบัญชี SSO ภายในระบบ ใช้เป็น Primary Key ของตารางเชื่อมบัญชี SSO',
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง auth_users.user_id เพื่อระบุว่าบัญชี SSO นี้เป็นของผู้ใช้คนใดในระบบ',
  `provider_code` varchar(100) NOT NULL COMMENT 'รหัสผู้ให้บริการ SSO เช่น google, azuread, kku_sso',
  `provider_subject` varchar(255) NOT NULL COMMENT 'รหัสผู้ใช้จากฝั่งผู้ให้บริการ SSO ซึ่งมักเป็นค่า unique และใช้ยืนยันตัวตนจาก provider',
  `provider_email` varchar(255) DEFAULT NULL COMMENT 'อีเมลที่ผู้ให้บริการ SSO ส่งกลับมาในครั้งที่เชื่อมบัญชีหรือ login ล่าสุด',
  `linked_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่ผูกบัญชี SSO นี้เข้ากับผู้ใช้ภายในระบบครั้งแรก',
  `last_login_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่บัญชี SSO นี้ถูกใช้ login สำเร็จล่าสุด',
  `metadata_json` longtext DEFAULT NULL COMMENT 'ข้อมูลเพิ่มเติมจากผู้ให้บริการ SSO ในรูปแบบ JSON เช่น profile, tenant, claims อื่น ๆ',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างข้อมูลการเชื่อมบัญชี SSO นี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขข้อมูลการเชื่อมบัญชี SSO นี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบข้อมูลแบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บข้อมูลการเชื่อมบัญชีผู้ใช้ภายในระบบเข้ากับผู้ให้บริการ SSO ภายนอก';

--
-- Dumping data for table `auth_sso_accounts`
--

INSERT INTO `auth_sso_accounts` (`sso_account_id`, `user_id`, `provider_code`, `provider_subject`, `provider_email`, `linked_at`, `last_login_at`, `metadata_json`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 4, 'kku_sso', 'kku-sso-subject-0001', 'advisor@kku.ac.th', '2026-03-07 13:05:00', '2026-03-30 14:20:00', '{\"department\":\"Computing\",\"campus\":\"Khon Kaen\",\"employee_type\":\"advisor\"}', '2026-03-07 13:05:00', '2026-03-30 14:20:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `auth_users`
--

CREATE TABLE `auth_users` (
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสผู้ใช้ภายในระบบ ใช้เป็น Primary Key ของตารางผู้ใช้',
  `email` varchar(255) NOT NULL COMMENT 'อีเมลของผู้ใช้ ใช้สำหรับ login แบบ local และใช้ตรวจสอบสิทธิ์กรณี login ผ่าน SSO',
  `password_hash` varchar(255) DEFAULT NULL COMMENT 'รหัสผ่านที่เข้ารหัสแล้วสำหรับ login แบบ local หากเป็นผู้ใช้ที่ใช้ SSO อย่างเดียวสามารถเป็น NULL ได้',
  `display_name` varchar(255) NOT NULL COMMENT 'ชื่อที่ใช้แสดงผลในระบบ เช่น ชื่อเต็มหรือชื่อที่ต้องการให้แสดงบนหน้าหลังบ้าน',
  `first_name` varchar(150) DEFAULT NULL COMMENT 'ชื่อจริงของผู้ใช้ ใช้แยกเก็บกรณีต้องการนำไปแสดงผลหรือออกรายงาน',
  `last_name` varchar(150) DEFAULT NULL COMMENT 'นามสกุลของผู้ใช้ ใช้แยกเก็บกรณีต้องการนำไปแสดงผลหรือออกรายงาน',
  `role_code` varchar(50) NOT NULL DEFAULT 'staff' COMMENT 'บทบาทของผู้ใช้ เช่น super_admin, admin, staff, scanner',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'สถานะการใช้งานของผู้ใช้ 1=ใช้งานได้ 0=ปิดการใช้งาน',
  `allow_local_login` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'กำหนดว่าผู้ใช้นี้อนุญาตให้ login ด้วยอีเมลและรหัสผ่านหรือไม่',
  `allow_sso_login` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'กำหนดว่าผู้ใช้นี้อนุญาตให้ login ผ่าน SSO หรือไม่',
  `last_login_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ผู้ใช้งานคนนี้ login สำเร็จครั้งล่าสุด',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างข้อมูลผู้ใช้นี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขข้อมูลผู้ใช้นี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบข้อมูลแบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บข้อมูลผู้ใช้ที่สามารถเข้าสู่ระบบหลังบ้าน ระบบ admin หรือหน้าสแกน QR ได้';

--
-- Dumping data for table `auth_users`
--

INSERT INTO `auth_users` (`user_id`, `email`, `password_hash`, `display_name`, `first_name`, `last_name`, `role_code`, `is_active`, `allow_local_login`, `allow_sso_login`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'admin@attendance.local', '$2y$12$PYSFksU57OGtcEAG1BdGwercg/9m0ZY0Ggr2p2e8AG4ClXtKgDoHW', 'System Super Admin', 'System', 'Admin', 'super_admin', 1, 1, 1, '2026-03-31 09:15:00', '2026-03-01 09:00:00', '2026-03-31 09:15:00', NULL),
(2, 'ops@hackathon.local', '$2y$12$PYSFksU57OGtcEAG1BdGwercg/9m0ZY0Ggr2p2e8AG4ClXtKgDoHW', 'Hackathon Operations', 'Hackathon', 'Operations', 'admin', 1, 1, 1, '2026-03-31 08:40:00', '2026-03-01 09:10:00', '2026-03-31 08:40:00', NULL),
(3, 'scanner1@hackathon.local', '$2y$12$PYSFksU57OGtcEAG1BdGwercg/9m0ZY0Ggr2p2e8AG4ClXtKgDoHW', 'Front Desk Scanner 1', 'Front Desk', 'Scanner 1', 'scanner', 1, 1, 0, '2026-03-31 11:05:00', '2026-03-05 10:00:00', '2026-03-31 11:05:00', NULL),
(4, 'advisor@kku.ac.th', NULL, 'KKU SSO Advisor', 'Academic', 'Advisor', 'staff', 1, 0, 1, '2026-03-30 14:20:00', '2026-03-07 13:00:00', '2026-03-30 14:20:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `email_notification_templates`
--

CREATE TABLE `email_notification_templates` (
  `email_template_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสเทมเพลตอีเมล ใช้เป็น Primary Key ของตารางเทมเพลตการแจ้งเตือน',
  `form_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง form_definitions.form_id เพื่อบอกว่าเทมเพลตนี้ผูกกับฟอร์มใด',
  `notification_code` varchar(100) NOT NULL DEFAULT 'submission_confirmation' COMMENT 'รหัสประเภทการแจ้งเตือน เช่น submission_confirmation',
  `template_name` varchar(255) NOT NULL COMMENT 'ชื่อเทมเพลตอีเมลที่ใช้แสดงในหลังบ้าน',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'สถานะการใช้งานของเทมเพลตอีเมล 1=เปิดใช้งาน 0=ปิดใช้งาน',
  `send_to_field_usage` varchar(50) NOT NULL DEFAULT 'email' COMMENT 'ระบุว่าจะใช้อีเมลจากฟิลด์ที่มี field_usage ใด เช่น email',
  `email_subject_template` varchar(255) NOT NULL COMMENT 'เทมเพลตหัวข้ออีเมล สามารถใช้ placeholder สำหรับแทนค่าข้อมูลจริงได้',
  `email_body_template` longtext NOT NULL COMMENT 'เทมเพลตเนื้อหาอีเมล สามารถใช้ placeholder สำหรับแทนค่าข้อมูลจริง รายการของ และ QR code ได้',
  `include_item_summary` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'กำหนดว่าจะสรุปรายการของหรือสิทธิ์รับของลงในอีเมลนี้หรือไม่',
  `include_qr_codes` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'กำหนดว่าจะรวม QR code ของสิทธิ์รับของไว้ในอีเมลนี้หรือไม่',
  `created_by_user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ผู้ใช้ที่เป็นคนสร้างเทมเพลตอีเมลนี้ อ้างอิงไปยัง auth_users.user_id',
  `updated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ผู้ใช้ที่แก้ไขเทมเพลตอีเมลนี้ล่าสุด อ้างอิงไปยัง auth_users.user_id',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างเทมเพลตอีเมลนี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขเทมเพลตอีเมลนี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบเทมเพลตอีเมลแบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บเทมเพลตอีเมลแจ้งเตือนของแต่ละฟอร์ม เช่น อีเมลยืนยันหลังส่งฟอร์มพร้อมสรุปรายการของและ QR code';

--
-- Dumping data for table `email_notification_templates`
--

INSERT INTO `email_notification_templates` (`email_template_id`, `form_id`, `notification_code`, `template_name`, `is_active`, `send_to_field_usage`, `email_subject_template`, `email_body_template`, `include_item_summary`, `include_qr_codes`, `created_by_user_id`, `updated_by_user_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'submission_confirmation', 'Hackathon Submission Confirmation', 1, 'email', 'ยืนยันการลงทะเบียน {{form_name}} - {{submission_code}}', '<p>สวัสดี {{full_name}}</p><p>ระบบได้รับข้อมูลของคุณเรียบร้อยแล้วสำหรับฟอร์ม <strong>{{form_name}}</strong></p><p>Submission Code: <strong>{{submission_code}}</strong></p><p>รายการสิทธิ์รับของของคุณจะแสดงด้านล่าง และสามารถใช้ QR code ที่แนบมาเพื่อให้เจ้าหน้าที่สแกนตอนรับของได้</p><p>ขอบคุณที่เข้าร่วมกิจกรรม</p>', 1, 1, 2, 2, '2026-03-22 09:00:00', '2026-03-22 09:00:00', NULL),
(2, 2, 'submission_confirmation', 'Open House Registration Confirmation', 1, 'email', 'ยืนยันการลงทะเบียน Open House 2026 - {{submission_code}}', '<p>ขอบคุณ {{first_name}} {{last_name}}</p><p>ระบบได้รับการลงทะเบียนเข้าชมงาน Open House 2026 ของคุณเรียบร้อยแล้ว แล้วพบกันในงาน</p>', 0, 0, 1, 1, '2026-03-22 09:05:00', '2026-03-22 09:05:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `email_send_logs`
--

CREATE TABLE `email_send_logs` (
  `email_log_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัส log การส่งอีเมล ใช้เป็น Primary Key ของตารางบันทึกการส่งอีเมล',
  `email_template_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'อ้างอิงไปยัง email_notification_templates.email_template_id หากการส่งนี้เกิดจากเทมเพลตในระบบ',
  `form_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'อ้างอิงไปยัง form_definitions.form_id เพื่อบอกว่าการส่งอีเมลนี้เกี่ยวข้องกับฟอร์มใด',
  `submission_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'อ้างอิงไปยัง entry_submissions.submission_id เพื่อบอกว่าการส่งอีเมลนี้เกี่ยวข้องกับ submission ใด',
  `recipient_email` varchar(255) NOT NULL COMMENT 'อีเมลผู้รับจริงที่ระบบใช้ส่งข้อความนี้',
  `notification_code` varchar(100) DEFAULT NULL COMMENT 'รหัสประเภทการแจ้งเตือนของอีเมลที่ถูกส่ง เช่น submission_confirmation',
  `email_subject` varchar(255) DEFAULT NULL COMMENT 'หัวข้ออีเมลที่ถูกส่งจริงในครั้งนั้น',
  `send_status` varchar(50) NOT NULL DEFAULT 'queued' COMMENT 'สถานะการส่งอีเมล เช่น queued, sent, failed',
  `provider_message_id` varchar(255) DEFAULT NULL COMMENT 'รหัสข้อความที่ผู้ให้บริการอีเมลส่งกลับมา ใช้ตรวจสอบสถานะภายนอก',
  `error_message` text DEFAULT NULL COMMENT 'ข้อความผิดพลาดจากระบบหรือผู้ให้บริการอีเมล หากการส่งไม่สำเร็จ',
  `sent_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่อีเมลถูกส่งออกจริงสำเร็จ',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้าง log การส่งอีเมลนี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไข log การส่งอีเมลนี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบ log แบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บประวัติการส่งอีเมลจริงของระบบ เพื่อใช้ตรวจสอบย้อนหลังและ debug ปัญหาการส่งอีเมล';

--
-- Dumping data for table `email_send_logs`
--

INSERT INTO `email_send_logs` (`email_log_id`, `email_template_id`, `form_id`, `submission_id`, `recipient_email`, `notification_code`, `email_subject`, `send_status`, `provider_message_id`, `error_message`, `sent_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 1, 'siriporn@example.com', 'submission_confirmation', 'ยืนยันการลงทะเบียน Hackathon 2026 Day 1 Check-in - SUB-HACK26-0001', 'sent', 'smtp-msg-000001', NULL, '2026-07-03 08:12:45', '2026-07-03 08:12:34', '2026-07-03 08:12:45', NULL),
(2, 1, 1, 2, 'nattapon@example.com', 'submission_confirmation', 'ยืนยันการลงทะเบียน Hackathon 2026 Day 1 Check-in - SUB-HACK26-0002', 'sent', 'smtp-msg-000002', NULL, '2026-07-03 09:20:58', '2026-07-03 09:20:50', '2026-07-03 09:20:58', NULL),
(3, 2, 2, 3, 'ploy.sukanya@example.com', 'submission_confirmation', 'ยืนยันการลงทะเบียน Open House 2026 - SUB-OH26-0001', 'sent', 'smtp-msg-000003', NULL, '2026-08-10 10:05:30', '2026-08-10 10:05:16', '2026-08-10 10:05:30', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `entry_submissions`
--

CREATE TABLE `entry_submissions` (
  `submission_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสการส่งฟอร์ม ใช้เป็น Primary Key ของตารางการส่งคำตอบ',
  `form_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง form_definitions.form_id เพื่อบอกว่าการส่งคำตอบนี้เป็นของฟอร์มใด',
  `submission_code` varchar(100) NOT NULL COMMENT 'รหัสอ้างอิงภายในของการส่งฟอร์ม ใช้ค้นหา อ้างอิง และแสดงในหลังบ้าน',
  `submitted_by_user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ผู้ใช้หลังบ้านที่เป็นคนสร้าง submission นี้ กรณีบันทึกข้อมูลแทนผู้ใช้จากหน้า admin',
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่มีการส่งฟอร์มสำเร็จ',
  `attendance_status` varchar(50) NOT NULL DEFAULT 'submitted' COMMENT 'สถานะ attendance ของ submission นี้ เช่น submitted, present, absent, cancelled',
  `check_in_at` datetime DEFAULT NULL COMMENT 'วันเวลา check-in เข้างานจริงของ submission นี้ หากยังไม่เข้างานให้เป็น NULL',
  `check_out_at` datetime DEFAULT NULL COMMENT 'วันเวลา check-out ออกจากงานจริงของ submission นี้ หากยังไม่ใช้งานให้เป็น NULL',
  `source_type` varchar(50) NOT NULL DEFAULT 'public_form' COMMENT 'แหล่งที่มาของข้อมูล เช่น public_form, admin_created, qr_scan',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP Address ของผู้ใช้ตอนส่งฟอร์ม รองรับทั้ง IPv4 และ IPv6',
  `user_agent` text DEFAULT NULL COMMENT 'ค่า User-Agent ของอุปกรณ์หรือเบราว์เซอร์ที่ใช้ส่งฟอร์ม',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุเพิ่มเติมของ submission นี้ เช่น บันทึกโดยเจ้าหน้าที่หรือคำอธิบายภายใน',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างข้อมูล submission นี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขข้อมูล submission นี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบ submission แบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บหัวข้อมูลของการส่งฟอร์มแต่ละครั้ง รวมทั้งสถานะ attendance และเวลา check-in/check-out';

--
-- Dumping data for table `entry_submissions`
--

INSERT INTO `entry_submissions` (`submission_id`, `form_id`, `submission_code`, `submitted_by_user_id`, `submitted_at`, `attendance_status`, `check_in_at`, `check_out_at`, `source_type`, `ip_address`, `user_agent`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'SUB-HACK26-0001', NULL, '2026-07-03 08:12:33', 'present', '2026-07-03 08:45:10', NULL, 'public_form', '203.0.113.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.0.0', 'ผู้เข้าร่วมเดินทางมาถึงหน้างานตรงเวลา', '2026-07-03 08:12:33', '2026-07-03 08:45:10', NULL),
(2, 1, 'SUB-HACK26-0002', NULL, '2026-07-03 09:20:45', 'present', '2026-04-26 11:17:08', NULL, 'public_form', '203.0.113.11', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', NULL, '2026-07-03 09:20:45', '2026-04-26 18:17:08', NULL),
(3, 2, 'SUB-OH26-0001', NULL, '2026-08-10 10:05:15', 'submitted', NULL, NULL, 'public_form', '203.0.113.50', 'Mozilla/5.0 (Linux; Android 15)', 'ลงทะเบียนเข้าชมงานล่วงหน้า', '2026-08-10 10:05:15', '2026-08-10 10:05:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `entry_submission_answers`
--

CREATE TABLE `entry_submission_answers` (
  `answer_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสคำตอบ ใช้เป็น Primary Key ของตารางคำตอบรายฟิลด์',
  `submission_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง entry_submissions.submission_id เพื่อบอกว่าคำตอบนี้เป็นของการส่งฟอร์มใด',
  `field_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง form_fields.field_id เพื่อบอกว่าคำตอบนี้เป็นของฟิลด์ใด',
  `answer_text` longtext DEFAULT NULL COMMENT 'ค่าคำตอบแบบข้อความ ใช้กับ short_text, long_text หรือกรณีเก็บค่าพิเศษเพิ่มเติม',
  `answer_number` decimal(15,4) DEFAULT NULL COMMENT 'ค่าคำตอบแบบตัวเลข ใช้กับ rating หรือคำตอบเชิงตัวเลขที่ระบบแปลงเก็บแยกไว้',
  `answer_date` date DEFAULT NULL COMMENT 'ค่าคำตอบแบบวันที่ ใช้กับฟิลด์ประเภท date',
  `answer_time` time DEFAULT NULL COMMENT 'ค่าคำตอบแบบเวลา ใช้กับฟิลด์ประเภท time',
  `selected_option_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ตัวเลือกที่ถูกเลือก ใช้กับฟิลด์ประเภท multiple_choice หรือ dropdown',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างข้อมูลคำตอบนี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขข้อมูลคำตอบนี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบคำตอบแบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บคำตอบรายฟิลด์ของแต่ละ submission โดยแยกคอลัมน์ตามชนิดข้อมูลที่ระบบรองรับ';

--
-- Dumping data for table `entry_submission_answers`
--

INSERT INTO `entry_submission_answers` (`answer_id`, `submission_id`, `field_id`, `answer_text`, `answer_number`, `answer_date`, `answer_time`, `selected_option_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, NULL, NULL, NULL, NULL, 2, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(2, 1, 2, 'นางสาว ศิริพร ใจดี', NULL, NULL, NULL, NULL, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(3, 1, 3, 'siriporn@example.com', NULL, NULL, NULL, NULL, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(4, 1, 4, '0891112222', NULL, NULL, NULL, NULL, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(5, 1, 5, 'มหาวิทยาลัยขอนแก่น', NULL, NULL, NULL, NULL, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(6, 1, 6, NULL, NULL, '2004-05-17', NULL, NULL, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(7, 1, 7, NULL, NULL, NULL, NULL, 5, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(8, 1, 8, NULL, NULL, NULL, NULL, NULL, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(9, 1, 9, NULL, NULL, NULL, '08:30:00', NULL, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(10, 1, 10, NULL, 4.0000, NULL, NULL, NULL, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(11, 1, 11, 'แพ้อาหารทะเล และต้องการอาหารฮาลาลหากมี', NULL, NULL, NULL, NULL, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(12, 1, 12, NULL, NULL, NULL, NULL, NULL, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(13, 2, 1, NULL, NULL, NULL, NULL, 3, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(14, 2, 2, 'Mr. Nattapon Deechai', NULL, NULL, NULL, NULL, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(15, 2, 3, 'nattapon@example.com', NULL, NULL, NULL, NULL, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(16, 2, 4, '0812345678', NULL, NULL, NULL, NULL, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(17, 2, 5, 'Khon Kaen University', NULL, NULL, NULL, NULL, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(18, 2, 6, NULL, NULL, '2003-10-02', NULL, NULL, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(19, 2, 7, NULL, NULL, NULL, NULL, 6, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(20, 2, 8, NULL, NULL, NULL, NULL, NULL, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(21, 2, 9, NULL, NULL, NULL, '13:15:00', NULL, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(22, 2, 10, NULL, 2.0000, NULL, NULL, NULL, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(23, 2, 11, 'ต้องการติดต่อทีมงานเรื่องข้อมูลจอดรถ', NULL, NULL, NULL, NULL, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(24, 2, 12, NULL, NULL, NULL, NULL, NULL, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(25, 3, 13, 'Ploy', NULL, NULL, NULL, NULL, '2026-08-10 10:05:15', '2026-08-10 10:05:15', NULL),
(26, 3, 14, 'Sukanya', NULL, NULL, NULL, NULL, '2026-08-10 10:05:15', '2026-08-10 10:05:15', NULL),
(27, 3, 15, 'ploy.sukanya@example.com', NULL, NULL, NULL, NULL, '2026-08-10 10:05:15', '2026-08-10 10:05:15', NULL),
(28, 3, 16, '19', NULL, NULL, NULL, NULL, '2026-08-10 10:05:15', '2026-08-10 10:05:15', NULL),
(29, 3, 17, NULL, NULL, '2026-08-11', NULL, NULL, '2026-08-10 10:05:15', '2026-08-10 10:05:15', NULL),
(30, 3, 18, NULL, NULL, NULL, NULL, 11, '2026-08-10 10:05:15', '2026-08-10 10:05:15', NULL),
(31, 3, 19, 'สนใจรายละเอียดหลักสูตรและโอกาสฝึกงาน', NULL, NULL, NULL, NULL, '2026-08-10 10:05:15', '2026-08-10 10:05:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `entry_submission_answer_options`
--

CREATE TABLE `entry_submission_answer_options` (
  `answer_option_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสรายการตัวเลือกที่ถูกเลือก ใช้เป็น Primary Key ของตารางคำตอบแบบหลายตัวเลือก',
  `answer_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง entry_submission_answers.answer_id เพื่อบอกว่ารายการนี้เป็นของคำตอบใด',
  `option_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง form_field_options.option_id เพื่อบอกว่าผู้ใช้เลือกตัวเลือกใด',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างข้อมูลการเลือกตัวเลือกนี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขข้อมูลการเลือกตัวเลือกนี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบข้อมูลแบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บตัวเลือกที่ถูกเลือกจริงของฟิลด์ประเภท checkboxes ซึ่งเลือกได้หลายค่า';

--
-- Dumping data for table `entry_submission_answer_options`
--

INSERT INTO `entry_submission_answer_options` (`answer_option_id`, `answer_id`, `option_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 8, 7, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(2, 8, 9, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
(3, 20, 8, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
(4, 20, 10, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `entry_submission_files`
--

CREATE TABLE `entry_submission_files` (
  `answer_file_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสไฟล์แนบของคำตอบ ใช้เป็น Primary Key ของตารางไฟล์ที่ผู้ใช้อัปโหลด',
  `answer_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง entry_submission_answers.answer_id เพื่อบอกว่าไฟล์นี้เป็นของคำตอบใด',
  `original_file_name` varchar(255) NOT NULL COMMENT 'ชื่อไฟล์เดิมตอนที่ผู้ใช้อัปโหลดเข้ามา',
  `stored_file_name` varchar(255) NOT NULL COMMENT 'ชื่อไฟล์ที่ระบบใช้จัดเก็บจริงใน storage เพื่อป้องกันชื่อซ้ำกัน',
  `storage_disk` varchar(100) NOT NULL DEFAULT 'local' COMMENT 'ชื่อ disk หรือประเภท storage ที่ใช้เก็บไฟล์ เช่น local, s3, cloud',
  `storage_path` varchar(500) NOT NULL COMMENT 'path หรือ key ที่ใช้เก็บไฟล์จริงในระบบ storage',
  `mime_type` varchar(150) DEFAULT NULL COMMENT 'ประเภท MIME ของไฟล์ เช่น application/pdf หรือ image/png',
  `file_extension` varchar(20) DEFAULT NULL COMMENT 'นามสกุลไฟล์ เช่น pdf, jpg, png',
  `file_size_bytes` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ขนาดไฟล์เป็นหน่วย bytes ใช้ตรวจสอบข้อจำกัดหรือแสดงข้อมูลในหลังบ้าน',
  `checksum_sha256` char(64) DEFAULT NULL COMMENT 'ค่า SHA-256 ของไฟล์ ใช้ตรวจสอบความถูกต้องหรือกันไฟล์ซ้ำหากต้องการ',
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่ไฟล์ถูกอัปโหลดเข้าสู่ระบบ',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างข้อมูลไฟล์แนบนี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขข้อมูลไฟล์แนบนี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบไฟล์แนบแบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บข้อมูลไฟล์แนบของฟิลด์ประเภท file_upload โดยแยกจากคำตอบหลักเพื่อรองรับหลายไฟล์ต่อหนึ่งคำตอบ';

--
-- Dumping data for table `entry_submission_files`
--

INSERT INTO `entry_submission_files` (`answer_file_id`, `answer_id`, `original_file_name`, `stored_file_name`, `storage_disk`, `storage_path`, `mime_type`, `file_extension`, `file_size_bytes`, `checksum_sha256`, `uploaded_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 12, 'student_card_siriporn.pdf', '20260703_081233_sub1_doc1.pdf', 'local', 'uploads/forms/HACK26_DAY1_CHECKIN/submissions/SUB-HACK26-0001/20260703_081233_sub1_doc1.pdf', 'application/pdf', 'pdf', 524288, '0d5e4c9078fae6f83f9a6ef1a5d8474e63f39f1c56895d57d8d6807cc8d4f7aa', '2026-07-03 08:12:40', '2026-07-03 08:12:40', '2026-07-03 08:12:40', NULL),
(2, 24, 'student_card_nattapon.png', '20260703_092045_sub2_doc1.png', 'local', 'uploads/forms/HACK26_DAY1_CHECKIN/submissions/SUB-HACK26-0002/20260703_092045_sub2_doc1.png', 'image/png', 'png', 314572, '9fd3430a6a3f66cb863e2d97e0ce889db7f3e2cfafcaa509f6c1dd6dbf66baf7', '2026-07-03 09:20:55', '2026-07-03 09:20:55', '2026-07-03 09:20:55', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `form_fields`
--

CREATE TABLE `form_fields` (
  `field_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสฟิลด์ของฟอร์ม ใช้เป็น Primary Key ของตารางคำถามหรือฟิลด์',
  `form_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง form_definitions.form_id เพื่อบอกว่าฟิลด์นี้อยู่ในฟอร์มใด',
  `field_code` varchar(100) NOT NULL COMMENT 'รหัสอ้างอิงภายในของฟิลด์ ใช้เชื่อมกับระบบหลังบ้านหรือ export ข้อมูล',
  `field_label` varchar(255) NOT NULL COMMENT 'ชื่อฟิลด์หรือข้อความคำถามหลักที่ผู้ใช้จะมองเห็นบนแบบฟอร์ม',
  `field_description` text DEFAULT NULL COMMENT 'คำอธิบายเพิ่มเติมใต้ชื่อฟิลด์ ใช้ช่วยอธิบายวิธีกรอกข้อมูลโดยไม่กระทบค่าที่เก็บจริง',
  `placeholder` varchar(255) DEFAULT NULL COMMENT 'ข้อความตัวอย่างในช่องกรอกข้อมูล ใช้ช่วยแนะนำผู้กรอกฟอร์ม',
  `field_type` varchar(50) NOT NULL COMMENT 'ประเภทของฟิลด์ เช่น short_text, long_text, multiple_choice, checkboxes, dropdown, rating, date, time, file_upload',
  `field_usage` varchar(50) NOT NULL DEFAULT 'general' COMMENT 'บทบาทการใช้งานของฟิลด์ เช่น general, full_name, first_name, last_name, email, phone, student_code, birth_date',
  `is_required` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'กำหนดว่าฟิลด์นี้บังคับกรอกหรือไม่ 1=บังคับ 0=ไม่บังคับ',
  `is_unique_value` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'กำหนดว่าค่าของฟิลด์นี้ห้ามซ้ำกันภายในฟอร์มหรือไม่ เช่น email หรือ student_code',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT 'ลำดับการแสดงผลของฟิลด์ในฟอร์ม ค่าน้อยจะแสดงก่อน',
  `allow_other_option` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'กำหนดว่าฟิลด์ประเภทตัวเลือกอนุญาตให้มีตัวเลือก Other ให้ผู้ใช้พิมพ์เองหรือไม่',
  `settings_json` longtext DEFAULT NULL COMMENT 'เก็บการตั้งค่าเพิ่มเติมของฟิลด์ในรูปแบบ JSON เช่น validation, numeric_only, min/max, allowed_file_types, max_file_size_mb',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'สถานะการใช้งานของฟิลด์ 1=ใช้งานได้ 0=ปิดการใช้งาน',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างฟิลด์นี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขฟิลด์นี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบฟิลด์แบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บโครงสร้างฟิลด์หรือคำถามของแต่ละฟอร์ม รวมทั้งชนิดข้อมูลและคำอธิบายการกรอก';

--
-- Dumping data for table `form_fields`
--

INSERT INTO `form_fields` (`field_id`, `form_id`, `field_code`, `field_label`, `field_description`, `placeholder`, `field_type`, `field_usage`, `is_required`, `is_unique_value`, `sort_order`, `allow_other_option`, `settings_json`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'prefix', 'คำนำหน้า', 'เลือกคำนำหน้าชื่อของผู้เข้าร่วม', 'เช่น นาย, นางสาว, Mr., Ms.', 'dropdown', 'general', 1, 0, 1, 0, '{}', 1, '2026-03-18 09:00:00', '2026-04-26 14:44:56', NULL),
(2, 1, 'full_name', 'ชื่อ-นามสกุล', 'กรุณากรอกชื่อจริงและนามสกุลตามที่ใช้ในเอกสารทางการ สามารถกรอกเป็นภาษาไทยหรืออังกฤษได้', 'เช่น สมชาย ใจดี', 'short_text', 'full_name', 1, 0, 2, 0, '{}', 1, '2026-03-18 09:02:00', '2026-04-26 14:44:56', NULL),
(3, 1, 'email_address', 'อีเมล', 'ใช้อีเมลนี้สำหรับส่งอีเมลยืนยัน สิทธิ์รับของ และ QR code', 'example@email.com', 'short_text', 'email', 1, 1, 3, 0, '{}', 1, '2026-03-18 09:05:00', '2026-04-26 14:44:56', NULL),
(4, 1, 'phone_number', 'เบอร์โทรศัพท์', 'กรอกหมายเลขที่ติดต่อได้สะดวก', '08xxxxxxxx', 'short_text', 'phone', 1, 0, 4, 0, '{}', 1, '2026-03-18 09:06:00', '2026-04-26 14:44:56', NULL),
(5, 1, 'university_name', 'มหาวิทยาลัย', 'กรอกชื่อมหาวิทยาลัยหรือสถาบันของคุณ', 'เช่น มหาวิทยาลัยขอนแก่น', 'short_text', 'general', 1, 0, 5, 0, '{}', 1, '2026-03-18 09:07:00', '2026-04-26 14:44:56', NULL),
(6, 1, 'birth_date', 'วันเกิด', 'ใช้สำหรับยืนยันตัวตนเพิ่มเติมหากจำเป็น', NULL, 'date', 'birth_date', 0, 0, 6, 0, '{}', 1, '2026-03-18 09:08:00', '2026-04-26 14:44:56', NULL),
(7, 1, 'checkin_round', 'รอบการเข้าร่วม', 'เลือกช่วงเวลาที่คุณจะเข้าร่วมกิจกรรมในวันแรก', NULL, 'multiple_choice', 'general', 1, 0, 7, 0, '{}', 1, '2026-03-18 09:09:00', '2026-04-26 14:44:56', NULL),
(8, 1, 'interest_topics', 'หัวข้อที่สนใจ', 'เลือกได้มากกว่า 1 ข้อ เพื่อใช้วางแผนกิจกรรมและสรุปภาพรวมความสนใจของผู้เข้าร่วม', NULL, 'checkboxes', 'general', 0, 0, 8, 1, '{}', 1, '2026-03-18 09:10:00', '2026-04-26 14:44:56', NULL),
(9, 1, 'arrival_time', 'เวลาที่คาดว่าจะมาถึง', 'ใช้เพื่อช่วยจัดการคิวลงทะเบียนหน้างาน', '08:30', 'time', 'general', 0, 0, 9, 0, '{}', 1, '2026-03-18 09:11:00', '2026-04-26 14:44:56', NULL),
(10, 1, 'event_experience_rating', 'ระดับประสบการณ์ด้าน Hackathon', 'ให้คะแนนประสบการณ์ของคุณตั้งแต่ 1 ถึง 5', NULL, 'rating', 'general', 0, 0, 10, 0, '{\"rating_min\":1,\"rating_max\":5}', 1, '2026-03-18 09:12:00', '2026-04-26 14:44:56', NULL),
(11, 1, 'notes', 'หมายเหตุเพิ่มเติม', 'หากมีข้อมูลพิเศษ เช่น ข้อจำกัดด้านอาหาร หรือความต้องการพิเศษ สามารถกรอกได้ที่นี่', 'เช่น แพ้อาหารทะเล', 'long_text', 'general', 0, 0, 11, 0, '{}', 1, '2026-03-18 09:13:00', '2026-04-26 14:44:56', NULL),
(12, 1, 'student_document', 'เอกสารประกอบ', 'อัปโหลดไฟล์ยืนยันตัวตน เช่น บัตรนักศึกษา หรือหนังสือรับรอง โดยอนุญาตไฟล์ PDF, JPG, PNG', NULL, 'file_upload', 'general', 0, 0, 12, 0, '{\"max_file_size_mb\":10,\"max_file_count\":2,\"allowed_file_types\":[\"pdf\",\"jpg\",\"jpeg\",\"png\"]}', 1, '2026-03-18 09:14:00', '2026-04-26 14:44:56', NULL),
(13, 2, 'first_name', 'ชื่อจริง', 'กรุณากรอกชื่อจริงของผู้ลงทะเบียน', 'เช่น Somchai', 'short_text', 'first_name', 1, 0, 1, 0, '{\"min_length\":2,\"max_length\":150}', 1, '2026-03-18 10:00:00', '2026-03-18 10:00:00', NULL),
(14, 2, 'last_name', 'นามสกุล', 'กรุณากรอกนามสกุลของผู้ลงทะเบียน', 'เช่น Jaidee', 'short_text', 'last_name', 1, 0, 2, 0, '{\"min_length\":2,\"max_length\":150}', 1, '2026-03-18 10:01:00', '2026-03-18 10:01:00', NULL),
(15, 2, 'email_address', 'อีเมล', 'ใช้สำหรับส่งอีเมลยืนยันการลงทะเบียน', 'visitor@email.com', 'short_text', 'email', 1, 1, 3, 0, '{\"validation\":\"email\"}', 1, '2026-03-18 10:02:00', '2026-03-18 10:02:00', NULL),
(16, 2, 'age', 'อายุ', 'กรอกเป็นตัวเลขจำนวนเต็ม', 'เช่น 19', 'short_text', 'general', 0, 0, 4, 0, '{\"numeric_only\":true,\"max_length\":3}', 1, '2026-03-18 10:03:00', '2026-03-18 10:03:00', NULL),
(17, 2, 'visit_date', 'วันที่จะเข้าชมงาน', 'เลือกวันที่ต้องการเข้าร่วมงาน Open House', NULL, 'date', 'general', 1, 0, 5, 0, NULL, 1, '2026-03-18 10:04:00', '2026-03-18 10:04:00', NULL),
(18, 2, 'interested_zone', 'โซนที่สนใจ', 'เลือกโซนที่อยากเข้าชมมากที่สุด', NULL, 'dropdown', 'general', 1, 0, 6, 0, NULL, 1, '2026-03-18 10:05:00', '2026-03-18 10:05:00', NULL),
(19, 2, 'feedback', 'คำถามเพิ่มเติม', 'ฝากคำถามไว้ล่วงหน้าเพื่อให้ทีมงานเตรียมข้อมูลได้', 'เช่น อยากทราบเรื่องทุนการศึกษา', 'long_text', 'general', 0, 0, 7, 0, '{\"max_length\":1500}', 1, '2026-03-18 10:06:00', '2026-03-18 10:06:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `form_field_options`
--

CREATE TABLE `form_field_options` (
  `option_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสตัวเลือกของฟิลด์ ใช้เป็น Primary Key ของตารางตัวเลือก',
  `field_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง form_fields.field_id เพื่อบอกว่าตัวเลือกนี้เป็นของฟิลด์ใด',
  `option_label` varchar(255) NOT NULL COMMENT 'ข้อความตัวเลือกที่จะแสดงให้ผู้ใช้เห็นบนฟอร์ม',
  `option_value` varchar(255) NOT NULL COMMENT 'ค่าภายในของตัวเลือก ใช้เก็บหรืออ้างอิงในระบบ อาจเหมือนหรือไม่เหมือนข้อความแสดงผลก็ได้',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT 'ลำดับการแสดงผลของตัวเลือก ค่าน้อยจะแสดงก่อน',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'สถานะการใช้งานของตัวเลือก 1=ใช้งานได้ 0=ปิดการใช้งาน',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างตัวเลือกนี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขตัวเลือกนี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบตัวเลือกแบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บตัวเลือกของฟิลด์ประเภท multiple_choice, checkboxes และ dropdown';

--
-- Dumping data for table `form_field_options`
--

INSERT INTO `form_field_options` (`option_id`, `field_id`, `option_label`, `option_value`, `sort_order`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'นาย', 'mr_th', 1, 1, '2026-03-18 11:00:00', '2026-03-18 11:00:00', NULL),
(2, 1, 'นางสาว', 'ms_th', 2, 1, '2026-03-18 11:00:00', '2026-03-18 11:00:00', NULL),
(3, 1, 'Mr.', 'mr_en', 3, 1, '2026-03-18 11:00:00', '2026-03-18 11:00:00', NULL),
(4, 1, 'Ms.', 'ms_en', 4, 1, '2026-03-18 11:00:00', '2026-03-18 11:00:00', NULL),
(5, 7, 'รอบเช้า', 'morning', 1, 1, '2026-03-18 11:05:00', '2026-03-18 11:05:00', NULL),
(6, 7, 'รอบบ่าย', 'afternoon', 2, 1, '2026-03-18 11:05:00', '2026-03-18 11:05:00', NULL),
(7, 8, 'AI', 'ai', 1, 1, '2026-03-18 11:10:00', '2026-03-18 11:10:00', NULL),
(8, 8, 'IoT', 'iot', 2, 1, '2026-03-18 11:10:00', '2026-03-18 11:10:00', NULL),
(9, 8, 'Health Tech', 'health_tech', 3, 1, '2026-03-18 11:10:00', '2026-03-18 11:10:00', NULL),
(10, 8, 'Smart Living', 'smart_living', 4, 1, '2026-03-18 11:10:00', '2026-03-18 11:10:00', NULL),
(11, 18, 'AI & Data Science', 'ai_data_science', 1, 1, '2026-03-18 11:20:00', '2026-03-18 11:20:00', NULL),
(12, 18, 'Software Engineering', 'software_engineering', 2, 1, '2026-03-18 11:20:00', '2026-03-18 11:20:00', NULL),
(13, 18, 'Cybersecurity', 'cybersecurity', 3, 1, '2026-03-18 11:20:00', '2026-03-18 11:20:00', NULL),
(14, 18, 'Digital Media', 'digital_media', 4, 1, '2026-03-18 11:20:00', '2026-03-18 11:20:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `form_forms`
--

CREATE TABLE `form_forms` (
  `form_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสฟอร์ม ใช้เป็น Primary Key ของตารางฟอร์ม',
  `project_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง proj_projects.project_id เพื่อบอกว่าฟอร์มนี้อยู่ภายใต้โปรเจกต์ใด',
  `form_code` varchar(100) NOT NULL COMMENT 'รหัสอ้างอิงภายในของฟอร์ม ใช้เรียกจากระบบหรืออ้างอิงในงานพัฒนา',
  `form_name` varchar(255) NOT NULL COMMENT 'ชื่อฟอร์มที่ใช้แสดงในระบบหลังบ้านและหน้า public form',
  `public_path` varchar(255) NOT NULL COMMENT 'ข้อความที่ใช้เป็น public path ของฟอร์ม เช่น checkin-day-1 แทนคำว่า slug',
  `form_type` varchar(50) NOT NULL DEFAULT 'attendance' COMMENT 'ประเภทของฟอร์ม เช่น attendance, pickup, registration, custom',
  `status` varchar(50) NOT NULL DEFAULT 'draft' COMMENT 'สถานะของฟอร์ม เช่น draft, published, closed',
  `allow_multiple_submissions` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'กำหนดว่าฟอร์มนี้อนุญาตให้ผู้ใช้ส่งคำตอบซ้ำได้หลายครั้งหรือไม่',
  `start_at` datetime DEFAULT NULL COMMENT 'วันเวลาเริ่มเปิดให้ใช้งานฟอร์ม หากเป็น NULL แปลว่ายังไม่กำหนดเวลาเริ่ม',
  `end_at` datetime DEFAULT NULL COMMENT 'วันเวลาสิ้นสุดการเปิดฟอร์ม หากเป็น NULL แปลว่ายังไม่กำหนดเวลาปิด',
  `success_title` varchar(255) DEFAULT NULL COMMENT 'หัวข้อข้อความที่จะแสดงหลังผู้ใช้ส่งฟอร์มสำเร็จ',
  `success_message` text DEFAULT NULL COMMENT 'ข้อความรายละเอียดที่จะแสดงหลังผู้ใช้ส่งฟอร์มสำเร็จ',
  `settings_json` longtext DEFAULT NULL COMMENT 'เก็บการตั้งค่าเพิ่มเติมของฟอร์มในรูปแบบ JSON เช่น theme, submit rules, display settings',
  `created_by_user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ผู้ใช้ที่เป็นคนสร้างฟอร์มนี้ อ้างอิงไปยัง auth_users.user_id',
  `updated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ผู้ใช้ที่แก้ไขฟอร์มนี้ล่าสุด อ้างอิงไปยัง auth_users.user_id',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างฟอร์มนี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขฟอร์มนี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบฟอร์มแบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บข้อมูลฟอร์มแต่ละตัวที่อยู่ภายใต้โปรเจกต์ และใช้กำหนดสถานะการเปิดใช้งานของฟอร์ม';

--
-- Dumping data for table `form_forms`
--

INSERT INTO `form_forms` (`form_id`, `project_id`, `form_code`, `form_name`, `public_path`, `form_type`, `status`, `allow_multiple_submissions`, `start_at`, `end_at`, `success_title`, `success_message`, `settings_json`, `created_by_user_id`, `updated_by_user_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'HACK26_DAY1_CHECKIN', 'Hackathon 2026 Day 1 Check-in', 'hackathon-2026-day1-checkin', 'attendance', 'published', 0, '2026-04-01 00:00:00', '2026-07-03 11:00:00', 'ส่งข้อมูลสำเร็จ', 'ขอบคุณสำหรับการลงทะเบียน ระบบได้บันทึกข้อมูลของคุณแล้ว และจะส่งอีเมลยืนยันพร้อมสิทธิ์รับของให้ทางอีเมลที่กรอกไว้', '{\"show_progress_bar\":true,\"auto_create_item_claims\":true,\"allow_qr_checkin\":true,\"form_description\":\"\",\"share_key\":\"tk310bzaug\"}', 2, 2, '2026-03-15 09:00:00', '2026-04-26 20:42:56', NULL),
(2, 2, 'OPENHOUSE26_VISITOR_REG', 'Open House 2026 Visitor Registration', 'openhouse-2026-visitor-registration', 'registration', 'published', 1, '2026-04-01 08:00:00', '2026-08-12 17:00:00', 'ลงทะเบียนสำเร็จ', 'ระบบได้รับข้อมูลการลงทะเบียนของคุณเรียบร้อยแล้ว แล้วพบกันในงาน Open House 2026', '{\"show_progress_bar\":false,\"auto_create_item_claims\":false}', 1, 1, '2026-03-16 10:00:00', '2026-04-26 20:43:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `item_catalogs`
--

CREATE TABLE `item_catalogs` (
  `item_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสรายการของหรือสิทธิ์รับของ ใช้เป็น Primary Key ของตารางรายการของ',
  `form_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง form_definitions.form_id เพื่อบอกว่ารายการของนี้ผูกกับฟอร์มใด',
  `item_code` varchar(100) NOT NULL COMMENT 'รหัสอ้างอิงภายในของรายการของ ใช้ค้นหา อ้างอิง และเชื่อมกับระบบอื่น',
  `item_name` varchar(255) NOT NULL COMMENT 'ชื่อรายการของหรือสิทธิ์ เช่น Lunch Box, Souvenir, T-Shirt',
  `item_type` varchar(50) NOT NULL DEFAULT 'reward' COMMENT 'ประเภทของรายการของ เช่น reward, meal, souvenir, badge',
  `description` text DEFAULT NULL COMMENT 'คำอธิบายเพิ่มเติมเกี่ยวกับรายการของหรือเงื่อนไขการรับ',
  `default_qty` int(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'จำนวนเริ่มต้นของสิทธิ์หรือจำนวนชิ้นที่ควรได้รับต่อหนึ่ง claim',
  `issue_qr_code` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'กำหนดว่ารายการของนี้ต้องออก QR code สำหรับการสแกนรับของหรือไม่',
  `include_in_confirmation_email` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'กำหนดว่ารายการของนี้จะแสดงในอีเมลยืนยันหลังส่งฟอร์มหรือไม่',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT 'ลำดับการแสดงผลของรายการของ ค่าน้อยจะแสดงก่อน',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'สถานะการใช้งานของรายการของ 1=ใช้งานได้ 0=ปิดการใช้งาน',
  `created_by_user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ผู้ใช้ที่เป็นคนสร้างรายการของนี้ อ้างอิงไปยัง auth_users.user_id',
  `updated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ผู้ใช้ที่แก้ไขรายการของนี้ล่าสุด อ้างอิงไปยัง auth_users.user_id',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างรายการของนี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขรายการของนี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบรายการของแบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บรายการของหรือสิทธิ์รับของที่ผูกกับฟอร์ม เช่น ข้าวกลางวัน ของที่ระลึก หรือเสื้อ';

--
-- Dumping data for table `item_catalogs`
--

INSERT INTO `item_catalogs` (`item_id`, `form_id`, `item_code`, `item_name`, `item_type`, `description`, `default_qty`, `issue_qr_code`, `include_in_confirmation_email`, `sort_order`, `is_active`, `created_by_user_id`, `updated_by_user_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'LUNCH_BOX', 'Lunch Box', 'meal', 'สิทธิ์รับข้าวกลางวันสำหรับผู้เข้าร่วมงานวันที่ 1', 1, 1, 1, 1, 1, 2, 2, '2026-03-20 09:00:00', '2026-03-20 09:00:00', NULL),
(2, 1, 'SOUVENIR_BAG', 'Souvenir Bag', 'souvenir', 'ของที่ระลึกสำหรับผู้ที่ลงทะเบียนและยืนยันตัวตนเรียบร้อย', 1, 1, 1, 2, 1, 2, 2, '2026-03-20 09:05:00', '2026-03-20 09:05:00', NULL),
(3, 1, 'EVENT_TSHIRT', 'Event T-Shirt', 'reward', 'เสื้อที่ระลึกสำหรับผู้เข้าร่วมกิจกรรม', 1, 1, 1, 3, 1, 2, 2, '2026-03-20 09:10:00', '2026-03-20 09:10:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `item_claims`
--

CREATE TABLE `item_claims` (
  `claim_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสสิทธิ์รับของ ใช้เป็น Primary Key ของตารางการรับของ',
  `submission_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง entry_submissions.submission_id เพื่อบอกว่าสิทธิ์นี้เป็นของผู้ส่งฟอร์มคนใด',
  `item_id` bigint(20) UNSIGNED NOT NULL COMMENT 'อ้างอิงไปยัง item_definitions.item_id เพื่อบอกว่าสิทธิ์นี้เป็นของรายการใด',
  `claim_token` varchar(255) NOT NULL COMMENT 'โทเคนสำหรับสร้าง QR code ของสิทธิ์รับของนี้ ใช้ให้ admin scan แล้วเปลี่ยนสถานะเป็นรับแล้ว',
  `receive_status` varchar(50) NOT NULL DEFAULT 'pending' COMMENT 'สถานะการรับของ เช่น pending, received, cancelled, expired',
  `qr_issued_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ระบบออก QR code หรือโทเคนสำหรับสิทธิ์นี้',
  `received_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่มีการสแกนหรือยืนยันว่ารับของแล้ว',
  `received_by_user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ผู้ใช้ระบบที่เป็นคนสแกนหรือยืนยันการรับของ อ้างอิงไปยัง auth_users.user_id',
  `qty` int(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'จำนวนชิ้นที่ผู้ใช้มีสิทธิ์ได้รับสำหรับรายการนี้',
  `notes` text DEFAULT NULL COMMENT 'หมายเหตุเพิ่มเติมเกี่ยวกับการรับของ เช่น สภาพการรับหรือเหตุผลที่ยกเลิก',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างสิทธิ์รับของนี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขสิทธิ์รับของนี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบสิทธิ์รับของแบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บสิทธิ์รับของของแต่ละ submission รวมทั้งโทเคน QR และสถานะการรับของจริง';

--
-- Dumping data for table `item_claims`
--

INSERT INTO `item_claims` (`claim_id`, `submission_id`, `item_id`, `claim_token`, `receive_status`, `qr_issued_at`, `received_at`, `received_by_user_id`, `qty`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'CLAIM-HACK26-SUB1-LUNCH-001', 'received', '2026-07-03 08:12:35', '2026-07-03 11:00:12', 3, 1, 'สแกนรับข้าวกลางวันแล้วที่จุดบริการหน้า Hall A', '2026-07-03 08:12:35', '2026-07-03 11:00:12', NULL),
(2, 1, 2, 'CLAIM-HACK26-SUB1-SOUVENIR-001', 'pending', '2026-07-03 08:12:35', NULL, NULL, 1, 'ยังไม่ได้มารับของที่ระลึก', '2026-07-03 08:12:35', '2026-07-03 08:12:35', NULL),
(3, 1, 3, 'CLAIM-HACK26-SUB1-TSHIRT-001', 'pending', '2026-07-03 08:12:35', NULL, NULL, 1, 'รอรับเสื้อที่จุดแจกของหลัง check-in', '2026-07-03 08:12:35', '2026-07-03 08:12:35', NULL),
(4, 2, 1, 'CLAIM-HACK26-SUB2-LUNCH-001', 'pending', '2026-07-03 09:20:50', NULL, NULL, 1, 'ผู้เข้าร่วมยังไม่ถูกสแกน check-in', '2026-07-03 09:20:50', '2026-07-03 09:20:50', NULL),
(5, 2, 2, 'CLAIM-HACK26-SUB2-SOUVENIR-001', 'pending', '2026-07-03 09:20:50', NULL, NULL, 1, NULL, '2026-07-03 09:20:50', '2026-07-03 09:20:50', NULL),
(6, 2, 3, 'CLAIM-HACK26-SUB2-TSHIRT-001', 'pending', '2026-07-03 09:20:50', NULL, NULL, 1, NULL, '2026-07-03 09:20:50', '2026-07-03 09:20:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `proj_projects`
--

CREATE TABLE `proj_projects` (
  `project_id` bigint(20) UNSIGNED NOT NULL COMMENT 'รหัสโปรเจกต์หรือเจ้าของฟอร์ม ใช้เป็น Primary Key ของตารางโปรเจกต์',
  `project_code` varchar(100) NOT NULL COMMENT 'รหัสอ้างอิงภายในของโปรเจกต์ ใช้เรียกใช้งานหรืออ้างอิงจากระบบอื่น',
  `project_name` varchar(255) NOT NULL COMMENT 'ชื่อโปรเจกต์ งาน หรือเว็บไซต์ที่เป็นเจ้าของฟอร์มชุดนี้',
  `project_type` varchar(50) NOT NULL DEFAULT 'event' COMMENT 'ประเภทของโปรเจกต์ เช่น event, website, organization',
  `source_url` varchar(500) DEFAULT NULL COMMENT 'URL หลักของเว็บไซต์หรือแหล่งอ้างอิงของโปรเจกต์ หากมี',
  `description` text DEFAULT NULL COMMENT 'คำอธิบายเพิ่มเติมเกี่ยวกับโปรเจกต์หรือขอบเขตการใช้งาน',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'สถานะการใช้งานของโปรเจกต์ 1=ใช้งานได้ 0=ปิดการใช้งาน',
  `created_by_user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ผู้ใช้ที่เป็นคนสร้างโปรเจกต์นี้ อ้างอิงไปยัง auth_users.user_id',
  `updated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ผู้ใช้ที่แก้ไขโปรเจกต์นี้ล่าสุด อ้างอิงไปยัง auth_users.user_id',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'วันเวลาที่สร้างโปรเจกต์นี้ในระบบ',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'วันเวลาที่แก้ไขโปรเจกต์นี้ล่าสุด',
  `deleted_at` datetime DEFAULT NULL COMMENT 'วันเวลาที่ลบโปรเจกต์แบบ soft delete หากเป็น NULL แปลว่ายังใช้งานอยู่'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='เก็บข้อมูลระดับโปรเจกต์ งาน หรือเว็บไซต์ที่เป็นเจ้าของชุดฟอร์มและข้อมูล attendance';

--
-- Dumping data for table `proj_projects`
--

INSERT INTO `proj_projects` (`project_id`, `project_code`, `project_name`, `project_type`, `source_url`, `description`, `is_active`, `created_by_user_id`, `updated_by_user_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'HACKATHON_2026', 'Intelligent Living Hackathon 2026', 'event', 'https://hackathon.example.com', 'โปรเจกต์ตัวอย่างสำหรับงาน Hackathon พร้อมฟอร์ม check-in รับของ และอีเมลยืนยัน', 1, 1, 2, '2026-03-10 09:00:00', '2026-04-26 19:34:00', NULL),
(2, 'OPENHOUSE_2026', 'Computing Open House 2026', 'event', 'https://openhouse.example.com', 'โปรเจกต์ตัวอย่างสำหรับงาน Open House เพื่อแสดงว่าระบบรองรับหลายงานและหลายฟอร์มได้', 1, 1, 1, '2026-03-11 10:00:00', '2026-04-16 21:57:46', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_login_logs`
--
ALTER TABLE `auth_login_logs`
  ADD PRIMARY KEY (`login_log_id`),
  ADD KEY `idx_auth_login_logs_user_id` (`user_id`),
  ADD KEY `idx_auth_login_logs_login_method` (`login_method`),
  ADD KEY `idx_auth_login_logs_login_status` (`login_status`),
  ADD KEY `idx_auth_login_logs_created_at` (`created_at`);

--
-- Indexes for table `auth_sso_accounts`
--
ALTER TABLE `auth_sso_accounts`
  ADD PRIMARY KEY (`sso_account_id`),
  ADD UNIQUE KEY `uq_auth_sso_accounts_provider_subject` (`provider_code`,`provider_subject`),
  ADD KEY `idx_auth_sso_accounts_user_id` (`user_id`),
  ADD KEY `idx_auth_sso_accounts_provider_email` (`provider_email`),
  ADD KEY `idx_auth_sso_accounts_deleted_at` (`deleted_at`);

--
-- Indexes for table `auth_users`
--
ALTER TABLE `auth_users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uq_auth_users_email` (`email`),
  ADD KEY `idx_auth_users_role_code` (`role_code`),
  ADD KEY `idx_auth_users_is_active` (`is_active`),
  ADD KEY `idx_auth_users_deleted_at` (`deleted_at`);

--
-- Indexes for table `email_notification_templates`
--
ALTER TABLE `email_notification_templates`
  ADD PRIMARY KEY (`email_template_id`),
  ADD UNIQUE KEY `uq_email_notification_templates_form_id_notification_code` (`form_id`,`notification_code`),
  ADD KEY `idx_email_notification_templates_is_active` (`is_active`),
  ADD KEY `idx_email_notification_templates_deleted_at` (`deleted_at`),
  ADD KEY `idx_email_notification_templates_created_by_user_id` (`created_by_user_id`),
  ADD KEY `idx_email_notification_templates_updated_by_user_id` (`updated_by_user_id`);

--
-- Indexes for table `email_send_logs`
--
ALTER TABLE `email_send_logs`
  ADD PRIMARY KEY (`email_log_id`),
  ADD KEY `idx_email_send_logs_email_template_id` (`email_template_id`),
  ADD KEY `idx_email_send_logs_form_id` (`form_id`),
  ADD KEY `idx_email_send_logs_submission_id` (`submission_id`),
  ADD KEY `idx_email_send_logs_recipient_email` (`recipient_email`),
  ADD KEY `idx_email_send_logs_send_status` (`send_status`),
  ADD KEY `idx_email_send_logs_sent_at` (`sent_at`),
  ADD KEY `idx_email_send_logs_deleted_at` (`deleted_at`);

--
-- Indexes for table `entry_submissions`
--
ALTER TABLE `entry_submissions`
  ADD PRIMARY KEY (`submission_id`),
  ADD UNIQUE KEY `uq_entry_submissions_submission_code` (`submission_code`),
  ADD KEY `idx_entry_submissions_form_id` (`form_id`),
  ADD KEY `idx_entry_submissions_submitted_by_user_id` (`submitted_by_user_id`),
  ADD KEY `idx_entry_submissions_attendance_status` (`attendance_status`),
  ADD KEY `idx_entry_submissions_submitted_at` (`submitted_at`),
  ADD KEY `idx_entry_submissions_deleted_at` (`deleted_at`);

--
-- Indexes for table `entry_submission_answers`
--
ALTER TABLE `entry_submission_answers`
  ADD PRIMARY KEY (`answer_id`),
  ADD UNIQUE KEY `uq_entry_submission_answers_submission_id_field_id` (`submission_id`,`field_id`),
  ADD KEY `idx_entry_submission_answers_field_id` (`field_id`),
  ADD KEY `idx_entry_submission_answers_selected_option_id` (`selected_option_id`),
  ADD KEY `idx_entry_submission_answers_deleted_at` (`deleted_at`);

--
-- Indexes for table `entry_submission_answer_options`
--
ALTER TABLE `entry_submission_answer_options`
  ADD PRIMARY KEY (`answer_option_id`),
  ADD UNIQUE KEY `uq_entry_submission_answer_options_answer_id_option_id` (`answer_id`,`option_id`),
  ADD KEY `idx_entry_submission_answer_options_option_id` (`option_id`),
  ADD KEY `idx_entry_submission_answer_options_deleted_at` (`deleted_at`);

--
-- Indexes for table `entry_submission_files`
--
ALTER TABLE `entry_submission_files`
  ADD PRIMARY KEY (`answer_file_id`),
  ADD KEY `idx_entry_submission_files_answer_id` (`answer_id`),
  ADD KEY `idx_entry_submission_files_storage_disk` (`storage_disk`),
  ADD KEY `idx_entry_submission_files_deleted_at` (`deleted_at`);

--
-- Indexes for table `form_fields`
--
ALTER TABLE `form_fields`
  ADD PRIMARY KEY (`field_id`),
  ADD UNIQUE KEY `uq_form_fields_form_id_field_code` (`form_id`,`field_code`),
  ADD KEY `idx_form_fields_form_id_sort_order` (`form_id`,`sort_order`),
  ADD KEY `idx_form_fields_field_type` (`field_type`),
  ADD KEY `idx_form_fields_field_usage` (`field_usage`),
  ADD KEY `idx_form_fields_is_active` (`is_active`),
  ADD KEY `idx_form_fields_deleted_at` (`deleted_at`);

--
-- Indexes for table `form_field_options`
--
ALTER TABLE `form_field_options`
  ADD PRIMARY KEY (`option_id`),
  ADD UNIQUE KEY `uq_form_field_options_field_id_option_value` (`field_id`,`option_value`),
  ADD KEY `idx_form_field_options_field_id_sort_order` (`field_id`,`sort_order`),
  ADD KEY `idx_form_field_options_is_active` (`is_active`),
  ADD KEY `idx_form_field_options_deleted_at` (`deleted_at`);

--
-- Indexes for table `form_forms`
--
ALTER TABLE `form_forms`
  ADD PRIMARY KEY (`form_id`),
  ADD UNIQUE KEY `uq_form_definitions_form_code` (`form_code`),
  ADD UNIQUE KEY `uq_form_definitions_public_path` (`public_path`),
  ADD KEY `idx_form_definitions_project_id` (`project_id`),
  ADD KEY `idx_form_definitions_form_type` (`form_type`),
  ADD KEY `idx_form_definitions_status` (`status`),
  ADD KEY `idx_form_definitions_deleted_at` (`deleted_at`),
  ADD KEY `idx_form_definitions_created_by_user_id` (`created_by_user_id`),
  ADD KEY `idx_form_definitions_updated_by_user_id` (`updated_by_user_id`);

--
-- Indexes for table `item_catalogs`
--
ALTER TABLE `item_catalogs`
  ADD PRIMARY KEY (`item_id`),
  ADD UNIQUE KEY `uq_item_definitions_form_id_item_code` (`form_id`,`item_code`),
  ADD KEY `idx_item_definitions_item_type` (`item_type`),
  ADD KEY `idx_item_definitions_is_active` (`is_active`),
  ADD KEY `idx_item_definitions_deleted_at` (`deleted_at`),
  ADD KEY `idx_item_definitions_created_by_user_id` (`created_by_user_id`),
  ADD KEY `idx_item_definitions_updated_by_user_id` (`updated_by_user_id`);

--
-- Indexes for table `item_claims`
--
ALTER TABLE `item_claims`
  ADD PRIMARY KEY (`claim_id`),
  ADD UNIQUE KEY `uq_item_claims_claim_token` (`claim_token`),
  ADD UNIQUE KEY `uq_item_claims_submission_id_item_id` (`submission_id`,`item_id`),
  ADD KEY `idx_item_claims_item_id` (`item_id`),
  ADD KEY `idx_item_claims_receive_status` (`receive_status`),
  ADD KEY `idx_item_claims_received_by_user_id` (`received_by_user_id`),
  ADD KEY `idx_item_claims_deleted_at` (`deleted_at`);

--
-- Indexes for table `proj_projects`
--
ALTER TABLE `proj_projects`
  ADD PRIMARY KEY (`project_id`),
  ADD UNIQUE KEY `uq_proj_projects_project_code` (`project_code`),
  ADD KEY `idx_proj_projects_project_type` (`project_type`),
  ADD KEY `idx_proj_projects_is_active` (`is_active`),
  ADD KEY `idx_proj_projects_deleted_at` (`deleted_at`),
  ADD KEY `idx_proj_projects_created_by_user_id` (`created_by_user_id`),
  ADD KEY `idx_proj_projects_updated_by_user_id` (`updated_by_user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_login_logs`
--
ALTER TABLE `auth_login_logs`
  MODIFY `login_log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัส log การ login ใช้เป็น Primary Key ของตารางบันทึกการเข้าใช้งาน', AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `auth_sso_accounts`
--
ALTER TABLE `auth_sso_accounts`
  MODIFY `sso_account_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสบัญชี SSO ภายในระบบ ใช้เป็น Primary Key ของตารางเชื่อมบัญชี SSO', AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `auth_users`
--
ALTER TABLE `auth_users`
  MODIFY `user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสผู้ใช้ภายในระบบ ใช้เป็น Primary Key ของตารางผู้ใช้', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `email_notification_templates`
--
ALTER TABLE `email_notification_templates`
  MODIFY `email_template_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสเทมเพลตอีเมล ใช้เป็น Primary Key ของตารางเทมเพลตการแจ้งเตือน', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `email_send_logs`
--
ALTER TABLE `email_send_logs`
  MODIFY `email_log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัส log การส่งอีเมล ใช้เป็น Primary Key ของตารางบันทึกการส่งอีเมล', AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `entry_submissions`
--
ALTER TABLE `entry_submissions`
  MODIFY `submission_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสการส่งฟอร์ม ใช้เป็น Primary Key ของตารางการส่งคำตอบ', AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `entry_submission_answers`
--
ALTER TABLE `entry_submission_answers`
  MODIFY `answer_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสคำตอบ ใช้เป็น Primary Key ของตารางคำตอบรายฟิลด์', AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `entry_submission_answer_options`
--
ALTER TABLE `entry_submission_answer_options`
  MODIFY `answer_option_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสรายการตัวเลือกที่ถูกเลือก ใช้เป็น Primary Key ของตารางคำตอบแบบหลายตัวเลือก', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `entry_submission_files`
--
ALTER TABLE `entry_submission_files`
  MODIFY `answer_file_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสไฟล์แนบของคำตอบ ใช้เป็น Primary Key ของตารางไฟล์ที่ผู้ใช้อัปโหลด', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `form_fields`
--
ALTER TABLE `form_fields`
  MODIFY `field_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสฟิลด์ของฟอร์ม ใช้เป็น Primary Key ของตารางคำถามหรือฟิลด์', AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `form_field_options`
--
ALTER TABLE `form_field_options`
  MODIFY `option_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสตัวเลือกของฟิลด์ ใช้เป็น Primary Key ของตารางตัวเลือก', AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `form_forms`
--
ALTER TABLE `form_forms`
  MODIFY `form_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสฟอร์ม ใช้เป็น Primary Key ของตารางฟอร์ม', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `item_catalogs`
--
ALTER TABLE `item_catalogs`
  MODIFY `item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสรายการของหรือสิทธิ์รับของ ใช้เป็น Primary Key ของตารางรายการของ', AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `item_claims`
--
ALTER TABLE `item_claims`
  MODIFY `claim_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสสิทธิ์รับของ ใช้เป็น Primary Key ของตารางการรับของ', AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `proj_projects`
--
ALTER TABLE `proj_projects`
  MODIFY `project_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสโปรเจกต์หรือเจ้าของฟอร์ม ใช้เป็น Primary Key ของตารางโปรเจกต์', AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_login_logs`
--
ALTER TABLE `auth_login_logs`
  ADD CONSTRAINT `fk_auth_login_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `auth_sso_accounts`
--
ALTER TABLE `auth_sso_accounts`
  ADD CONSTRAINT `fk_auth_sso_accounts_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `email_notification_templates`
--
ALTER TABLE `email_notification_templates`
  ADD CONSTRAINT `fk_email_notification_templates_created_by_user_id` FOREIGN KEY (`created_by_user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_email_notification_templates_form_id` FOREIGN KEY (`form_id`) REFERENCES `form_forms` (`form_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_email_notification_templates_updated_by_user_id` FOREIGN KEY (`updated_by_user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `email_send_logs`
--
ALTER TABLE `email_send_logs`
  ADD CONSTRAINT `fk_email_send_logs_email_template_id` FOREIGN KEY (`email_template_id`) REFERENCES `email_notification_templates` (`email_template_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_email_send_logs_form_id` FOREIGN KEY (`form_id`) REFERENCES `form_forms` (`form_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_email_send_logs_submission_id` FOREIGN KEY (`submission_id`) REFERENCES `entry_submissions` (`submission_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `entry_submissions`
--
ALTER TABLE `entry_submissions`
  ADD CONSTRAINT `fk_entry_submissions_form_id` FOREIGN KEY (`form_id`) REFERENCES `form_forms` (`form_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_entry_submissions_submitted_by_user_id` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `entry_submission_answers`
--
ALTER TABLE `entry_submission_answers`
  ADD CONSTRAINT `fk_entry_submission_answers_field_id` FOREIGN KEY (`field_id`) REFERENCES `form_fields` (`field_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_entry_submission_answers_selected_option_id` FOREIGN KEY (`selected_option_id`) REFERENCES `form_field_options` (`option_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_entry_submission_answers_submission_id` FOREIGN KEY (`submission_id`) REFERENCES `entry_submissions` (`submission_id`) ON UPDATE CASCADE;

--
-- Constraints for table `entry_submission_answer_options`
--
ALTER TABLE `entry_submission_answer_options`
  ADD CONSTRAINT `fk_entry_submission_answer_options_answer_id` FOREIGN KEY (`answer_id`) REFERENCES `entry_submission_answers` (`answer_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_entry_submission_answer_options_option_id` FOREIGN KEY (`option_id`) REFERENCES `form_field_options` (`option_id`) ON UPDATE CASCADE;

--
-- Constraints for table `entry_submission_files`
--
ALTER TABLE `entry_submission_files`
  ADD CONSTRAINT `fk_entry_submission_files_answer_id` FOREIGN KEY (`answer_id`) REFERENCES `entry_submission_answers` (`answer_id`) ON UPDATE CASCADE;

--
-- Constraints for table `form_fields`
--
ALTER TABLE `form_fields`
  ADD CONSTRAINT `fk_form_fields_form_id` FOREIGN KEY (`form_id`) REFERENCES `form_forms` (`form_id`) ON UPDATE CASCADE;

--
-- Constraints for table `form_field_options`
--
ALTER TABLE `form_field_options`
  ADD CONSTRAINT `fk_form_field_options_field_id` FOREIGN KEY (`field_id`) REFERENCES `form_fields` (`field_id`) ON UPDATE CASCADE;

--
-- Constraints for table `form_forms`
--
ALTER TABLE `form_forms`
  ADD CONSTRAINT `fk_form_definitions_created_by_user_id` FOREIGN KEY (`created_by_user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_form_definitions_project_id` FOREIGN KEY (`project_id`) REFERENCES `proj_projects` (`project_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_form_definitions_updated_by_user_id` FOREIGN KEY (`updated_by_user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `item_catalogs`
--
ALTER TABLE `item_catalogs`
  ADD CONSTRAINT `fk_item_definitions_created_by_user_id` FOREIGN KEY (`created_by_user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_item_definitions_form_id` FOREIGN KEY (`form_id`) REFERENCES `form_forms` (`form_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_item_definitions_updated_by_user_id` FOREIGN KEY (`updated_by_user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `item_claims`
--
ALTER TABLE `item_claims`
  ADD CONSTRAINT `fk_item_claims_item_id` FOREIGN KEY (`item_id`) REFERENCES `item_catalogs` (`item_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_item_claims_received_by_user_id` FOREIGN KEY (`received_by_user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_item_claims_submission_id` FOREIGN KEY (`submission_id`) REFERENCES `entry_submissions` (`submission_id`) ON UPDATE CASCADE;

--
-- Constraints for table `proj_projects`
--
ALTER TABLE `proj_projects`
  ADD CONSTRAINT `fk_proj_projects_created_by_user_id` FOREIGN KEY (`created_by_user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_proj_projects_updated_by_user_id` FOREIGN KEY (`updated_by_user_id`) REFERENCES `auth_users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
