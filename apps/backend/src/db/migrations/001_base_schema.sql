-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 01, 2026 at 09:31 PM
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
  MODIFY `login_log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัส log การ login ใช้เป็น Primary Key ของตารางบันทึกการเข้าใช้งาน';

--
-- AUTO_INCREMENT for table `auth_sso_accounts`
--
ALTER TABLE `auth_sso_accounts`
  MODIFY `sso_account_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสบัญชี SSO ภายในระบบ ใช้เป็น Primary Key ของตารางเชื่อมบัญชี SSO';

--
-- AUTO_INCREMENT for table `auth_users`
--
ALTER TABLE `auth_users`
  MODIFY `user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสผู้ใช้ภายในระบบ ใช้เป็น Primary Key ของตารางผู้ใช้';

--
-- AUTO_INCREMENT for table `email_notification_templates`
--
ALTER TABLE `email_notification_templates`
  MODIFY `email_template_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสเทมเพลตอีเมล ใช้เป็น Primary Key ของตารางเทมเพลตการแจ้งเตือน';

--
-- AUTO_INCREMENT for table `email_send_logs`
--
ALTER TABLE `email_send_logs`
  MODIFY `email_log_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัส log การส่งอีเมล ใช้เป็น Primary Key ของตารางบันทึกการส่งอีเมล';

--
-- AUTO_INCREMENT for table `entry_submissions`
--
ALTER TABLE `entry_submissions`
  MODIFY `submission_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสการส่งฟอร์ม ใช้เป็น Primary Key ของตารางการส่งคำตอบ';

--
-- AUTO_INCREMENT for table `entry_submission_answers`
--
ALTER TABLE `entry_submission_answers`
  MODIFY `answer_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสคำตอบ ใช้เป็น Primary Key ของตารางคำตอบรายฟิลด์';

--
-- AUTO_INCREMENT for table `entry_submission_answer_options`
--
ALTER TABLE `entry_submission_answer_options`
  MODIFY `answer_option_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสรายการตัวเลือกที่ถูกเลือก ใช้เป็น Primary Key ของตารางคำตอบแบบหลายตัวเลือก';

--
-- AUTO_INCREMENT for table `entry_submission_files`
--
ALTER TABLE `entry_submission_files`
  MODIFY `answer_file_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสไฟล์แนบของคำตอบ ใช้เป็น Primary Key ของตารางไฟล์ที่ผู้ใช้อัปโหลด';

--
-- AUTO_INCREMENT for table `form_fields`
--
ALTER TABLE `form_fields`
  MODIFY `field_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสฟิลด์ของฟอร์ม ใช้เป็น Primary Key ของตารางคำถามหรือฟิลด์';

--
-- AUTO_INCREMENT for table `form_field_options`
--
ALTER TABLE `form_field_options`
  MODIFY `option_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสตัวเลือกของฟิลด์ ใช้เป็น Primary Key ของตารางตัวเลือก';

--
-- AUTO_INCREMENT for table `form_forms`
--
ALTER TABLE `form_forms`
  MODIFY `form_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสฟอร์ม ใช้เป็น Primary Key ของตารางฟอร์ม';

--
-- AUTO_INCREMENT for table `item_catalogs`
--
ALTER TABLE `item_catalogs`
  MODIFY `item_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสรายการของหรือสิทธิ์รับของ ใช้เป็น Primary Key ของตารางรายการของ';

--
-- AUTO_INCREMENT for table `item_claims`
--
ALTER TABLE `item_claims`
  MODIFY `claim_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสสิทธิ์รับของ ใช้เป็น Primary Key ของตารางการรับของ';

--
-- AUTO_INCREMENT for table `proj_projects`
--
ALTER TABLE `proj_projects`
  MODIFY `project_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'รหัสโปรเจกต์หรือเจ้าของฟอร์ม ใช้เป็น Primary Key ของตารางโปรเจกต์';

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
