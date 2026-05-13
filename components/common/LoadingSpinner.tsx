export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="sf-loading">
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <p className="sf-loading__text">{text}</p>
    </div>
  );
}
