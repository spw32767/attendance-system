import { useMemo } from "react";
import { Search } from "lucide-react";

function SubmissionsFilters({
  projects,
  forms,
  filterProjectId,
  filterFormId,
  searchText,
  onSearchChange,
  onChangeFilter,
  filteredCount,
  totalCount
}) {
  const projectForms = useMemo(
    () =>
      filterProjectId
        ? forms.filter((form) => Number(form.project_id) === Number(filterProjectId))
        : forms,
    [filterProjectId, forms]
  );

  return (
    <div className="templates-search-row submissions-filters">
      <select
        className="select-control"
        value={filterProjectId || ""}
        aria-label="กรองตามโครงการ"
        onChange={(event) => {
          const nextProjectId = Number(event.target.value) || null;
          onChangeFilter(nextProjectId, null);
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
        value={filterFormId || ""}
        aria-label="กรองตามฟอร์ม"
        onChange={(event) => onChangeFilter(filterProjectId || null, event.target.value || null)}
      >
        <option value="">ทุกฟอร์ม</option>
        {projectForms.map((form) => (
          <option key={form.form_id} value={form.form_id}>
            {form.form_name}
          </option>
        ))}
      </select>

      <div className="search-input-wrapper">
        <Search size={16} strokeWidth={2} className="search-input-icon" aria-hidden="true" />
        <input
          className="input-control search-with-icon"
          value={searchText}
          placeholder="ค้นหาโค้ด, ชื่อ, อีเมล"
          aria-label="ค้นหาคำตอบ"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <p className="templates-search-meta submissions-search-meta">
        แสดง {filteredCount} จาก {totalCount} คำตอบ
      </p>
    </div>
  );
}

export default SubmissionsFilters;
