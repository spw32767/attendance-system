export const FORM_TYPES = [
  { value: "attendance", label: "Attendance" },
  { value: "pickup", label: "Item Pickup" },
  { value: "registration", label: "Registration" },
  { value: "custom", label: "Custom" }
];

export const FORM_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "closed", label: "Closed" }
];

export const FIELD_TYPES = [
  { value: "short_text", label: "Short answer" },
  { value: "long_text", label: "Paragraph" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "rating", label: "Rating" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" }
];

export const FIELD_USAGES = [
  { value: "general", label: "General" },
  { value: "full_name", label: "Full name" },
  { value: "first_name", label: "First name" },
  { value: "last_name", label: "Last name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "student_code", label: "Student code" },
  { value: "birth_date", label: "Birth date" }
];

export const CHOICE_FIELD_TYPES = new Set([
  "multiple_choice",
  "checkboxes",
  "dropdown"
]);
