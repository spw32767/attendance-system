export const FORM_TYPES = [
  { value: "attendance", label: "เช็กชื่อเข้าร่วม" },
  { value: "pickup", label: "รับของ" },
  { value: "registration", label: "ลงทะเบียน" },
  { value: "custom", label: "กำหนดเอง" }
];

export const FORM_STATUSES = [
  { value: "draft", label: "ฉบับร่าง" },
  { value: "published", label: "เปิดใช้งาน" },
  { value: "closed", label: "ปิดใช้งาน" }
];

export const FIELD_TYPES = [
  { value: "short_text", label: "คำตอบสั้น" },
  { value: "long_text", label: "คำตอบยาว" },
  { value: "multiple_choice", label: "ตัวเลือกเดียว" },
  { value: "checkboxes", label: "หลายตัวเลือก" },
  { value: "dropdown", label: "รายการแบบเลื่อนลง" },
  { value: "rating", label: "ให้คะแนน" },
  { value: "date", label: "วันที่" },
  { value: "time", label: "เวลา" },
  { value: "file_upload", label: "อัปโหลดไฟล์" }
];

export const FIELD_USAGES = [
  { value: "general", label: "ทั่วไป" },
  { value: "full_name", label: "ชื่อ-นามสกุล" },
  { value: "first_name", label: "ชื่อ" },
  { value: "last_name", label: "นามสกุล" },
  { value: "email", label: "อีเมล" },
  { value: "phone", label: "เบอร์โทร" },
  { value: "student_code", label: "รหัสนักศึกษา" },
  { value: "birth_date", label: "วันเกิด" }
];

export const CHOICE_FIELD_TYPES = new Set([
  "multiple_choice",
  "checkboxes",
  "dropdown"
]);
