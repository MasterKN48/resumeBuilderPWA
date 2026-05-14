import { h } from "preact";
import { Plus, Trash2 } from "lucide-preact";
import { EditableText } from "../shared/EditableText";
import { SectionControls } from "../shared/Controls";

export const SkillsSection = ({
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
          value={data.headings.skills}
          onChange={(val) => handleHeadingChange("skills", val)}
        />
      </div>
      <div className="section-content">
        <div className="skills-list">
          {data.skills.map((skill, sIdx) => (
            <div
              key={skill.id}
              className={`skill-pill relative-box ${dragSource?.type === "skills" && dragSource?.index === sIdx ? "dragging" : ""}`}
              draggable={isEditMode}
              onDragStart={() => handleDragStart(sIdx, "skills")}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(sIdx, "skills")}
              onDragEnd={() => setDragSource(null)}
            >
              <EditableText
                isEditMode={isEditMode}
                value={skill.name}
                onChange={(val) =>
                  handleArrayChange("skills", sIdx, "name", val)
                }
              />
              {isEditMode && (
                <button
                  className="del-skill-btn hide-print"
                  onClick={() => deleteItem("skills", sIdx)}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditMode && (
          <button
            className="add-btn sub-btn hide-print"
            onClick={() => addItem("skills")}
            style={{ marginTop: "10px" }}
          >
            <Plus size={14} /> Add Skill Item
          </button>
        )}
      </div>
    </section>
  );
};
