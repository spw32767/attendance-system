# Attendance System Database Guide for AI Agents

This document explains the database design of the attendance system so an AI coding agent can implement backend APIs, admin UI, scanner UI, and related business logic correctly.

The database targets **MariaDB 10.11.11**.

## 1. Purpose of the system

This system is a standalone attendance and form platform with these goals:

- Admin users can create and manage custom forms.
- Public users can submit forms without needing an account.
- Each form can contain different field types, similar to Google Forms.
- The system can track attendance-related timestamps such as submitted time, check-in time, and check-out time.
- The system can manage item entitlement and item pickup, such as lunch boxes, souvenirs, badges, or shirts.
- The system can send confirmation emails after submission.
- The system can generate QR-based claim tokens so admins can scan and mark an item as received.
- The system supports internal login now and can support SSO later.

This is **not** a self-registration admin platform. Admin, staff, and scanner users are created manually by the system owner.

---

## 2. High-level design principles

### 2.1 Dynamic form structure
Forms are configurable. A form is made of:

- a form record
- many field records
- optional choice records for choice-based fields

This allows one form to collect `first_name`, `last_name`, and `age`, while another form can collect `first_name`, `last_name`, and `birth_date`.

### 2.2 Transactional submission storage
Public responses are stored as submissions and answers.

- one submission = one form response instance
- one submission can have many answers
- checkbox answers can have many selected options
- file upload answers can have many uploaded files

### 2.3 Separate business modules by prefix
Tables are grouped by domain prefix:

- `auth_*` for internal users and authentication
- `proj_*` for project ownership / grouping
- `form_*` for form structure
- `entry_*` for public form submissions and answers
- `item_*` for reward / pickup / claim logic
- `email_*` for email templates and send logs

### 2.4 Soft delete support
Almost all major tables include `deleted_at`.

Agents should prefer soft delete logic unless explicitly instructed otherwise.

---

## 3. Current table list

The current schema contains these tables:

### Authentication
- `auth_users`
- `auth_sso_accounts`
- `auth_login_logs`

### Project ownership
- `proj_projects`

### Form builder
- `form_forms`
- `form_fields`
- `form_field_options`

### Public submissions
- `entry_submissions`
- `entry_submission_answers`
- `entry_submission_answer_options`
- `entry_submission_files`

### Item claim and QR flow
- `item_catalogs`
- `item_claims`

### Email notifications
- `email_notification_templates`
- `email_send_logs`

---

## 4. Table-by-table explanation

## 4.1 `auth_users`
This table stores internal users who can access admin features, management pages, or scanner pages.

Important behavior:
- users are created manually
- there is no self-registration
- local login can be enabled or disabled per user
- SSO login can be enabled or disabled per user
- `role_code` controls what the user can do in the application

Typical roles:
- `super_admin`
- `admin`
- `staff`
- `scanner`

Typical use cases:
- admin creates and edits forms
- scanner opens QR scan page and marks items as received
- staff checks submission data

Implementation guidance:
- local login should verify `password_hash`
- all login paths should check `is_active = 1`
- deleted or inactive users should not be allowed to log in

---

## 4.2 `auth_sso_accounts`
This table links an internal `auth_users` record to an external SSO identity.

Important behavior:
- SSO should never auto-create a new internal user
- the system should only allow SSO access if the returned email belongs to an existing active `auth_users` record
- once verified, the external subject/provider pair can be linked here for future logins

Typical fields stored here:
- provider code such as `google`, `azuread`, or `kku_sso`
- external subject identifier
- provider email
- metadata JSON for raw provider info if needed

Implementation guidance:
1. user clicks SSO login
2. provider returns identity information
3. app checks whether email exists in `auth_users`
4. if not found, reject login
5. if found and active, log in the matching internal user
6. optionally create/update `auth_sso_accounts`

---

## 4.3 `auth_login_logs`
This table stores login attempts and results.

Use cases:
- audit security events
- debug failed login
- inspect rejected SSO attempts

Typical status values:
- `success`
- `failed`
- `rejected_no_user`
- `rejected_inactive`

Implementation guidance:
- log both success and failure
- store attempted identifier, login method, provider code if applicable, IP, and user agent

---

## 4.4 `proj_projects`
This table groups forms under a larger owner context such as an event, website, campaign, or organization.

Examples:
- Hackathon 2026
- Open House 2026
- Faculty Event Website

