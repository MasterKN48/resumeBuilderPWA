import { h } from "preact";
import { Plus, Trash2 } from "lucide-preact";
import { EditableText } from "../shared/EditableText";
import { Controls, SectionControls } from "../shared/Controls";

export const ExperienceSection = ({
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
  handleBulletChange,
  removeBullet,
  addBullet,
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
          value={data.headings.experience}
          onChange={(val) => handleHeadingChange("experience", val)}
        />
      </div>
      <div className="section-content">
        {data.experience.map((exp, eIdx) => (
          <div
            key={exp.id}
            className={`experience-item relative-box ${dragSource?.type === "experience" && dragSource?.index === eIdx ? "dragging" : ""}`}
            draggable={isEditMode}
            onDragStart={() => handleDragStart(eIdx, "experience")}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(eIdx, "experience")}
            onDragEnd={() => setDragSource(null)}
          >
            <Controls
              isEditMode={isEditMode}
              onDelete={() => deleteItem("experience", eIdx)}
            />
            <div className="experience-header">
              <EditableText
                isEditMode={isEditMode}
                tag="h4"
                className="job-title"
                value={exp.title}
                onChange={(val) =>
                  handleArrayChange("experience", eIdx, "title", val)
                }
              />
              <EditableText
                isEditMode={isEditMode}
                tag="span"
                className="date"
                value={exp.date}
                onChange={(val) =>
                  handleArrayChange("experience", eIdx, "date", val)
                }
              />
            </div>
            <div className="company-location">
              <EditableText
                isEditMode={isEditMode}
                value={exp.company}
                onChange={(val) =>
                  handleArrayChange("experience", eIdx, "company", val)
                }
              />
              &nbsp;&bull;&nbsp;
              <EditableText
                isEditMode={isEditMode}
                value={exp.location}
                onChange={(val) =>
                  handleArrayChange("experience", eIdx, "location", val)
                }
              />
            </div>
            <ul className="bullet-list">
              {exp.bullets.map((bullet, bIdx) => (
                <li key={bIdx} className="bullet-item">
                  <EditableText
                    isEditMode={isEditMode}
                    value={bullet}
                    onChange={(val) =>
                      handleBulletChange("experience", eIdx, bIdx, val)
                    }
                    multiline
                  />
                  {isEditMode && (
                    <button
                      className="del-bullet-btn hide-print"
                      onClick={() => removeBullet("experience", eIdx, bIdx)}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {isEditMode && (
              <button
                className="add-btn sub-btn hide-print"
                onClick={() => addBullet("experience", eIdx)}
              >
                <Plus size={14} /> Add Bullet
              </button>
            )}
          </div>
        ))}
        {isEditMode && (
          <button
            className="add-btn hide-print"
            onClick={() => addItem("experience")}
          >
            <Plus size={16} /> Add Experience
          </button>
        )}
      </div>
    </section>
  );
};
