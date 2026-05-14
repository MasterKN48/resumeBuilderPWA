import { h } from "preact";
import { GripVertical, Trash2, Plus } from "lucide-preact";
import { EditableText } from "../shared/EditableText";

export const ClassicTemplate = ({
  data,
  isEditMode,
  template,
  fontSize,
  FONT_SIZES,
  dynamicFontTheme,
  resumeRefs,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  handleChange,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setDragSource,
  dragSource,
  renderSection,
}) => {
  return (
    <div className={`resume-slide ${template === "classic" ? "active" : "inactive"}`}>
      <div
        className={`resume-container template-classic ${isEditMode ? "editing" : ""}`}
        style={{ ...FONT_SIZES[fontSize], ...dynamicFontTheme }}
        ref={(el) => (resumeRefs.current[1] = el)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <header className="header relative-box sec-box">
          <EditableText
            isEditMode={isEditMode}
            tag="h1"
            className="name"
            value={data.name}
            onChange={(val) => handleChange("name", val)}
          />
          {data.showProfession ? (
            <div
              className="profession-container"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                position: "relative",
              }}
            >
              <EditableText
                isEditMode={isEditMode}
                tag="h2"
                className="profession"
                value={data.profession}
                onChange={(val) => handleChange("profession", val)}
              />
              {isEditMode && (
                <button
                  className="clear-btn hide-print"
                  onClick={() => handleChange("showProfession", false)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ) : (
            isEditMode && (
              <button
                className="sec-btn hide-print"
                onClick={() => handleChange("showProfession", true)}
              >
                <Plus size={14} /> Add Profession
              </button>
            )
          )}
          <div
            className="contact-info"
            style={{ flexWrap: "wrap", gap: "6px 16px" }}
          >
            {data.contactLayout.map((key, cIdx) => {
              const value = data[key];
              if (!isEditMode && !value) return null;
              const labels = {
                email: "Email: ",
                phone: "Phone: ",
                location: "Location: ",
                linkedin: "LinkedIn: ",
                portfolio: "Portfolio: ",
              };
              return (
                <div
                  key={key}
                  className={`contact-item relative-box ${dragSource?.type === "contact" && dragSource?.index === cIdx ? "dragging" : ""}`}
                  draggable={isEditMode}
                  onDragStart={() => handleDragStart(cIdx, "contact")}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(cIdx, "contact")}
                  onDragEnd={() => setDragSource(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {isEditMode && (
                    <div
                      className="drag-handle-mini"
                      style={{
                        cursor: "grab",
                        display: "flex",
                        alignItems: "center",
                        opacity: 0.4,
                      }}
                    >
                      <GripVertical size={12} />
                    </div>
                  )}
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "0.9em",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {labels[key]}
                  </span>
                  <EditableText
                    isEditMode={isEditMode}
                    value={value}
                    onChange={(val) => handleChange(key, val)}
                    placeholder={
                      key.charAt(0).toUpperCase() + key.slice(1)
                    }
                  />
                  {isEditMode && (
                    <button
                      className="clear-btn hide-print"
                      onClick={() => handleChange(key, "")}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </header>
        {data.layout.map((sec, index) => renderSection(sec, index))}
        <div className="prompt-injection">{data.promptInjection}</div>
      </div>
    </div>
  );
};
