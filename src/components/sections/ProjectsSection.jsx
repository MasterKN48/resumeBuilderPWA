import { h } from "preact";
import { Plus } from "lucide-preact";
import { EditableText } from "../shared/EditableText";
import { Controls, SectionControls } from "../shared/Controls";

export const ProjectsSection = ({
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
          value={data.headings.projects}
          onChange={(val) => handleHeadingChange("projects", val)}
        />
      </div>
      <div className="section-content">
        {data.projects.map((proj, pIdx) => (
          <div
            key={proj.id}
            className={`experience-item relative-box ${dragSource?.type === "projects" && dragSource?.index === pIdx ? "dragging" : ""}`}
            draggable={isEditMode}
            onDragStart={() => handleDragStart(pIdx, "projects")}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(pIdx, "projects")}
            onDragEnd={() => setDragSource(null)}
          >
            <Controls
              isEditMode={isEditMode}
              onDelete={() => deleteItem("projects", pIdx)}
            />
            <div className="experience-header">
              <EditableText
                isEditMode={isEditMode}
                tag="h4"
                className="job-title"
                value={proj.name}
                onChange={(val) =>
                  handleArrayChange("projects", pIdx, "name", val)
                }
              />
            </div>

            {(isEditMode || proj.link) && (
              <div
                className="company-location"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                {isEditMode ? (
                  <EditableText
                    isEditMode={isEditMode}
                    value={proj.link}
                    onChange={(val) =>
                      handleArrayChange("projects", pIdx, "link", val)
                    }
                    placeholder="Project URL (leave empty to hide)"
                  />
                ) : (
                  <a
                    href={
                      proj.link.startsWith("http")
                        ? proj.link
                        : `https://${proj.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "inherit",
                      textDecoration: "underline",
                    }}
                  >
                    {proj.link}
                  </a>
                )}
              </div>
            )}

            <EditableText
              isEditMode={isEditMode}
              tag="p"
              value={proj.description}
              onChange={(val) =>
                handleArrayChange("projects", pIdx, "description", val)
              }
              multiline
            />
          </div>
        ))}
        {isEditMode && (
          <button
            className="add-btn hide-print"
            onClick={() => addItem("projects")}
          >
            <Plus size={16} /> Add Project
          </button>
        )}
      </div>
    </section>
  );
};
