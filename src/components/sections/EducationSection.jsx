import { h } from "preact";
import { Plus } from "lucide-preact";
import { EditableText } from "../shared/EditableText";
import { Controls, SectionControls } from "../shared/Controls";

export const EducationSection = ({
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
          value={data.headings.education}
          onChange={(val) => handleHeadingChange("education", val)}
        />
      </div>
      <div className="section-content">
        {data.education.map((edu, eIdx) => (
          <div
            key={edu.id}
            className={`education-item relative-box ${dragSource?.type === "education" && dragSource?.index === eIdx ? "dragging" : ""}`}
            draggable={isEditMode}
            onDragStart={() => handleDragStart(eIdx, "education")}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(eIdx, "education")}
            onDragEnd={() => setDragSource(null)}
          >
            <Controls
              isEditMode={isEditMode}
              onDelete={() => deleteItem("education", eIdx)}
            />
            <div className="experience-header">
              <EditableText
                isEditMode={isEditMode}
                tag="h4"
                className="job-title"
                value={edu.degree}
                onChange={(val) =>
                  handleArrayChange("education", eIdx, "degree", val)
                }
              />
              <EditableText
                isEditMode={isEditMode}
                tag="span"
                className="date"
                value={edu.date}
                onChange={(val) =>
                  handleArrayChange("education", eIdx, "date", val)
                }
              />
            </div>
            <div className="company-location">
              <EditableText
                isEditMode={isEditMode}
                value={edu.institution}
                onChange={(val) =>
                  handleArrayChange("education", eIdx, "institution", val)
                }
              />
              &nbsp;&bull;&nbsp;
              <EditableText
                isEditMode={isEditMode}
                value={edu.location}
                onChange={(val) =>
                  handleArrayChange("education", eIdx, "location", val)
                }
              />
            </div>
          </div>
        ))}
        {isEditMode && (
          <button
            className="add-btn hide-print"
            onClick={() => addItem("education")}
          >
            <Plus size={16} /> Add Education
          </button>
        )}
      </div>
    </section>
  );
};
