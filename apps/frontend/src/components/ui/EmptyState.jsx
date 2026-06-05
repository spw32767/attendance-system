function EmptyState({ icon, title, description, action, className = "" }) {
  return (
    <div className={`ui-empty${className ? ` ${className}` : ""}`} role="status">
      {icon ? <div className="ui-empty-icon" aria-hidden="true">{icon}</div> : null}
      {title ? <h3 className="ui-empty-title">{title}</h3> : null}
      {description ? <p className="ui-empty-description">{description}</p> : null}
      {action ? <div className="ui-empty-action">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
