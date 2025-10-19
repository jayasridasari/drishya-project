const Modal = ({ visible, title, children, onClose }) => {
  if (!visible) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
};
export default Modal;