Purpose:
- lets the system separate forms by project
- useful for admin filtering and reporting
- allows one project to own many forms

Relationship:
- one project has many form definitions

---

## 4.5 `form_forms`
This table is the main form header table.

It represents one form, such as:
- Day 1 Check-in Form
- Lunch Pickup Form
- Souvenir Claim Form
- General Registration Form

Purpose:
- defines the form itself
- controls form availability and status
- stores public access path
- belongs to one project

Important behavior:
- `status` usually controls whether a form is editable, visible, or closed
- `allow_multiple_submissions` determines if one person can submit multiple times
- `start_at` and `end_at` can be used to open/close form availability by time
- `public_path` is intended to be human-readable and used for public URL routing

Example public route idea:
- `/forms/hackathon-checkin-day1`

---

## 4.6 `form_fields`
This table defines the questions/fields inside a form.

A single form can have many fields.

This table is central to the dynamic form builder.

Important display/config columns:
- `field_label` = visible field title
- `field_description` = helper text under the label
- `placeholder` = input placeholder text

Important structure columns:
- `field_type` = type of input
- `field_code` = internal code for application/reference use
- `field_usage` = semantic meaning of the field
- `is_required` = whether it must be answered
- `is_unique` = whether value should be unique within business rules
- `sort_order` = display order
- `allow_other_option` = whether choice fields allow a custom value
- `settings_json` = type-specific configuration

Supported field types:
- `short_text`
- `long_text`
- `multiple_choice`
- `checkboxes`
- `dropdown`
- `rating`
- `date`
- `time`
- `file_upload`

Recommended `field_usage` values:
- `general`
- `full_name`
- `first_name`
- `last_name`
- `email`
- `phone`
- `student_code`
- `birth_date`

Implementation guidance:
- the admin UI should expose simple labels and settings
- technical columns like `field_code` can be auto-generated or hidden behind advanced settings
- form rendering should sort by `sort_order`

---

## 4.7 `form_field_options`
This table stores selectable choices for these field types:
- `multiple_choice`
- `checkboxes`
- `dropdown`

Purpose:
- define available options for one field
- support ordering and active/inactive options

Example:
Field: `Meal preference`
- Standard
- Vegetarian
- Halal

Implementation guidance:
- order by `sort_order`
- ignore inactive/deleted options in normal public rendering

---

## 4.8 `entry_submissions`
This table stores one public response to one form.

One row = one submission event.

Purpose:
- header row for all answers
- stores core attendance timestamps
- stores metadata such as source, IP, user agent, and notes

Important time/status fields:
- `submitted_at`
- `check_in_at`
- `check_out_at`
- `attendance_status`

Important behavior:
- `submitted_at` is when the form was submitted
- `check_in_at` is attendance/business logic time
- `check_out_at` can support future exit tracking
- `attendance_status` is a normalized status such as `present`, `absent`, `cancelled`

Important design note:
Attendance timestamps belong in this table, **not** in dynamic form answers.

---

## 4.9 `entry_submission_answers`
This table stores the primary answer row for each field in a submission.

One row = one field answer in one submission.

Purpose:
- store typed answer values
- connect a submission to a form field

Typical value columns:
- `answer_text`
- `answer_number`
- `answer_date`
- `answer_time`
- `selected_option_id`

Expected usage by field type:
- `short_text` -> `answer_text`
- `long_text` -> `answer_text`
- `multiple_choice` -> `selected_option_id`
- `dropdown` -> `selected_option_id`
- `rating` -> `answer_number`
- `date` -> `answer_date`
- `time` -> `answer_time`
- `file_upload` -> parent row here, actual files in `entry_submission_files`

Implementation guidance:
- create one parent answer row even for checkbox/file upload fields, then add child rows if needed
- application should validate value column consistency based on `field_type`

---

## 4.10 `entry_submission_answer_options`
This table stores the selected options for checkbox fields.

Purpose:
- support multi-select answers in normalized form

Relationship:
- one answer row can have many selected option rows

Example:
Field: `Topics of interest`
Chosen values:
- AI
- IoT

This would produce:
- one parent row in `entry_submission_answers`
- two child rows in `entry_submission_answer_options`

---

## 4.11 `entry_submission_files`
This table stores uploaded files for `file_upload` answers.

Purpose:
- store metadata for one or more uploaded files attached to one answer
- keep file storage details out of the main answers table

Typical metadata:
- original filename
- stored filename
- storage disk
- storage path
- mime type
- file extension
- file size

