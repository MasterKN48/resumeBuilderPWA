import { h } from "preact";
import { EditableText } from "../shared/EditableText";
import { SectionControls } from "../shared/Controls";

export const SummarySection = ({
  data,
  isEditMode,
  sectionProps,
  commonProps,
  handleHeadingChange,
  handleChange,
}) => {
  return (
    <section {...sectionProps}>
      <SectionControls {...commonProps} />
      <div className="section-header">
        <EditableText
          isEditMode={isEditMode}
          tag="h3"
          className="section-title"
          value={data.headings.summary}
          onChange={(val) => handleHeadingChange("summary", val)}
        />
      </div>
      <div className="section-content">
        <EditableText
          isEditMode={isEditMode}
          tag="p"
          value={data.summary}
          onChange={(val) => handleChange("summary", val)}
          multiline
        />
      </div>
    </section>
  );
};
