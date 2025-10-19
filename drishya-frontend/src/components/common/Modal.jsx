export default function Modal({ visible, title, children, onClose }) {
  if (!visible) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