Implementation guidance:
- support one answer to many files if configured
- actual binary file content should not be stored in this table
- store files in local disk or object storage, and keep only metadata/path here
- file access should be permission-aware in admin interfaces

---

## 4.12 `item_catalogs`
This table stores the item catalog attached to a form.

Examples:
- Lunch Box
- Souvenir
- T-Shirt
- Badge

Purpose:
- define what items can be claimed from submissions of a particular form
- separate item setup from actual claim transactions

Relationship:
- one form can define many items

Implementation guidance:
- items may be auto-generated into claims after successful submission
- item definitions should be manageable in admin UI

---

## 4.13 `item_claims`
This table stores item entitlement and claim status for each submission.

This is the transaction table for pickup/receipt flow.

One row usually represents:
- one submission
- one item
- one claim state

Purpose:
- track whether a submission is entitled to receive an item
- store claim token / QR token
- mark item as received by a staff member

Important fields:
- `claim_token`
- `receive_status`
- `qr_issued_at`
- `received_at`
- `received_by_user_id`

Typical status values:
- `pending`
- `received`
- `cancelled`

QR behavior:
- one claim row should map to one QR token
- when admin scans QR, backend resolves the claim row by token
- if pending, mark as received
- if already received, show already-received state

This design is intentionally per-item, not per-submission, so different items can be claimed independently.

---

## 4.14 `email_notification_templates`
This table stores email template configuration for forms.

Purpose:
- define confirmation email behavior after form submission
- allow customizable email subject/body templates
- optionally include item summary and QR code information

Typical use case:
After a public user submits a registration form, the system sends an email such as:
- registration successful
- list of items they are eligible to receive
- QR code or QR-related claim information

Implementation guidance:
- templates can be rendered with submission context and item claim context
- keep email generation logic separate from DB schema concerns
- do not hardcode one global confirmation email if per-form flexibility is desired

---

## 4.15 `email_send_logs`
This table stores the result of email sending attempts.

Purpose:
- audit what was sent
- debug failed sending
- support retries or admin review

Typical status values:
- `queued`
- `sent`
- `failed`

Implementation guidance:
- create a log row per send attempt
- store provider message ID when available
- store error message when failed

---

## 5. Main relationships

The most important relationships are:

- `auth_users` 1 -> many `auth_sso_accounts`
- `auth_users` 1 -> many `auth_login_logs`
- `proj_projects` 1 -> many `form_forms`
- `form_forms` 1 -> many `form_fields`
- `form_fields` 1 -> many `form_field_options`
- `form_forms` 1 -> many `entry_submissions`
- `entry_submissions` 1 -> many `entry_submission_answers`
- `entry_submission_answers` 1 -> many `entry_submission_answer_options`
- `entry_submission_answers` 1 -> many `entry_submission_files`
- `form_forms` 1 -> many `item_catalogs`
- `entry_submissions` 1 -> many `item_claims`
- `item_catalogs` 1 -> many `item_claims`
- `form_forms` 1 -> many `email_notification_templates`
- `email_notification_templates` 1 -> many `email_send_logs`
- `entry_submissions` 1 -> many `email_send_logs`

---

## 6. Expected application flows

## 6.1 Admin creates a form
Typical flow:
1. admin logs in
2. admin selects a project
3. admin creates a form definition
4. admin adds fields
5. admin adds options for choice fields
6. admin optionally adds item definitions
7. admin optionally sets email notification template
8. form is published

Backend/API responsibilities:
- validate ownership / permission
- validate field type configuration
- persist field ordering
- persist option ordering

---

## 6.2 Public user submits a form
Typical flow:
1. public page is opened by `public_path`
2. app loads form definition + fields + options
3. user fills form
4. backend validates required fields and type rules
5. backend creates `entry_submissions`
6. backend creates `entry_submission_answers`
7. backend creates option child rows for checkboxes
8. backend creates file rows for file uploads
9. backend optionally creates item claim rows
10. backend optionally sends confirmation email
11. backend writes email send log

Important implementation note:
The backend should treat submission saving as a transaction where possible.

---

## 6.3 Admin scans QR for item pickup
Typical flow:
1. scanner/admin logs in
2. scanner opens QR scan page
3. scanner scans QR token
4. backend finds matching `item_claims.claim_token`
5. backend checks current claim status
6. if pending, backend marks it as received
7. backend stores `received_at` and `received_by_user_id`
8. UI shows success or already-received result

