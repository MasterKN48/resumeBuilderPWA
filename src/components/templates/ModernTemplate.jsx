import { h } from "preact";
import { EditableText } from "../shared/EditableText";

export const ModernTemplate = ({
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
  renderSection,
}) => {
  return (
    <div className={`resume-slide ${template === "modern" ? "active" : "inactive"}`}>
      <div
        className={`resume-container template-modern ${isEditMode ? "editing" : ""}`}
        style={{ ...FONT_SIZES[fontSize], ...dynamicFontTheme }}
        ref={(el) => (resumeRefs.current[2] = el)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="modern-layout">
          <aside className="modern-sidebar">
            <div className="modern-sidebar-top">
              <EditableText
                isEditMode={isEditMode}
                tag="h1"
                className="modern-name"
                value={data.name}
                onChange={(val) => handleChange("name", val)}
              />
              <EditableText
                isEditMode={isEditMode}
                tag="h2"
                className="modern-profession"
                value={data.profession}
                onChange={(val) => handleChange("profession", val)}
              />
            </div>
            <div className="modern-contact-section">
              <h3 className="modern-sidebar-title">Contact</h3>
              <div className="modern-contact-list">
                {data.contactLayout.map((key) => {
                  const value = data[key];
                  if (!isEditMode && !value) return null;
                  const labels = {
                    email: "Email",
                    phone: "Phone",
                    location: "Location",
                    linkedin: "LinkedIn",
                    portfolio: "Portfolio",
                  };
                  return (
                    <div key={key} className="modern-contact-item">
                      <span className="modern-contact-label">
                        {labels[key]}
                      </span>
                      <EditableText
                        isEditMode={isEditMode}
                        className="modern-contact-value"
                        value={value}
                        onChange={(val) => handleChange(key, val)}
                        placeholder={labels[key]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            {data.layout
              .filter(
                (s) =>
                  s.type === "skills" || s.type === "certifications",
              )
              .map((sec) => (
                <div key={sec.id} className="modern-sidebar-section">
                  <h3 className="modern-sidebar-title">
                    {sec.type === "skills"
                      ? data.headings.skills
                      : data.headings.certifications}
                  </h3>
                  {renderSection(sec, data.layout.indexOf(sec))}
                </div>
              ))}
          </aside>
          <main className="modern-main-content">
            {data.layout
              .filter(
                (s) =>
                  s.type !== "skills" && s.type !== "certifications",
              )
              .map((sec) =>
                renderSection(sec, data.layout.indexOf(sec)),
              )}
          </main>
        </div>
      </div>
    </div>
  );
};
