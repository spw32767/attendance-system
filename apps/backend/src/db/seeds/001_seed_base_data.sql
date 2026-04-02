-- attendance_system_seed_data.sql
-- Target DBMS: MariaDB 10.11.11
-- Purpose: Sample seed data for attendance / dynamic form / item claim / email / auth system
-- Recommended usage:
--   1) Run the main schema file first.
--   2) Run this seed file on a clean development database.
-- Demo local login password for seeded local users:
--   Admin@1234

SET NAMES utf8mb4;
SET time_zone = '+07:00';

START TRANSACTION;

-- -----------------------------------------------------
-- 1) auth_users
-- -----------------------------------------------------
INSERT INTO auth_users (
  user_id,
  email,
  password_hash,
  display_name,
  first_name,
  last_name,
  role_code,
  is_active,
  allow_local_login,
  allow_sso_login,
  last_login_at,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (1, 'admin@attendance.local', '$2y$12$PYSFksU57OGtcEAG1BdGwercg/9m0ZY0Ggr2p2e8AG4ClXtKgDoHW', 'System Super Admin', 'System', 'Admin', 'super_admin', 1, 1, 1, '2026-03-31 09:15:00', '2026-03-01 09:00:00', '2026-03-31 09:15:00', NULL),
  (2, 'ops@hackathon.local', '$2y$12$PYSFksU57OGtcEAG1BdGwercg/9m0ZY0Ggr2p2e8AG4ClXtKgDoHW', 'Hackathon Operations', 'Hackathon', 'Operations', 'admin', 1, 1, 1, '2026-03-31 08:40:00', '2026-03-01 09:10:00', '2026-03-31 08:40:00', NULL),
  (3, 'scanner1@hackathon.local', '$2y$12$PYSFksU57OGtcEAG1BdGwercg/9m0ZY0Ggr2p2e8AG4ClXtKgDoHW', 'Front Desk Scanner 1', 'Front Desk', 'Scanner 1', 'scanner', 1, 1, 0, '2026-03-31 11:05:00', '2026-03-05 10:00:00', '2026-03-31 11:05:00', NULL),
  (4, 'advisor@kku.ac.th', NULL, 'KKU SSO Advisor', 'Academic', 'Advisor', 'staff', 1, 0, 1, '2026-03-30 14:20:00', '2026-03-07 13:00:00', '2026-03-30 14:20:00', NULL);

-- -----------------------------------------------------
-- 2) auth_sso_accounts
-- -----------------------------------------------------
INSERT INTO auth_sso_accounts (
  sso_account_id,
  user_id,
  provider_code,
  provider_subject,
  provider_email,
  linked_at,
  last_login_at,
  metadata_json,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (1, 4, 'kku_sso', 'kku-sso-subject-0001', 'advisor@kku.ac.th', '2026-03-07 13:05:00', '2026-03-30 14:20:00', '{"department":"Computing","campus":"Khon Kaen","employee_type":"advisor"}', '2026-03-07 13:05:00', '2026-03-30 14:20:00', NULL);

-- -----------------------------------------------------
-- 3) auth_login_logs
-- -----------------------------------------------------
INSERT INTO auth_login_logs (
  login_log_id,
  user_id,
  login_method,
  provider_code,
  login_identifier,
  login_status,
  failure_reason,
  ip_address,
  user_agent,
  created_at
) VALUES
  (1, 1, 'local', NULL, 'admin@attendance.local', 'success', NULL, '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.0.0', '2026-03-31 09:15:00'),
  (2, 4, 'sso', 'kku_sso', 'advisor@kku.ac.th', 'success', NULL, '10.10.10.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.0.0', '2026-03-30 14:20:00'),
  (3, NULL, 'sso', 'kku_sso', 'unknown.user@kku.ac.th', 'rejected_no_user', 'Email จาก SSO ไม่มีอยู่ในระบบ จึงไม่อนุญาตให้เข้าใช้งาน', '10.10.10.88', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.0.0', '2026-03-30 14:35:00');

-- -----------------------------------------------------
-- 4) proj_projects
-- -----------------------------------------------------
INSERT INTO proj_projects (
  project_id,
  project_code,
  project_name,
  project_type,
  source_url,
  description,
  is_active,
  created_by_user_id,
  updated_by_user_id,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (1, 'HACKATHON_2026', 'Intelligent Living Hackathon 2026', 'event', 'https://hackathon.example.com', 'โปรเจกต์ตัวอย่างสำหรับงาน Hackathon พร้อมฟอร์ม check-in รับของ และอีเมลยืนยัน', 1, 1, 2, '2026-03-10 09:00:00', '2026-03-28 15:00:00', NULL),
  (2, 'OPENHOUSE_2026', 'Computing Open House 2026', 'event', 'https://openhouse.example.com', 'โปรเจกต์ตัวอย่างสำหรับงาน Open House เพื่อแสดงว่าระบบรองรับหลายงานและหลายฟอร์มได้', 1, 1, 1, '2026-03-11 10:00:00', '2026-03-28 16:00:00', NULL);

-- -----------------------------------------------------
-- 5) form_forms
-- -----------------------------------------------------
INSERT INTO form_forms (
  form_id,
  project_id,
  form_code,
  form_name,
  public_path,
  form_type,
  status,
  allow_multiple_submissions,
  start_at,
  end_at,
  success_title,
  success_message,
  settings_json,
  created_by_user_id,
  updated_by_user_id,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (
    1,
    1,
    'HACK26_DAY1_CHECKIN',
    'Hackathon 2026 Day 1 Check-in',
    'hackathon-2026-day1-checkin',
    'attendance',
    'published',
    0,
    '2026-07-03 07:00:00',
    '2026-07-03 18:00:00',
    'ส่งข้อมูลสำเร็จ',
    'ขอบคุณสำหรับการลงทะเบียน ระบบได้บันทึกข้อมูลของคุณแล้ว และจะส่งอีเมลยืนยันพร้อมสิทธิ์รับของให้ทางอีเมลที่กรอกไว้',
    '{"show_progress_bar":true,"auto_create_item_claims":true,"allow_qr_checkin":true}',
    2,
    2,
    '2026-03-15 09:00:00',
    '2026-03-29 10:30:00',
    NULL
  ),
  (
    2,
    2,
    'OPENHOUSE26_VISITOR_REG',
    'Open House 2026 Visitor Registration',
    'openhouse-2026-visitor-registration',
    'registration',
    'published',
    1,
    '2026-08-10 08:00:00',
    '2026-08-12 17:00:00',
    'ลงทะเบียนสำเร็จ',
    'ระบบได้รับข้อมูลการลงทะเบียนของคุณเรียบร้อยแล้ว แล้วพบกันในงาน Open House 2026',
    '{"show_progress_bar":false,"auto_create_item_claims":false}',
    1,
    1,
    '2026-03-16 10:00:00',
    '2026-03-29 10:45:00',
    NULL
  );

-- -----------------------------------------------------
-- 6) form_fields
-- -----------------------------------------------------
INSERT INTO form_fields (
  field_id,
  form_id,
  field_code,
  field_label,
  field_description,
  placeholder,
  field_type,
  field_usage,
  is_required,
  is_unique_value,
  sort_order,
  allow_other_option,
  settings_json,
  is_active,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (1, 1, 'prefix', 'คำนำหน้า', 'เลือกคำนำหน้าชื่อของผู้เข้าร่วม', 'เช่น นาย, นางสาว, Mr., Ms.', 'dropdown', 'general', 1, 0, 1, 0, NULL, 1, '2026-03-18 09:00:00', '2026-03-18 09:00:00', NULL),
  (2, 1, 'full_name', 'ชื่อ-นามสกุล', 'กรุณากรอกชื่อจริงและนามสกุลตามที่ใช้ในเอกสารทางการ สามารถกรอกเป็นภาษาไทยหรืออังกฤษได้', 'เช่น สมชาย ใจดี', 'short_text', 'full_name', 1, 0, 2, 0, '{"min_length":3,"max_length":255}', 1, '2026-03-18 09:02:00', '2026-03-18 09:02:00', NULL),
  (3, 1, 'email_address', 'อีเมล', 'ใช้อีเมลนี้สำหรับส่งอีเมลยืนยัน สิทธิ์รับของ และ QR code', 'example@email.com', 'short_text', 'email', 1, 1, 3, 0, '{"validation":"email"}', 1, '2026-03-18 09:05:00', '2026-03-18 09:05:00', NULL),
  (4, 1, 'phone_number', 'เบอร์โทรศัพท์', 'กรอกหมายเลขที่ติดต่อได้สะดวก', '08xxxxxxxx', 'short_text', 'phone', 1, 0, 4, 0, '{"validation":"phone"}', 1, '2026-03-18 09:06:00', '2026-03-18 09:06:00', NULL),
  (5, 1, 'university_name', 'มหาวิทยาลัย', 'กรอกชื่อมหาวิทยาลัยหรือสถาบันของคุณ', 'เช่น มหาวิทยาลัยขอนแก่น', 'short_text', 'general', 1, 0, 5, 0, '{"max_length":255}', 1, '2026-03-18 09:07:00', '2026-03-18 09:07:00', NULL),
  (6, 1, 'birth_date', 'วันเกิด', 'ใช้สำหรับยืนยันตัวตนเพิ่มเติมหากจำเป็น', NULL, 'date', 'birth_date', 0, 0, 6, 0, NULL, 1, '2026-03-18 09:08:00', '2026-03-18 09:08:00', NULL),
  (7, 1, 'checkin_round', 'รอบการเข้าร่วม', 'เลือกช่วงเวลาที่คุณจะเข้าร่วมกิจกรรมในวันแรก', NULL, 'multiple_choice', 'general', 1, 0, 7, 0, NULL, 1, '2026-03-18 09:09:00', '2026-03-18 09:09:00', NULL),
  (8, 1, 'interest_topics', 'หัวข้อที่สนใจ', 'เลือกได้มากกว่า 1 ข้อ เพื่อใช้วางแผนกิจกรรมและสรุปภาพรวมความสนใจของผู้เข้าร่วม', NULL, 'checkboxes', 'general', 0, 0, 8, 1, '{"min_selected":1,"max_selected":3}', 1, '2026-03-18 09:10:00', '2026-03-18 09:10:00', NULL),
  (9, 1, 'arrival_time', 'เวลาที่คาดว่าจะมาถึง', 'ใช้เพื่อช่วยจัดการคิวลงทะเบียนหน้างาน', '08:30', 'time', 'general', 0, 0, 9, 0, NULL, 1, '2026-03-18 09:11:00', '2026-03-18 09:11:00', NULL),
  (10, 1, 'event_experience_rating', 'ระดับประสบการณ์ด้าน Hackathon', 'ให้คะแนนประสบการณ์ของคุณตั้งแต่ 1 ถึง 5', NULL, 'rating', 'general', 0, 0, 10, 0, '{"min_rating":1,"max_rating":5,"icon":"star"}', 1, '2026-03-18 09:12:00', '2026-03-18 09:12:00', NULL),
  (11, 1, 'notes', 'หมายเหตุเพิ่มเติม', 'หากมีข้อมูลพิเศษ เช่น ข้อจำกัดด้านอาหาร หรือความต้องการพิเศษ สามารถกรอกได้ที่นี่', 'เช่น แพ้อาหารทะเล', 'long_text', 'general', 0, 0, 11, 0, '{"max_length":2000}', 1, '2026-03-18 09:13:00', '2026-03-18 09:13:00', NULL),
  (12, 1, 'student_document', 'เอกสารประกอบ', 'อัปโหลดไฟล์ยืนยันตัวตน เช่น บัตรนักศึกษา หรือหนังสือรับรอง โดยอนุญาตไฟล์ PDF, JPG, PNG', NULL, 'file_upload', 'general', 0, 0, 12, 0, '{"allowed_file_types":["pdf","jpg","jpeg","png"],"max_file_size_mb":10,"max_file_count":2}', 1, '2026-03-18 09:14:00', '2026-03-18 09:14:00', NULL),
  (13, 2, 'first_name', 'ชื่อจริง', 'กรุณากรอกชื่อจริงของผู้ลงทะเบียน', 'เช่น Somchai', 'short_text', 'first_name', 1, 0, 1, 0, '{"min_length":2,"max_length":150}', 1, '2026-03-18 10:00:00', '2026-03-18 10:00:00', NULL),
  (14, 2, 'last_name', 'นามสกุล', 'กรุณากรอกนามสกุลของผู้ลงทะเบียน', 'เช่น Jaidee', 'short_text', 'last_name', 1, 0, 2, 0, '{"min_length":2,"max_length":150}', 1, '2026-03-18 10:01:00', '2026-03-18 10:01:00', NULL),
  (15, 2, 'email_address', 'อีเมล', 'ใช้สำหรับส่งอีเมลยืนยันการลงทะเบียน', 'visitor@email.com', 'short_text', 'email', 1, 1, 3, 0, '{"validation":"email"}', 1, '2026-03-18 10:02:00', '2026-03-18 10:02:00', NULL),
  (16, 2, 'age', 'อายุ', 'กรอกเป็นตัวเลขจำนวนเต็ม', 'เช่น 19', 'short_text', 'general', 0, 0, 4, 0, '{"numeric_only":true,"max_length":3}', 1, '2026-03-18 10:03:00', '2026-03-18 10:03:00', NULL),
  (17, 2, 'visit_date', 'วันที่จะเข้าชมงาน', 'เลือกวันที่ต้องการเข้าร่วมงาน Open House', NULL, 'date', 'general', 1, 0, 5, 0, NULL, 1, '2026-03-18 10:04:00', '2026-03-18 10:04:00', NULL),
  (18, 2, 'interested_zone', 'โซนที่สนใจ', 'เลือกโซนที่อยากเข้าชมมากที่สุด', NULL, 'dropdown', 'general', 1, 0, 6, 0, NULL, 1, '2026-03-18 10:05:00', '2026-03-18 10:05:00', NULL),
  (19, 2, 'feedback', 'คำถามเพิ่มเติม', 'ฝากคำถามไว้ล่วงหน้าเพื่อให้ทีมงานเตรียมข้อมูลได้', 'เช่น อยากทราบเรื่องทุนการศึกษา', 'long_text', 'general', 0, 0, 7, 0, '{"max_length":1500}', 1, '2026-03-18 10:06:00', '2026-03-18 10:06:00', NULL);

-- -----------------------------------------------------
-- 7) form_field_options
-- -----------------------------------------------------
INSERT INTO form_field_options (
  option_id,
  field_id,
  option_label,
  option_value,
  sort_order,
  is_active,
  created_at,
  updated_at,
  deleted_at
) VALUES
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

