import { useEffect } from "react";
import "../css/ToastMessage.css";

const ToastMessage = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`toast-message alert alert-${type} alert-dismissible fade show`}
      role="alert"
    >
      {message}

      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  );
};

export default ToastMessage;
