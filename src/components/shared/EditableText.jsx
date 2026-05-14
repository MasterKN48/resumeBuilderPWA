import { h } from "preact";
import { parseMarkdown } from "../../utils/helpers";

export const EditableText = ({
  tag: Tag = "span",
  className,
  value,
  onChange,
  multiline = false,
  placeholder = "",
  isEditMode,
}) => {
  if (isEditMode) {
    if (multiline) {
      const wordCount = value
        ? value
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length
        : 0;
      return (
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <textarea
            className={`edit-input ${className}`}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
          />
          <div
            className="word-counter hide-print"
            style={{
              position: "absolute",
              bottom: "10px",
              right: "12px",
              fontSize: "10px",
              fontWeight: "700",
              color: "var(--accent-color)",
              opacity: 0.8,
              background: "var(--pill-bg)",
              padding: "2px 6px",
              borderRadius: "4px",
              pointerEvents: "none",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {wordCount} {wordCount === 1 ? "Word" : "Words"}
          </div>
        </div>
      );
    }
    return (
      <input
        type="text"
        className={`edit-input ${className}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return <Tag className={className}>{parseMarkdown(value, h)}</Tag>;
};
