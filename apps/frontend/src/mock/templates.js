const clone = (value) => JSON.parse(JSON.stringify(value));

export const projectOptions = [
  { project_id: 1, project_name: "แฮกกาธอน 2026" },
  { project_id: 2, project_name: "เปิดบ้าน 2026" },
  { project_id: 3, project_name: "เว็บไซต์กิจกรรมคณะ" }
];

export const templateRecords = [
  {
    form_id: "1",
    project_id: 1,
    project_name: "แฮกกาธอน 2026",
    form_name: "ลงชื่อเข้างาน แฮกกาธอน 2026",
    form_description:
      "กรุณากรอกแบบฟอร์มนี้ก่อนเข้าพื้นที่จัดงานหลัก",
    public_path: "hackathon2026",
    form_type: "attendance",
    status: "published",
    allow_multiple_submissions: false,
    start_at: "2026-06-01T08:00",
    end_at: "2026-06-03T20:00",
    share_key: "TGz8GIFbOifdEuw3",
    success_title: "ลงชื่อสำเร็จ",
    success_message:
      "ขอบคุณที่ยืนยันการเข้าร่วม กรุณาเก็บ QR Code ไว้สำหรับรับของ"
  },
  {
    form_id: "2",
    project_id: 2,
    project_name: "เปิดบ้าน 2026",
    form_name: "ลงทะเบียนเข้างาน Open House",
    form_description:
      "กรอกข้อมูลการเข้าร่วมเพื่อให้ทีมงานเตรียมบูธและของต้อนรับได้เหมาะสม",
    public_path: "openhouse2026",
    form_type: "registration",
    status: "closed",
    allow_multiple_submissions: true,
    start_at: "2026-07-10T09:00",
    end_at: "2026-07-11T18:00",
    share_key: "TGz8sdawrasfsdew4",
    success_title: "ส่งแบบลงทะเบียนแล้ว",
    success_message:
      "ระบบบันทึกข้อมูลเรียบร้อยแล้ว ทีมงานจะแจ้งกลับทางอีเมลหากมีข้อมูลเพิ่มเติม"
  }
];

const templateDraftSeeds = {
  "1": {
    project_id: 1,
    form_name: "ลงชื่อเข้างาน แฮกกาธอน 2026",
    form_description:
      "กรุณากรอกแบบฟอร์มนี้ก่อนเข้าพื้นที่จัดงานหลัก",
    public_path: "hackathon2026",
    form_type: "attendance",
    status: "published",
    allow_multiple_submissions: false,
    start_at: "2026-06-01T08:00",
    end_at: "2026-06-03T20:00",
    success_title: "ลงชื่อสำเร็จ",
    success_message:
      "ขอบคุณที่ยืนยันการเข้าร่วม กรุณาเก็บ QR Code ไว้สำหรับรับของ",
    fields: [
      {
        id: "seed_1",
        field_code: "full_name",
        field_label: "ชื่อ-นามสกุล",
        field_description: "กรอกชื่อจริงตามบัตรประชาชนหรือบัตรนักศึกษา",
        placeholder: "กรอกชื่อ-นามสกุล",
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
        field_label: "อีเมล",
        field_description: "ใช้สำหรับยืนยันการลงทะเบียนและส่งข้อมูลรับของ",
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
        field_label: "สายกิจกรรมที่สนใจ",
        field_description: "เลือกหัวข้อที่สนใจเป็นหลักสำหรับกิจกรรมวันแรก",
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
            option_label: "วิศวกรรม AI",
            option_value: "ai_engineering",
            sort_order: 1
          },
          {
            id: "seed_3_opt_2",
            option_label: "แพลตฟอร์มเว็บ",
            option_value: "web_platform",
            sort_order: 2
          },
          {
            id: "seed_3_opt_3",
            option_label: "วิทยาการข้อมูล",
            option_value: "data_science",
            sort_order: 3
          }
        ]
      }
    ]
  },
  "2": {
    project_id: 2,
    form_name: "ลงทะเบียนเข้างาน Open House",
    form_description:
      "กรอกข้อมูลการเข้าร่วมเพื่อให้ทีมงานเตรียมบูธและของต้อนรับได้เหมาะสม",
    public_path: "openhouse2026",
    form_type: "registration",
    status: "closed",
    allow_multiple_submissions: true,
    start_at: "2026-07-10T09:00",
    end_at: "2026-07-11T18:00",
    success_title: "ส่งแบบลงทะเบียนแล้ว",
    success_message:
      "ระบบบันทึกข้อมูลเรียบร้อยแล้ว ทีมงานจะแจ้งกลับทางอีเมลหากมีข้อมูลเพิ่มเติม",
    fields: [
      {
        id: "seed_4",
        field_code: "student_code",
        field_label: "รหัสนักศึกษา",
        field_description: "กรอกเป็นตัวเลข 8-10 หลัก โดยไม่ต้องเว้นวรรค",
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
        field_label: "หัวข้อที่สนใจ",
        field_description: "เลือกได้หลายข้อตามหัวข้อที่อยากเข้าชม",
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
            option_label: "วิศวกรรมคอมพิวเตอร์",
            option_value: "computer_engineering",
            sort_order: 1
          },
          {
            id: "seed_5_opt_2",
            option_label: "ห้องปฏิบัติการ IoT",
            option_value: "iot_lab",
            sort_order: 2
          },
          {
            id: "seed_5_opt_3",
            option_label: "ทุนการศึกษา",
            option_value: "scholarship_program",
            sort_order: 3
          }
        ]
      },
      {
        id: "seed_6",
        field_code: "visit_date",
        field_label: "วันที่เข้าร่วม",
        field_description: "เลือกวันที่ต้องการเข้าร่วมงาน",
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
