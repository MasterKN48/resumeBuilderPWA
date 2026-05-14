import { h } from "preact";
import { ChevronLeft, ChevronRight } from "lucide-preact";

export const TemplateNavButtons = ({ setTemplate }) => {
  return (
    <>
      <button
        className="template-nav-btn prev-btn hide-print"
        onClick={() =>
          setTemplate((prev) => (prev === "classic" ? "modern" : "classic"))
        }
        title="Previous Template"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        className="template-nav-btn next-btn hide-print"
        onClick={() =>
          setTemplate((prev) => (prev === "classic" ? "modern" : "classic"))
        }
        title="Next Template"
      >
        <ChevronRight size={32} />
      </button>
    </>
  );
};

export const IndicatorDots = ({ template, setTemplate }) => {
  return (
    <div className="template-indicator hide-print">
      <div
        className={`indicator-dot ${template === "classic" ? "active" : ""}`}
        onClick={() => setTemplate("classic")}
        style={{ cursor: "pointer" }}
      ></div>
      <div
        className={`indicator-dot ${template === "modern" ? "active" : ""}`}
        onClick={() => setTemplate("modern")}
        style={{ cursor: "pointer" }}
      ></div>
    </div>
  );
};
