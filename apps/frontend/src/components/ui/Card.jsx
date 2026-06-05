function Card({ as: Tag = "section", className = "", title, actions, footer, children, ...rest }) {
  return (
    <Tag className={`ui-card${className ? ` ${className}` : ""}`} {...rest}>
      {title || actions ? (
        <header className="ui-card-head">
          {title ? <h3 className="ui-card-title">{title}</h3> : null}
          {actions ? <div className="ui-card-actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="ui-card-body">{children}</div>
      {footer ? <footer className="ui-card-footer">{footer}</footer> : null}
    </Tag>
  );
}

export default Card;
