-- 005_backfill_checkin_template.sql
--
-- New forms get both default templates seeded at INSERT time
-- (submission_confirmation + checkin_confirmation). Forms created before
-- this change only have submission_confirmation; the check-in email was
-- generated inline in code and never landed in email_notification_templates.
--
-- This migration inserts an editable checkin_confirmation template for every
-- existing form that doesn't already have one, so admins can edit the
-- subject / body from the Email Center page.
--
-- Idempotent: forms that already have a (form_id, 'checkin_confirmation')
-- row (including soft-deleted ones — the unique key spans soft-deleted
-- rows) are skipped by the NOT EXISTS guard.

INSERT INTO email_notification_templates
  (form_id, notification_code, template_name, is_active, send_to_field_usage,
   email_subject_template, email_body_template, include_item_summary, include_qr_codes)
SELECT
  f.form_id,
  'checkin_confirmation',
  'เทมเพลตยืนยันเช็กอิน',
  1,
  'email',
  'ยืนยันเช็กอิน {{form_name}} - {{submission_code}}',
  CONCAT(
    '<p>สวัสดีคุณ {{full_name}}</p>',
    '<p>ระบบได้ยืนยันการเช็กอินของคุณสำหรับงาน <strong>{{form_name}}</strong> เรียบร้อยแล้ว</p>',
    '<p>รหัสการลงทะเบียน: <strong>{{submission_code}}</strong></p>'
  ),
  1,
  1
FROM form_forms f
WHERE f.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM email_notification_templates t
    WHERE t.form_id = f.form_id
      AND t.notification_code = 'checkin_confirmation'
  );
