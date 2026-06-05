function PageHead({ title, meta, description, actions, className = "" }) {
  return (
    <header className={`page-head${className ? ` ${className}` : ""}`}>
      <div className="page-head-text">
        <h1>{title}</h1>
        {meta ? <p className="page-head-meta">{meta}</p> : null}
        {description ? <p className="page-head-description">{description}</p> : null}
      </div>
      {actions ? <div className="page-head-actions">{actions}</div> : null}
    </header>
  );
}

export default PageHead;
