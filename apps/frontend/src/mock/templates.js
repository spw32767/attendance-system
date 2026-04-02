const clone = (value) => JSON.parse(JSON.stringify(value));

export const projectOptions = [
  { project_id: 1, project_name: "Hackathon 2026" },
  { project_id: 2, project_name: "Open House 2026" },
  { project_id: 3, project_name: "Faculty Event Website" }
];

export const templateRecords = [
  {
    form_id: "1",
    project_id: 1,
    project_name: "Hackathon 2026",
    form_name: "Hackathon 2026 Check-in",
    form_description:
      "Please complete this form before entering the main event area.",
    public_path: "hackathon2026",
    form_type: "attendance",
    status: "published",
    allow_multiple_submissions: false,
    start_at: "2026-06-01T08:00",
    end_at: "2026-06-03T20:00",
    share_key: "TGz8GIFbOifdEuw3",
    success_title: "Check-in complete",
    success_message:
      "Thanks for confirming your attendance. Keep your QR code for item claims."
  },
  {
    form_id: "2",
    project_id: 2,
    project_name: "Open House 2026",
    form_name: "Open House Walk-in",
    form_description:
      "Share your visit details so we can prepare booths and welcome kits.",
    public_path: "openhouse2026",
    form_type: "registration",
    status: "closed",
    allow_multiple_submissions: true,
    start_at: "2026-07-10T09:00",
    end_at: "2026-07-11T18:00",
    share_key: "TGz8sdawrasfsdew4",
    success_title: "Registration submitted",
    success_message:
      "Your response was recorded. Our team will notify you by email if needed."
  }
];

const templateDraftSeeds = {
  "1": {
    project_id: 1,
    form_name: "Hackathon 2026 Check-in",
    form_description:
      "Please complete this form before entering the main event area.",
    public_path: "hackathon2026",
    form_type: "attendance",
    status: "published",
    allow_multiple_submissions: false,
    start_at: "2026-06-01T08:00",
    end_at: "2026-06-03T20:00",
    success_title: "Check-in complete",
    success_message:
      "Thanks for confirming your attendance. Keep your QR code for item claims.",
    fields: [
      {
        id: "seed_1",
        field_code: "full_name",
        field_label: "Full Name",
        field_description: "Use your legal name as shown on your ID card.",
        placeholder: "Enter your full name",
        field_type: "short_text",
        field_usage: "full_name",
        is_required: true,
        is_unique_value: false,
        allow_other_option: false,
        sort_order: 1,
        settings_json: {},
        options: []
      },
      {
        id: "seed_2",
        field_code: "email",
        field_label: "Email",
        field_description: "Used for confirmation and QR claim email.",
        placeholder: "name@example.com",
        field_type: "short_text",
        field_usage: "email",
        is_required: true,
        is_unique_value: true,
        allow_other_option: false,
        sort_order: 2,
        settings_json: {},
        options: []
      },
      {
        id: "seed_3",
        field_code: "track",
        field_label: "Preferred Track",
        field_description: "Select your primary interest for day one activities.",
        placeholder: "",
        field_type: "multiple_choice",
        field_usage: "general",
        is_required: true,
        is_unique_value: false,
        allow_other_option: true,
        sort_order: 3,
        settings_json: {},
        options: [
          {
            id: "seed_3_opt_1",
            option_label: "AI Engineering",
            option_value: "ai_engineering",
            sort_order: 1
          },
          {
            id: "seed_3_opt_2",
            option_label: "Web Platform",
            option_value: "web_platform",
            sort_order: 2
          },
          {
            id: "seed_3_opt_3",
            option_label: "Data Science",
            option_value: "data_science",
            sort_order: 3
          }
        ]
      }
    ]
  },
  "2": {
    project_id: 2,
    form_name: "Open House Walk-in",
    form_description:
      "Share your visit details so we can prepare booths and welcome kits.",
    public_path: "openhouse2026",
    form_type: "registration",
    status: "closed",
    allow_multiple_submissions: true,
    start_at: "2026-07-10T09:00",
    end_at: "2026-07-11T18:00",
    success_title: "Registration submitted",
    success_message:
      "Your response was recorded. Our team will notify you by email if needed.",
    fields: [
      {
        id: "seed_4",
        field_code: "student_code",
        field_label: "Student Code",
        field_description: "8-10 digits without spaces.",
        placeholder: "670000000",
        field_type: "short_text",
        field_usage: "student_code",
        is_required: true,
        is_unique_value: true,
        allow_other_option: false,
        sort_order: 1,
        settings_json: {},
        options: []
      },
      {
        id: "seed_5",
        field_code: "interests",
        field_label: "Topics of Interest",
        field_description: "Choose every area you want to explore.",
        placeholder: "",
        field_type: "checkboxes",
        field_usage: "general",
        is_required: true,
        is_unique_value: false,
        allow_other_option: true,
        sort_order: 2,
        settings_json: {},
        options: [
          {
            id: "seed_5_opt_1",
            option_label: "Computer Engineering",
            option_value: "computer_engineering",
            sort_order: 1
          },
          {
            id: "seed_5_opt_2",
            option_label: "IoT Lab",
            option_value: "iot_lab",
            sort_order: 2
          },
          {
            id: "seed_5_opt_3",
            option_label: "Scholarship Program",
            option_value: "scholarship_program",
            sort_order: 3
          }
        ]
      },
      {
        id: "seed_6",
        field_code: "visit_date",
        field_label: "Visit Date",
        field_description: "Pick the date you plan to come.",
        placeholder: "",
        field_type: "date",
        field_usage: "general",
        is_required: true,
        is_unique_value: false,
        allow_other_option: false,
        sort_order: 3,
        settings_json: {},
        options: []
      }
    ]
  }
};

export const getTemplateById = (templateId) =>
  templateRecords.find((template) => template.form_id === String(templateId)) || null;

export const getTemplateDraftById = (templateId) => {
  const value = templateDraftSeeds[String(templateId)];
  return value ? clone(value) : null;
};
