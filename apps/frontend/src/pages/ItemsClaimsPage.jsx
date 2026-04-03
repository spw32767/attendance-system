import { useMemo, useState } from "react";
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
  onNavigate
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

  return (
    <AdminLayout
      breadcrumbs={["แอดมิน", mode === "items" ? "รายการของ" : "สิทธิ์รับของ"]}
      onLogout={onLogout}
      theme={theme}
      onToggleTheme={onToggleTheme}
      navItems={navItems}
      activePath={activePath}
      onNavigate={onNavigate}
    >
      <section className="templates-head">
        <h1>{mode === "items" ? "รายการของตามฟอร์ม" : "ติดตามสิทธิ์รับของ"}</h1>
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

          <input
            className="input-control"
            value={searchText}
            placeholder="ค้นหา"
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <div className="templates-table-wrap">
          <table className="templates-table">
            <thead>
              {mode === "items" ? (
                <tr>
                  <th>Item Code</th>
                  <th>รายการ</th>
                  <th>โครงการ/ฟอร์ม</th>
                  <th>ประเภท</th>
                  <th>จำนวนเริ่มต้น</th>
                  <th>สถานะ</th>
                </tr>
              ) : (
                <tr>
                  <th>Claim Token</th>
                  <th>Submission</th>
                  <th>รายการ</th>
                  <th>โครงการ/ฟอร์ม</th>
                  <th>สถานะ</th>
                  <th>เวลารับของ</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={6}>
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : mode === "items" ? (
                filteredRows.map((item) => (
                  <tr key={item.item_id}>
                    <td>{item.item_code}</td>
                    <td>{item.item_name}</td>
                    <td>
                      <div className="project-title-cell">
                        <p>{item.project_name}</p>
                        <small>{item.form_name}</small>
                      </div>
                    </td>
                    <td>{item.item_type}</td>
                    <td>{item.default_qty}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          item.is_active ? "status-pill-active" : "status-pill-inactive"
                        }`}
                      >
                        {item.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                filteredRows.map((claim) => {
                  const statusMeta = CLAIM_STATUS_META[claim.receive_status] || CLAIM_STATUS_META.pending;
                  return (
                    <tr key={claim.claim_id}>
                      <td>{claim.claim_token}</td>
                      <td>{claim.submission_code}</td>
                      <td>{claim.item_name}</td>
                      <td>
                        <div className="project-title-cell">
                          <p>{claim.project_name}</p>
                          <small>{claim.form_name}</small>
                        </div>
                      </td>
                      <td>
                        <span className={statusMeta.className}>{statusMeta.label}</span>
                        <div className="inline-action-row" style={{ marginTop: 6 }}>
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => onUpdateClaimStatus?.(claim.claim_id, "received")}
                          >
                            ตั้งเป็นรับแล้ว
                          </button>
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => onUpdateClaimStatus?.(claim.claim_id, "pending")}
                          >
                            ตั้งเป็นรอรับ
                          </button>
                        </div>
                      </td>
                      <td>
                        {claim.received_at
                          ? new Date(claim.received_at).toLocaleString("th-TH")
                          : "-"}
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
