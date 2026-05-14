import { h } from "preact";
import { Plus } from "lucide-preact";
import { EditableText } from "../shared/EditableText";
import { Controls, SectionControls } from "../shared/Controls";

export const CertificationsSection = ({
  data,
  isEditMode,
  sectionProps,
  commonProps,
  dragSource,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setDragSource,
  handleHeadingChange,
  handleArrayChange,
  addItem,
  deleteItem,
}) => {
  return (
    <section {...sectionProps}>
      <SectionControls {...commonProps} />
      <div className="section-header">
        <EditableText
          isEditMode={isEditMode}
          tag="h3"
          className="section-title"
          value={data.headings.certifications}
          onChange={(val) => handleHeadingChange("certifications", val)}
        />
      </div>
      <div className="section-content">
        <ul className="bullet-list certifications-list">
          {data.certifications.map((cert, cIdx) => (
            <li
              key={cert.id}
              className={`relative-box cert-item ${dragSource?.type === "certifications" && dragSource?.index === cIdx ? "dragging" : ""}`}
              draggable={isEditMode}
              onDragStart={() => handleDragStart(cIdx, "certifications")}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(cIdx, "certifications")}
              onDragEnd={() => setDragSource(null)}
            >
              <Controls
                isEditMode={isEditMode}
                onDelete={() => deleteItem("certifications", cIdx)}
              />
              <EditableText
                isEditMode={isEditMode}
                value={cert.name}
                onChange={(val) =>
                  handleArrayChange("certifications", cIdx, "name", val)
                }
              />
              &nbsp;&bull;&nbsp;
              <EditableText
                isEditMode={isEditMode}
                value={cert.org}
                onChange={(val) =>
                  handleArrayChange("certifications", cIdx, "org", val)
                }
              />
              &nbsp;&bull;&nbsp;
              <EditableText
                isEditMode={isEditMode}
                value={cert.year}
                onChange={(val) =>
                  handleArrayChange("certifications", cIdx, "year", val)
                }
              />
            </li>
          ))}
        </ul>
        {isEditMode && (
          <button
            className="add-btn hide-print"
            onClick={() => addItem("certifications")}
          >
            <Plus size={16} /> Add Certification
          </button>
        )}
      </div>
    </section>
  );
};