-- -----------------------------------------------------
-- 8) entry_submissions
-- -----------------------------------------------------
INSERT INTO entry_submissions (
  submission_id,
  form_id,
  submission_code,
  submitted_by_user_id,
  submitted_at,
  attendance_status,
  check_in_at,
  check_out_at,
  source_type,
  ip_address,
  user_agent,
  notes,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (1, 1, 'SUB-HACK26-0001', NULL, '2026-07-03 08:12:33', 'present', '2026-07-03 08:45:10', NULL, 'public_form', '203.0.113.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/146.0.0.0', 'ผู้เข้าร่วมเดินทางมาถึงหน้างานตรงเวลา', '2026-07-03 08:12:33', '2026-07-03 08:45:10', NULL),
  (2, 1, 'SUB-HACK26-0002', NULL, '2026-07-03 09:20:45', 'submitted', NULL, NULL, 'public_form', '203.0.113.11', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'ยังไม่ถูกสแกน check-in ที่หน้างาน', '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
  (3, 2, 'SUB-OH26-0001', NULL, '2026-08-10 10:05:15', 'submitted', NULL, NULL, 'public_form', '203.0.113.50', 'Mozilla/5.0 (Linux; Android 15)', 'ลงทะเบียนเข้าชมงานล่วงหน้า', '2026-08-10 10:05:15', '2026-08-10 10:05:15', NULL);

-- -----------------------------------------------------
-- 9) entry_submission_answers
-- -----------------------------------------------------
INSERT INTO entry_submission_answers (
  answer_id,
  submission_id,
  field_id,
  answer_text,
  answer_number,
  answer_date,
  answer_time,
  selected_option_id,
  created_at,
  updated_at,
  deleted_at
) VALUES
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

-- -----------------------------------------------------
-- 10) entry_submission_answer_options
-- -----------------------------------------------------
INSERT INTO entry_submission_answer_options (
  answer_option_id,
  answer_id,
  option_id,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (1, 8, 7, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
  (2, 8, 9, '2026-07-03 08:12:33', '2026-07-03 08:12:33', NULL),
  (3, 20, 8, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL),
  (4, 20, 10, '2026-07-03 09:20:45', '2026-07-03 09:20:45', NULL);

-- -----------------------------------------------------
-- 11) entry_submission_files
-- -----------------------------------------------------
INSERT INTO entry_submission_files (
  answer_file_id,
  answer_id,
  original_file_name,
  stored_file_name,
  storage_disk,
  storage_path,
  mime_type,
  file_extension,
  file_size_bytes,
  checksum_sha256,
  uploaded_at,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (1, 12, 'student_card_siriporn.pdf', '20260703_081233_sub1_doc1.pdf', 'local', 'uploads/forms/HACK26_DAY1_CHECKIN/submissions/SUB-HACK26-0001/20260703_081233_sub1_doc1.pdf', 'application/pdf', 'pdf', 524288, '0d5e4c9078fae6f83f9a6ef1a5d8474e63f39f1c56895d57d8d6807cc8d4f7aa', '2026-07-03 08:12:40', '2026-07-03 08:12:40', '2026-07-03 08:12:40', NULL),
  (2, 24, 'student_card_nattapon.png', '20260703_092045_sub2_doc1.png', 'local', 'uploads/forms/HACK26_DAY1_CHECKIN/submissions/SUB-HACK26-0002/20260703_092045_sub2_doc1.png', 'image/png', 'png', 314572, '9fd3430a6a3f66cb863e2d97e0ce889db7f3e2cfafcaa509f6c1dd6dbf66baf7', '2026-07-03 09:20:55', '2026-07-03 09:20:55', '2026-07-03 09:20:55', NULL);

-- -----------------------------------------------------
-- 12) item_catalogs
-- -----------------------------------------------------
INSERT INTO item_catalogs (
  item_id,
  form_id,
  item_code,
  item_name,
  item_type,
  description,
  default_qty,
  issue_qr_code,
  include_in_confirmation_email,
  sort_order,
  is_active,
  created_by_user_id,
  updated_by_user_id,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (1, 1, 'LUNCH_BOX', 'Lunch Box', 'meal', 'สิทธิ์รับข้าวกลางวันสำหรับผู้เข้าร่วมงานวันที่ 1', 1, 1, 1, 1, 1, 2, 2, '2026-03-20 09:00:00', '2026-03-20 09:00:00', NULL),
  (2, 1, 'SOUVENIR_BAG', 'Souvenir Bag', 'souvenir', 'ของที่ระลึกสำหรับผู้ที่ลงทะเบียนและยืนยันตัวตนเรียบร้อย', 1, 1, 1, 2, 1, 2, 2, '2026-03-20 09:05:00', '2026-03-20 09:05:00', NULL),
  (3, 1, 'EVENT_TSHIRT', 'Event T-Shirt', 'reward', 'เสื้อที่ระลึกสำหรับผู้เข้าร่วมกิจกรรม', 1, 1, 1, 3, 1, 2, 2, '2026-03-20 09:10:00', '2026-03-20 09:10:00', NULL);

-- -----------------------------------------------------
-- 13) item_claims
-- -----------------------------------------------------
INSERT INTO item_claims (
  claim_id,
  submission_id,
  item_id,
  claim_token,
  receive_status,
  qr_issued_at,
  received_at,
  received_by_user_id,
  qty,
  notes,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (1, 1, 1, 'CLAIM-HACK26-SUB1-LUNCH-001', 'received', '2026-07-03 08:12:35', '2026-07-03 11:00:12', 3, 1, 'สแกนรับข้าวกลางวันแล้วที่จุดบริการหน้า Hall A', '2026-07-03 08:12:35', '2026-07-03 11:00:12', NULL),
  (2, 1, 2, 'CLAIM-HACK26-SUB1-SOUVENIR-001', 'pending', '2026-07-03 08:12:35', NULL, NULL, 1, 'ยังไม่ได้มารับของที่ระลึก', '2026-07-03 08:12:35', '2026-07-03 08:12:35', NULL),
  (3, 1, 3, 'CLAIM-HACK26-SUB1-TSHIRT-001', 'pending', '2026-07-03 08:12:35', NULL, NULL, 1, 'รอรับเสื้อที่จุดแจกของหลัง check-in', '2026-07-03 08:12:35', '2026-07-03 08:12:35', NULL),
  (4, 2, 1, 'CLAIM-HACK26-SUB2-LUNCH-001', 'pending', '2026-07-03 09:20:50', NULL, NULL, 1, 'ผู้เข้าร่วมยังไม่ถูกสแกน check-in', '2026-07-03 09:20:50', '2026-07-03 09:20:50', NULL),
  (5, 2, 2, 'CLAIM-HACK26-SUB2-SOUVENIR-001', 'pending', '2026-07-03 09:20:50', NULL, NULL, 1, NULL, '2026-07-03 09:20:50', '2026-07-03 09:20:50', NULL),
  (6, 2, 3, 'CLAIM-HACK26-SUB2-TSHIRT-001', 'pending', '2026-07-03 09:20:50', NULL, NULL, 1, NULL, '2026-07-03 09:20:50', '2026-07-03 09:20:50', NULL);

-- -----------------------------------------------------
-- 14) email_notification_templates
-- -----------------------------------------------------
INSERT INTO email_notification_templates (
  email_template_id,
  form_id,
  notification_code,
  template_name,
  is_active,
  send_to_field_usage,
  email_subject_template,
  email_body_template,
  include_item_summary,
  include_qr_codes,
  created_by_user_id,
  updated_by_user_id,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (
    1,
    1,
    'submission_confirmation',
    'Hackathon Submission Confirmation',
    1,
    'email',
    'ยืนยันการลงทะเบียน {{form_name}} - {{submission_code}}',
    '<p>สวัสดี {{full_name}}</p><p>ระบบได้รับข้อมูลของคุณเรียบร้อยแล้วสำหรับฟอร์ม <strong>{{form_name}}</strong></p><p>Submission Code: <strong>{{submission_code}}</strong></p><p>รายการสิทธิ์รับของของคุณจะแสดงด้านล่าง และสามารถใช้ QR code ที่แนบมาเพื่อให้เจ้าหน้าที่สแกนตอนรับของได้</p><p>ขอบคุณที่เข้าร่วมกิจกรรม</p>',
    1,
    1,
    2,
    2,
    '2026-03-22 09:00:00',
    '2026-03-22 09:00:00',
    NULL
  ),
  (
    2,
    2,
    'submission_confirmation',
    'Open House Registration Confirmation',
    1,
    'email',
    'ยืนยันการลงทะเบียน Open House 2026 - {{submission_code}}',
    '<p>ขอบคุณ {{first_name}} {{last_name}}</p><p>ระบบได้รับการลงทะเบียนเข้าชมงาน Open House 2026 ของคุณเรียบร้อยแล้ว แล้วพบกันในงาน</p>',
    0,
    0,
    1,
    1,
    '2026-03-22 09:05:00',
    '2026-03-22 09:05:00',
    NULL
  );

-- -----------------------------------------------------
-- 15) email_send_logs
-- -----------------------------------------------------
INSERT INTO email_send_logs (
  email_log_id,
  email_template_id,
  form_id,
  submission_id,
  recipient_email,
  notification_code,
  email_subject,
  send_status,
  provider_message_id,
  error_message,
  sent_at,
  created_at,
  updated_at,
  deleted_at
) VALUES
  (1, 1, 1, 1, 'siriporn@example.com', 'submission_confirmation', 'ยืนยันการลงทะเบียน Hackathon 2026 Day 1 Check-in - SUB-HACK26-0001', 'sent', 'smtp-msg-000001', NULL, '2026-07-03 08:12:45', '2026-07-03 08:12:34', '2026-07-03 08:12:45', NULL),
  (2, 1, 1, 2, 'nattapon@example.com', 'submission_confirmation', 'ยืนยันการลงทะเบียน Hackathon 2026 Day 1 Check-in - SUB-HACK26-0002', 'sent', 'smtp-msg-000002', NULL, '2026-07-03 09:20:58', '2026-07-03 09:20:50', '2026-07-03 09:20:58', NULL),
  (3, 2, 2, 3, 'ploy.sukanya@example.com', 'submission_confirmation', 'ยืนยันการลงทะเบียน Open House 2026 - SUB-OH26-0001', 'sent', 'smtp-msg-000003', NULL, '2026-08-10 10:05:30', '2026-08-10 10:05:16', '2026-08-10 10:05:30', NULL);

COMMIT;
