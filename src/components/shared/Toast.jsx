import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { CheckCircle, AlertCircle, Info, X } from "lucide-preact";
import "../../styles/toast.css";

export const Toast = ({ message, type = "info", onClose, duration = 4000 }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 400); // Match animation duration
  };

  const icons = {
    success: <CheckCircle size={20} className="toast-icon success" />,
    error: <AlertCircle size={20} className="toast-icon error" />,
    info: <Info size={20} className="toast-icon info" />,
  };

  return (
    <div className={`toast-item ${type} ${isExiting ? "exit" : ""}`}>
      {icons[type]}
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={handleClose}>
        <X size={16} />
      </button>
    </div>
  );
};
