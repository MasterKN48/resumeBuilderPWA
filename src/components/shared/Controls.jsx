import { h } from "preact";
import { Trash2, GripVertical, FilePlus } from "lucide-preact";

export const Controls = ({ onDelete, isEditMode }) => {
  if (!isEditMode) return null;
  return (
    <div className="item-controls hide-print">
      <div
        className="flex gap-1"
        style={{ display: "flex", gap: "4px", alignItems: "center" }}
      >
        <div className="sec-btn drag-handle" title="Drag to reorder">
          <GripVertical size={14} />
        </div>
        <button
          onClick={onDelete}
          title="Delete"
          style={{ color: "#ef4444" }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export const SectionControls = ({ onDelete, onAddBreak, isEditMode }) => {
  if (!isEditMode) return null;
  return (
    <div className="section-controls hide-print">
      <div
        className="flex gap-2"
        style={{ display: "flex", gap: "8px", alignItems: "center" }}
      >
        <div className="sec-btn drag-handle" title="Drag to reorder">
          <GripVertical size={14} />
        </div>
        <button
          className="sec-btn"
          onClick={onDelete}
          title="Delete Section"
          style={{ color: "#ef4444" }}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <button className="sec-btn break-btn" onClick={onAddBreak}>
        <FilePlus size={14} /> Add Page Break Below
      </button>
    </div>
  );
};
