-- 004_form_email_toggles.sql
--
-- Two per-form switches that admins can flip from the form builder:
--   send_submission_email — when ON, the system emails the respondent a
--                           registration confirmation (plus reward QRs)
--                           immediately after they submit the form.
--   send_checkin_email    — when ON, admins can hit the "ส่งอีเมล" button
--                           on submissions / pre-register to dispatch a
--                           check-in confirmation. When OFF, the backend
--                           refuses the request (no log row created).
--
-- Both default to 1 so existing forms keep their current email behavior.
--
-- Idempotent: safe to run more than once.

SET @add_submission := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE table_schema = DATABASE()
        AND table_name = 'form_forms'
        AND column_name = 'send_submission_email'
    ),
    'SELECT 1',
    'ALTER TABLE `form_forms` ADD COLUMN `send_submission_email` TINYINT(1) NOT NULL DEFAULT 1 COMMENT ''ส่งอีเมลยืนยันการลงทะเบียนให้ผู้กรอกหลังกดส่งฟอร์ม (1=ส่ง, 0=ไม่ส่ง)'' AFTER `allow_multiple_submissions`'
  )
);
PREPARE stmt FROM @add_submission;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_checkin := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE table_schema = DATABASE()
        AND table_name = 'form_forms'
        AND column_name = 'send_checkin_email'
    ),
    'SELECT 1',
    'ALTER TABLE `form_forms` ADD COLUMN `send_checkin_email` TINYINT(1) NOT NULL DEFAULT 1 COMMENT ''อนุญาตให้แอดมิน "ส่งอีเมลเช็กอิน" หลังยืนยันการมา (1=อนุญาต, 0=ไม่ส่ง)'' AFTER `send_submission_email`'
  )
);
PREPARE stmt FROM @add_checkin;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
