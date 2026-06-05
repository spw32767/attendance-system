export const STATUS_META = {
  present: { label: "เข้างานแล้ว", className: "status-pill status-pill-active" },
  submitted: { label: "ส่งข้อมูลแล้ว", className: "status-pill status-pill-draft" },
  completed: { label: "เสร็จสิ้น", className: "status-pill status-pill-active" },
  cancelled: { label: "ยกเลิก", className: "status-pill status-pill-inactive" }
};

export const SOURCE_TYPE_LABELS = {
  public_form: "ผู้เข้าร่วมกรอกเอง",
  import_excel: "นำเข้าจาก Excel"
};

export const PREVIEW_STATUS_META = {
  ready_insert: { label: "พร้อมนำเข้า", className: "status-pill status-pill-active" },
  reactivate: { label: "จะเปิดใช้งาน", className: "status-pill status-pill-draft" },
  skip_duplicate: { label: "ข้ามซ้ำ", className: "status-pill status-pill-inactive" },
  error: { label: "ผิดพลาด", className: "status-pill status-pill-inactive" }
};

export const EMPTY_EXPORT_FILTERS = {
  attendance_status: "",
  source_type: ""
};

// Native <input type="datetime-local"> emits "YYYY-MM-DDTHH:mm". Backend wants "YYYY-MM-DD HH:mm:ss".
export const toSqlDateTime = (value) => {
  if (!value) {
    return undefined;
  }
  const [datePart, timePart = "00:00"] = value.split("T");
  return `${datePart} ${timePart.length === 5 ? `${timePart}:00` : timePart}`;
};
