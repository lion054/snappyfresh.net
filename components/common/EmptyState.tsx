interface EmptyStateProps {
  icon?: string;
  title: string;
  text?: string;
}

export default function EmptyState({ icon = 'fi-rs-inbox', title, text }: EmptyStateProps) {
  return (
    <div className="sf-empty">
      <i className={`${icon} sf-empty__icon`}></i>
      <h5 className="sf-empty__title">{title}</h5>
      {text && <p className="sf-empty__text">{text}</p>}
    </div>
  );
}