Important implementation note:
This action should be idempotent-aware. If a token has already been used, the system should not silently create duplicate receipt state.

---

## 6.4 SSO login
Typical flow:
1. user chooses SSO provider
2. provider returns identity data
3. backend checks provider email against `auth_users.email`
4. if there is no active internal user, reject access
5. if user exists, allow login
6. backend optionally create/update `auth_sso_accounts`
7. backend log result in `auth_login_logs`

Important rule:
**Do not auto-provision new admin users from SSO.**

---

## 7. Admin UI expectations

The admin UI should be friendly for non-technical users.

Recommended visible field editor labels:
- Field label
- Field description
- Placeholder
- Field type
- Required
- Unique value
- Options
- Help / advanced settings

Technical fields like `field_code` should either:
- be auto-generated, or
- appear only in advanced settings

The admin UI should not expose raw schema complexity directly.

---

## 8. Notes for backend/API agents

### 8.1 Suggested API areas
A clean backend can be organized by modules:
- auth
- projects
- forms
- submissions
- items
- email
- scanner

### 8.2 Validation responsibilities
The application layer should validate:
- required fields
- valid option IDs for the correct field
- date/time format
- rating ranges
- file constraints
- uniqueness rules when enabled
- form open/close status and time window

### 8.3 File upload handling
For `file_upload` fields:
- validate allowed file types and size in application logic
- store only metadata/path in DB
- keep actual storage implementation abstract (local, S3, etc.)

### 8.4 Email template rendering
The email template layer should be able to render variables such as:
- form name
- submission code
- respondent name
- item list
- claim token / QR link

### 8.5 QR code generation
The DB stores tokens, not image binaries.

The application should:
- generate a secure token for each claim
- create a QR image or QR payload from the token when needed
- resolve the token at scan time

### 8.6 Security
- admin endpoints require authenticated internal users
- scanner endpoints also require authenticated internal users with permission
- public submission endpoints do not require login
- file download endpoints should not expose sensitive uploads without authorization

---

## 9. Notes for frontend/admin/scanner agents

### 9.1 Public form page
Needs to:
- load form structure dynamically
- render fields by `field_type`
- display `field_label`, `field_description`, and `placeholder`
- support choice options and file uploads
- submit a normalized payload to backend

### 9.2 Admin form builder
Needs to:
- create/edit forms
- manage field list order
- manage choice options
- manage form status and schedule
- manage item definitions
- manage email templates

### 9.3 Submission management page
Needs to:
- list submissions per form
- show answers in readable format
- show uploaded files
- show attendance timestamps
- show claim statuses
- show email send result

### 9.4 QR scanner page
Needs to:
- read QR token from device camera or manual input
- call backend claim verification endpoint
- display submission/item context
- confirm claim result clearly

---

## 10. Suggested naming and implementation caution

There are two naming layers to keep separate:

### 10.1 Database names
Use the table and column names exactly as documented in this guide.

### 10.2 UI labels
Use business-friendly labels for admins and staff.

Example:
- DB column: `field_description`
- UI label: `Description`

Avoid exposing raw DB terminology when a simpler phrase exists.

---

## 11. Recommended assumptions for AI agents

Unless instructed otherwise, agents should assume:

- MariaDB is the source of truth
- the schema should use the table names documented in this guide
- soft delete should be respected in queries
- admin users are managed internally only
- SSO is allowlist-based through `auth_users.email`
- one item claim should map to one QR token
- file storage is external to database rows

---

## 12. What an AI agent should build first

A practical implementation order is:

1. auth module with local login
2. auth session/middleware/role checks
3. project CRUD
4. form CRUD
5. field CRUD
6. option CRUD
7. public form read API
8. submission create API
9. submission listing/read API
10. item definition CRUD
11. claim generation logic
12. QR scan verify/receive API
13. email template CRUD
14. email send service and logs
15. SSO integration

This order lets the system become usable early and add advanced features incrementally.

---

## 13. Final summary

This database is designed to support a configurable attendance and claim system with:

- internal admin/staff/scanner login
- future SSO support with internal user allowlist control
- dynamic Google-Forms-like field definitions
- typed submission storage
- file upload support
- item entitlement and claim tracking
- QR-based pickup flow
- configurable email confirmation and email logs

The schema is intended to be flexible enough for multiple projects and forms, but still structured enough to make reporting, admin management, and QR claim workflows reliable.
