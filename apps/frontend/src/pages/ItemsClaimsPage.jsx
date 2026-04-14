import { useMemo, useState } from "react";
import { CheckCheck, RotateCcw, Search } from "lucide-react";
import AdminLayout from "../components/AdminLayout";

const CLAIM_STATUS_META = {
  pending: { label: "รอรับ", className: "status-pill status-pill-draft" },
  received: { label: "รับแล้ว", className: "status-pill status-pill-active" },
  cancelled: { label: "ยกเลิก", className: "status-pill status-pill-inactive" }
};

function ItemsClaimsPage({
  mode,
  rows,
  projects,
  forms,
  onUpdateClaimStatus,
  onLogout,
  theme,
  onToggleTheme,
  navItems,
  activePath,
  onNavigate,
  currentRole,
  onRoleChange
}) {
  const [projectFilter, setProjectFilter] = useState("");
  const [formFilter, setFormFilter] = useState("");
  const [searchText, setSearchText] = useState("");

  const projectForms = useMemo(
    () =>
      projectFilter
        ? forms.filter((form) => Number(form.project_id) === Number(projectFilter))
        : forms,
    [projectFilter, forms]
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (projectFilter && Number(row.project_id) !== Number(projectFilter)) {
        return false;
      }
      if (formFilter && String(row.form_id) !== String(formFilter)) {
        return false;
      }

      const keyword = searchText.trim().toLowerCase();
      if (!keyword) {
        return true;
      }

      return Object.values(row).join(" ").toLowerCase().includes(keyword);
    });
  }, [rows, projectFilter, formFilter, searchText]);

  const activeRowsCount = useMemo(() => {
    if (mode === "items") {
      return rows.filter((row) => row.is_active).length;
    }

    return rows.filter((row) => row.receive_status === "received").length;
  }, [mode, rows]);

  const pendingRowsCount = useMemo(() => {
    if (mode === "items") {
      return rows.filter((row) => !row.is_active).length;
    }

    return rows.filter((row) => row.receive_status === "pending").length;
  }, [mode, rows]);

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", mode === "items" ? "รายการของ" : "สิทธิ์รับของ"]}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      navItems={navItems}
      activePath={activePath}
      onNavigate={onNavigate}
      currentRole={currentRole}
      onRoleChange={onRoleChange}
    >
      <section className="templates-head">
        <div className="page-head-body">
          <p className="page-kicker">Operations</p>
          <h1>{mode === "items" ? "รายการของตามฟอร์ม" : "ติดตามสิทธิ์รับของ"}</h1>
          <p className="page-summary">
            {mode === "items"
              ? "ตรวจสอบรายการของที่ผูกกับแต่ละฟอร์ม พร้อมดูสถานะการใช้งานแบบรวมศูนย์"
              : "ติดตามสิทธิ์รับของที่สร้างจากคำตอบแบบฟอร์มและอัปเดตสถานะการรับได้ทันที"}
          </p>
          <div className="page-stats">
            <div className="page-stat">
              <strong>{rows.length}</strong>
              <span>{mode === "items" ? "รายการทั้งหมด" : "สิทธิ์ทั้งหมด"}</span>
            </div>
            <div className="page-stat">
              <strong>{activeRowsCount}</strong>
              <span>{mode === "items" ? "กำลังใช้งาน" : "รับแล้ว"}</span>
            </div>
            <div className="page-stat">
              <strong>{pendingRowsCount}</strong>
              <span>{mode === "items" ? "ปิดใช้งาน" : "รอรับ"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="templates-card">
        <div className="templates-search-row submissions-filters">
          <select
            className="select-control"
            value={projectFilter}
            onChange={(event) => {
              setProjectFilter(event.target.value);
              setFormFilter("");
            }}
          >
            <option value="">ทุกโครงการ</option>
            {projects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.project_name}
              </option>
            ))}
          </select>

          <select
            className="select-control"
            value={formFilter}
            onChange={(event) => setFormFilter(event.target.value)}
          >
            <option value="">ทุกฟอร์ม</option>
            {projectForms.map((form) => (
              <option key={form.form_id} value={form.form_id}>
                {form.form_name}
              </option>
            ))}
          </select>

          <div className="search-input-wrapper">
            <Search size={16} strokeWidth={2} className="search-input-icon" />
            <input
              className="input-control search-with-icon"
              value={searchText}
              placeholder="ค้นหา"
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
          <p className="templates-search-meta submissions-search-meta">
            แสดง {filteredRows.length} จาก {rows.length} รายการ
          </p>
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table table-first-col-left">
            <thead>
              {mode === "items" ? (
                <tr>
                  <th className="table-col-secondary">Item Code</th>
                  <th className="table-col-primary table-col-left">รายการ</th>
                  <th className="table-col-meta">โครงการ/ฟอร์ม</th>
                  <th className="table-col-secondary">ประเภท</th>
                  <th className="table-col-secondary">จำนวนเริ่มต้น</th>
                  <th className="table-col-status">สถานะ</th>
                </tr>
              ) : (
                <tr>
                  <th className="table-col-secondary">Claim Token</th>
                  <th className="table-col-secondary">Submission</th>
                  <th className="table-col-primary table-col-left">รายการ</th>
                  <th className="table-col-meta">โครงการ/ฟอร์ม</th>
                  <th className="table-col-status">สถานะ</th>
                  <th className="table-col-date">เวลารับของ</th>
                  <th className="table-col-actions">การจัดการ</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={mode === "items" ? 6 : 7}>
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : mode === "items" ? (
                filteredRows.map((item) => (
                  <tr key={item.item_id}>
                    <td className="table-col-secondary">
                      <span className="table-code">{item.item_code}</span>
                    </td>
                    <td className="table-col-primary table-col-left">
                      <div className="table-primary-cell">
                        <p>{item.item_name}</p>
                        <small>{item.item_type}</small>
                      </div>
                    </td>
                    <td className="table-col-meta">
                      <div className="table-primary-cell">
                        <p>{item.project_name}</p>
                        <small>{item.form_name}</small>
                      </div>
                    </td>
                    <td className="table-col-secondary">{item.item_type}</td>
                    <td className="table-col-secondary">{item.default_qty}</td>
                    <td className="table-col-status">
                      <div className="table-status-readout">
                        <span
                          className={`status-pill ${
                            item.is_active ? "status-pill-active" : "status-pill-inactive"
                          }`}
                        >
                          {item.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredRows.map((claim) => {
                  const statusMeta = CLAIM_STATUS_META[claim.receive_status] || CLAIM_STATUS_META.pending;
                  const primaryAction =
                    claim.receive_status === "received"
                      ? {
                          label: "ตั้งเป็นรอรับ",
                          icon: RotateCcw,
                          onClick: () => onUpdateClaimStatus?.(claim.claim_id, "pending")
                        }
                      : {
                          label: "รับแล้ว",
                          icon: CheckCheck,
                          onClick: () => onUpdateClaimStatus?.(claim.claim_id, "received")
                        };

                  const PrimaryActionIcon = primaryAction.icon;

                  return (
                    <tr key={claim.claim_id}>
                      <td className="table-col-secondary">
                        <span className="table-code">{claim.claim_token}</span>
                      </td>
                      <td className="table-col-secondary">{claim.submission_code}</td>
                      <td className="table-col-primary table-col-left">
                        <div className="table-primary-cell">
                          <p>{claim.item_name}</p>
                          <small>{claim.received_at ? "บันทึกเวลารับแล้ว" : "รอยืนยันการรับของ"}</small>
                        </div>
                      </td>
                      <td className="table-col-meta">
                        <div className="table-primary-cell">
                          <p>{claim.project_name}</p>
                          <small>{claim.form_name}</small>
                        </div>
                      </td>
                      <td className="table-col-status">
                        <div className="table-status-readout">
                          <span className={statusMeta.className}>{statusMeta.label}</span>
                        </div>
                      </td>
                      <td className="table-col-date">
                        {claim.received_at
                          ? new Date(claim.received_at).toLocaleString("th-TH")
                          : "-"}
                      </td>
                      <td className="table-col-actions">
                        <div className="table-actions">
                          <button
                            className="table-action-button table-action-button-primary"
                            type="button"
                            onClick={primaryAction.onClick}
                          >
                            <PrimaryActionIcon size={13} strokeWidth={2} />
                            <span>{primaryAction.label}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

export default ItemsClaimsPage;
