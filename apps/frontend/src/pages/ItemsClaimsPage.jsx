import { useMemo, useState } from "react";
import { CheckCheck, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { Button, Modal, PageHead } from "../components/ui";

const CLAIM_STATUS_META = {
  pending: { label: "รอรับ", className: "status-pill status-pill-draft" },
  received: { label: "รับแล้ว", className: "status-pill status-pill-active" },
  cancelled: { label: "ยกเลิก", className: "status-pill status-pill-inactive" }
};

const ITEM_TYPE_OPTIONS = [
  { value: "souvenir", label: "ของที่ระลึก" },
  { value: "reward", label: "ของรางวัล" },
  { value: "meal", label: "อาหาร / คูปองอาหาร" },
  { value: "badge", label: "ป้าย / เอกสาร" }
];

const BLANK_ITEM_DRAFT = {
  form_id: "",
  item_name: "",
  item_code: "",
  item_type: "souvenir",
  default_qty: 1
};

function ItemsClaimsPage({
  mode,
  rows,
  projects,
  forms,
  onUpdateClaimStatus,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
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

  const [itemModal, setItemModal] = useState(null); // null | { mode: 'create' | 'edit', draft, original? }
  const [itemError, setItemError] = useState("");
  const [itemBusy, setItemBusy] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null); // null | item row
  const [deleteBusy, setDeleteBusy] = useState(false);

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

  const openCreate = () => {
    setItemModal({
      mode: "create",
      draft: {
        ...BLANK_ITEM_DRAFT,
        form_id: formFilter || ""
      }
    });
    setItemError("");
  };

  const openEdit = (item) => {
    setItemModal({
      mode: "edit",
      draft: {
        form_id: String(item.form_id),
        item_name: item.item_name || "",
        item_code: item.item_code || "",
        item_type: item.item_type || "souvenir",
        default_qty: Number(item.default_qty || 1)
      },
      original: item
    });
    setItemError("");
  };

  const closeItemModal = () => {
    if (itemBusy) {
      return;
    }
    setItemModal(null);
    setItemError("");
  };

  const handleItemSubmit = async (event) => {
    event.preventDefault();
    if (!itemModal || itemBusy) {
      return;
    }
    if (!itemModal.draft.form_id) {
      setItemError("กรุณาเลือกฟอร์ม");
      return;
    }
    if (!itemModal.draft.item_name.trim()) {
      setItemError("กรุณากรอกชื่อรายการ");
      return;
    }
    setItemBusy(true);
    setItemError("");
    try {
      const payload = {
        item_name: itemModal.draft.item_name.trim(),
        item_code: itemModal.draft.item_code.trim() || undefined,
        item_type: itemModal.draft.item_type,
        default_qty: Number(itemModal.draft.default_qty) || 1
      };
      if (itemModal.mode === "create") {
        await onCreateItem(Number(itemModal.draft.form_id), payload);
      } else {
        await onUpdateItem(itemModal.original.item_id, payload);
      }
      setItemModal(null);
    } catch (err) {
      setItemError(err?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setItemBusy(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await onUpdateItem(item.item_id, { is_active: !item.is_active });
    } catch (err) {
      // Surface inline next round; for now just log.
      // eslint-disable-next-line no-console
      console.error("toggle item active failed", err);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem || deleteBusy) {
      return;
    }
    setDeleteBusy(true);
    try {
      await onDeleteItem(deletingItem.item_id);
      setDeletingItem(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("delete item failed", err);
    } finally {
      setDeleteBusy(false);
    }
  };

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
      <PageHead
        title={mode === "items" ? "รายการของตามฟอร์ม" : "ติดตามสิทธิ์รับของ"}
        meta={
          mode === "items"
            ? `${rows.length} รายการ · ${activeRowsCount} กำลังใช้งาน · ${pendingRowsCount} ปิดใช้งาน`
            : `${rows.length} สิทธิ์ · ${activeRowsCount} รับแล้ว · ${pendingRowsCount} รอรับ`
        }
        actions={
          mode === "items" ? (
            <Button variant="primary" onClick={openCreate}>
              <Plus size={14} aria-hidden="true" />
              <span>เพิ่มของรางวัล</span>
            </Button>
          ) : null
        }
      />

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
                  <th className="table-col-actions">การจัดการ</th>
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
                  <td className="empty-row" colSpan={mode === "items" ? 7 : 7}>
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
                      <div className="table-status-control">
                        <label className="toggle-switch-label table-status-switch">
                          <input
                            type="checkbox"
                            checked={item.is_active}
                            onChange={() => handleToggleActive(item)}
                          />
                          <span
                            className="toggle-switch-track"
                            data-off-label="ปิด"
                            data-on-label="เปิด"
                          >
                            <span className="toggle-switch-thumb" />
                          </span>
                        </label>
                      </div>
                    </td>
                    <td className="table-col-actions">
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                          <Pencil size={13} strokeWidth={2} aria-hidden="true" />
                          <span>แก้ไข</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingItem(item)}
                        >
                          <Trash2 size={13} strokeWidth={2} aria-hidden="true" />
                          <span>ลบ</span>
                        </Button>
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
                          <Button variant="primary" size="sm" onClick={primaryAction.onClick}>
                            <PrimaryActionIcon size={13} strokeWidth={2} aria-hidden="true" />
                            <span>{primaryAction.label}</span>
                          </Button>
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

      <Modal
        open={Boolean(itemModal)}
        onClose={closeItemModal}
        title={itemModal?.mode === "edit" ? "แก้ไขรายการ" : "เพิ่มของรางวัล"}
        description={
          itemModal?.mode === "edit"
            ? "อัปเดตข้อมูลรายการ"
            : "เลือกฟอร์มที่จะผูกของ และตั้งจำนวนเริ่มต้นต่อหนึ่งสิทธิ์"
        }
        size="md"
        closeOnBackdrop={!itemBusy}
      >
        {itemModal ? (
          <form onSubmit={handleItemSubmit} className="auth-form">
            <label className="auth-form-field">
              <span>ฟอร์ม</span>
              <select
                className="select-control"
                value={itemModal.draft.form_id}
                onChange={(event) =>
                  setItemModal({
                    ...itemModal,
                    draft: { ...itemModal.draft, form_id: event.target.value }
                  })
                }
                disabled={itemBusy || itemModal.mode === "edit"}
                required
              >
                <option value="">เลือกฟอร์ม</option>
                {forms.map((form) => (
                  <option key={form.form_id} value={form.form_id}>
                    {form.project_name ? `${form.project_name} / ` : ""}
                    {form.form_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="auth-form-field">
              <span>ชื่อรายการ</span>
              <input
                className="input-control"
                value={itemModal.draft.item_name}
                onChange={(event) =>
                  setItemModal({
                    ...itemModal,
                    draft: { ...itemModal.draft, item_name: event.target.value }
                  })
                }
                placeholder="เช่น แก้วน้ำของที่ระลึก"
                required
                disabled={itemBusy}
              />
            </label>
            <label className="auth-form-field">
              <span>รหัสรายการ (ตัวพิมพ์ใหญ่อังกฤษ/ตัวเลข — เว้นว่างให้ระบบตั้งให้)</span>
              <input
                className="input-control"
                value={itemModal.draft.item_code}
                onChange={(event) =>
                  setItemModal({
                    ...itemModal,
                    draft: { ...itemModal.draft, item_code: event.target.value }
                  })
                }
                placeholder="เช่น TUMBLER_2026"
                disabled={itemBusy}
              />
            </label>
            <label className="auth-form-field">
              <span>ประเภท</span>
              <select
                className="select-control"
                value={itemModal.draft.item_type}
                onChange={(event) =>
                  setItemModal({
                    ...itemModal,
                    draft: { ...itemModal.draft, item_type: event.target.value }
                  })
                }
                disabled={itemBusy}
              >
                {ITEM_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="auth-form-field">
              <span>จำนวนต่อคน</span>
              <input
                className="input-control"
                type="number"
                min={1}
                max={1000}
                value={itemModal.draft.default_qty}
                onChange={(event) =>
                  setItemModal({
                    ...itemModal,
                    draft: { ...itemModal.draft, default_qty: event.target.value }
                  })
                }
                required
                disabled={itemBusy}
              />
            </label>
            {itemError ? <p className="login-form-error">{itemError}</p> : null}
            <div className="auth-form-actions">
              <Button type="button" variant="ghost" onClick={closeItemModal} disabled={itemBusy}>
                ยกเลิก
              </Button>
              <Button type="submit" variant="primary" loading={itemBusy} disabled={itemBusy}>
                {itemModal.mode === "edit" ? "บันทึก" : "เพิ่มรายการ"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(deletingItem)}
        onClose={() => (deleteBusy ? null : setDeletingItem(null))}
        title="ลบรายการ"
        description={
          deletingItem
            ? `${deletingItem.item_name} (${deletingItem.item_code})`
            : ""
        }
        size="sm"
        closeOnBackdrop={!deleteBusy}
      >
        <div className="auth-form">
          <p className="auth-form-hint">
            ลบรายการนี้ออกจากฟอร์ม สิทธิ์รับของที่ออกไปแล้ว (claim tokens) จะยังคงอยู่และยังสแกนได้
            แต่ submission ใหม่จะไม่ได้รับสิทธิ์นี้อีก
          </p>
          <div className="auth-form-actions">
            <Button type="button" variant="ghost" onClick={() => setDeletingItem(null)} disabled={deleteBusy}>
              ยกเลิก
            </Button>
            <Button type="button" variant="danger" loading={deleteBusy} disabled={deleteBusy} onClick={handleDelete}>
              ลบรายการ
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

export default ItemsClaimsPage;
