import { SummarySection } from "./sections/SummarySection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { SectionControls } from "./shared/Controls";

export const SectionRenderer = ({
  sec,
  index,
  data,
  isEditMode,
  minimizedSections,
  dragSource,
  handleDragStart,
  handleDragOver,
  handleDrop,
  setDragSource,
  handleHeadingChange,
  handleChange,
  handleArrayChange,
  handleBulletChange,
  removeBullet,
  addBullet,
  addItem,
  deleteItem,
  deleteSection,
  insertPageBreak,
  toggleMinimize,
}) => {
  const commonProps = {
    index,
    onDelete: () => deleteSection(index),
    onAddBreak: () => insertPageBreak(index),
    isEditMode,
    isMinimized: minimizedSections.has(sec.id),
    onToggleMinimize: () => toggleMinimize(sec.id),
  };

  const sectionProps = {
    key: sec.id,
    className: `section relative-box sec-box section-${sec.type} ${minimizedSections.has(sec.id) ? 'section-minimized' : ''} ${dragSource?.type === "layout" && dragSource?.index === index ? "dragging" : ""}`,
    draggable: isEditMode,
    onDragStart: () => handleDragStart(index, "layout"),
    onDragOver: handleDragOver,
    onDrop: () => handleDrop(index, "layout"),
    onDragEnd: () => setDragSource(null),
  };

  const sectionArgs = {
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
    handleChange,
    handleArrayChange,
    handleBulletChange,
    removeBullet,
    addBullet,
    addItem,
    deleteItem,
  };

  switch (sec.type) {
    case "summary":
      return <SummarySection {...sectionArgs} />;
    case "experience":
      return <ExperienceSection {...sectionArgs} />;
    case "projects":
      return <ProjectsSection {...sectionArgs} />;
    case "education":
      return <EducationSection {...sectionArgs} />;
    case "skills":
      return <SkillsSection {...sectionArgs} />;
    case "certifications":
      return <CertificationsSection {...sectionArgs} />;
    case "pageBreak":
      return (
        <div
          {...sectionProps}
          className={`page-break relative-box sec-box ${dragSource?.type === "layout" && dragSource?.index === index ? "dragging" : ""}`}
        >
          <SectionControls {...commonProps} />
          <div className="page-break-indicator hide-print">
            ----- Page Break -----
          </div>
        </div>
      );
    default:
      return null;
  }
};
