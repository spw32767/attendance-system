/**
 * Friendly empty/no-results state for a table body. Renders a full row whose
 * single cell spans the table, with an optional icon, a title, an optional
 * description, and an optional action (e.g. a "create" button). Works in both
 * the desktop table and the mobile card layout.
 */
export default function TableEmpty({ colSpan = 1, icon, title, description, action }) {
  return (
    <tr>
      <td className="empty-row" colSpan={colSpan}>
        <div className="table-empty">
          {icon ? (
            <span className="table-empty-icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <p className="table-empty-title">{title}</p>
          {description ? <p className="table-empty-desc">{description}</p> : null}
          {action ? <div className="table-empty-action">{action}</div> : null}
        </div>
      </td>
    </tr>
  );
}
