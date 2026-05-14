import { h } from "preact";
import { Trash2, GripVertical, FilePlus, ChevronUp, ChevronDown } from "lucide-preact";

export const Controls = ({ onDelete, isEditMode }) => {
  if (!isEditMode) return null;
  return (
    <div className="item-controls hide-print">
      <div
        className="flex gap-1"
        style={{ display: "flex", gap: "2px", alignItems: "center" }}
      >
        <div className="sec-btn drag-handle" title="Drag to reorder">
          <GripVertical size={12} />
        </div>
        <button
          className="sec-btn danger-hover"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export const SectionControls = ({ onDelete, onAddBreak, isEditMode, isMinimized, onToggleMinimize }) => {
  if (!isEditMode) return null;
  return (
    <div className="section-controls hide-print">
      <div className="sec-btn drag-handle" title="Drag to reorder">
        <GripVertical size={14} />
      </div>
      
      <button 
        className="sec-btn" 
        onClick={onToggleMinimize}
        title={isMinimized ? "Expand Section" : "Minimize Section"}
      >
        {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      <button
        className="sec-btn danger-hover"
        onClick={onDelete}
        title="Delete Section"
      >
        <Trash2 size={14} />
      </button>

      <button className="sec-btn break-btn" onClick={onAddBreak} title="Page Break">
        <FilePlus size={14} style={{ marginRight: '4px' }} />
        <span>Page Break</span>
      </button>
    </div>
  );
};
