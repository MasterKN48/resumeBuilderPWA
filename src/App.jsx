import { useState, useEffect } from "preact/hooks";
import { v4 as uuidv4 } from "uuid";
import {
  Printer,
  Edit3,
  Trash2,
  Plus,
  Check,
  FilePlus,
  GripVertical,
  RefreshCw,
  HelpCircle,
  Palette,
  Download,
  Layout,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-preact";

const defaultData = {
  name: "YOUR NAME",
  profession: "YOUR PROFESSION",
  email: "youremail@example.com",
  phone: "(123) 456-7890",
  location: "Your City",
  linkedin: "linkedin.com/in/username",
  portfolio: "yourportfolio.com",
  summary:
    "Results-driven professional with a proven track record of delivering impactful solutions and driving growth. Skilled in **problem-solving**, **strategic thinking**, and leading cross-functional teams.",
  showProfession: true,

  headings: {
    summary: "SUMMARY",
    experience: "EXPERIENCE",
    projects: "PROJECTS",
    education: "EDUCATION",
    skills: "SKILLS",
    certifications: "CERTIFICATIONS",
  },

  layout: [
    { id: uuidv4(), type: "summary" },
    { id: uuidv4(), type: "experience" },
    { id: uuidv4(), type: "projects" },
    { id: uuidv4(), type: "education" },
    { id: uuidv4(), type: "skills" },
    { id: uuidv4(), type: "certifications" },
  ],

  experience: [
    {
      id: uuidv4(),
      title: "YOUR JOB TITLE",
      date: "2022 - Present",
      company: "Company Name",
      location: "Your City",
      bullets: [
        "Led initiatives that improved **efficiency** and increased revenue.",
        "Collaborated with cross-functional teams to deliver high-quality results.",
        "Analyzed data and implemented strategies to optimize performance.",
      ],
    },
    {
      id: uuidv4(),
      title: "YOUR JOB TITLE",
      date: "2019 - 2022",
      company: "Company Name",
      location: "Your City",
      bullets: [
        "Managed projects from concept to completion.",
        "Developed solutions that improved customer satisfaction.",
        "Trained and mentored team members to achieve goals.",
      ],
    },
  ],
  projects: [
    {
      id: uuidv4(),
      name: "Project Name",
      link: "example.com",
      description:
        "Brief description of the project, technologies used, and outcomes.",
    },
  ],
  education: [
    {
      id: uuidv4(),
      degree: "YOUR DEGREE",
      date: "2015 - 2019",
      institution: "University Name",
      location: "Your City",
    },
  ],
  skills: [
    { id: uuidv4(), name: "Project Management" },
    { id: uuidv4(), name: "Data Analysis" },
    { id: uuidv4(), name: "Leadership" },
    { id: uuidv4(), name: "Communication" },
    { id: uuidv4(), name: "Problem Solving" },
    { id: uuidv4(), name: "Strategy" },
    { id: uuidv4(), name: "Team Collaboration" },
    { id: uuidv4(), name: "Microsoft Office" },
  ],
  certifications: [
    {
      id: uuidv4(),
      name: "Certification Name",
      org: "Issuing Organization",
      year: "2021",
    },
  ],
  contactLayout: ["email", "phone", "location", "linkedin", "portfolio"],
};

const FONT_SIZES = {
  small: {
    "--fs-name": "36px",
    "--fs-prof": "13px",
    "--fs-section": "15px",
    "--fs-job": "13px",
    "--fs-body": "12px",
    "--fs-small": "11px",
    "--fs-icon-md": "14px",
    "--fs-icon-lg": "18px",
  },
  medium: {
    "--fs-name": "42px",
    "--fs-prof": "15px",
    "--fs-section": "17px",
    "--fs-job": "15px",
    "--fs-body": "14px",
    "--fs-small": "13px",
    "--fs-icon-md": "16px",
    "--fs-icon-lg": "20px",
  },
  large: {
    "--fs-name": "48px",
    "--fs-prof": "17px",
    "--fs-section": "19px",
    "--fs-job": "17px",
    "--fs-body": "16px",
    "--fs-small": "15px",
    "--fs-icon-md": "18px",
    "--fs-icon-lg": "22px",
  },
};

const FONT_THEMES = {
  modern: {
    "--font-heading": "'Montserrat', sans-serif",
    "--font-body": "'Inter', sans-serif",
  },
  classic: {
    "--font-heading": "'Playfair Display', serif",
    "--font-body": "'Lora', serif",
  },
  minimal: {
    "--font-heading": "'Roboto', sans-serif",
    "--font-body": "'Roboto', sans-serif",
  },
};

export default function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dragSource, setDragSource] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    // If already in standalone mode or dismissed permanently, don't even setup listeners
    if (
      isStandalone ||
      localStorage.getItem("pwaInstalled") === "true" ||
      localStorage.getItem("pwaInstallDismissed") === "true"
    ) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      localStorage.setItem("pwaInstalled", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const timer = setTimeout(() => {
      const lastShown = localStorage.getItem("pwaInstallLastShown");
      const now = Date.now();
      const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

      if (
        !localStorage.getItem("pwaInstallDismissed") &&
        !localStorage.getItem("pwaInstalled") &&
        !isStandalone &&
        (!lastShown || now - parseInt(lastShown) > THREE_DAYS)
      ) {
        setShowInstallBanner(true);
        localStorage.setItem("pwaInstallLastShown", now.toString());
      }
    }, 30000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      // Fallback for when event hasn't fired or is unavailable
      alert(
        "To install PocketResume, please use your browser's 'Add to Home Screen' or 'Install' menu option.",
      );
    }
    setShowInstallBanner(false);
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwaInstallDismissed", "true");
  };

  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("resumeFontSize") || "medium";
  });

  const [fontTheme, setFontTheme] = useState(() => {
    return localStorage.getItem("resumeFontTheme") || "modern";
  });

  const [customFont, setCustomFont] = useState(() => {
    return localStorage.getItem("resumeCustomFont") || "";
  });

  const [theme, setTheme] = useState(() => {
    return "slate";
  });

  const [template, setTemplate] = useState(() => {
    return localStorage.getItem("resumeTemplate") || "classic";
  });

  useEffect(() => {
    localStorage.setItem("resumeTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Request Persistent Storage
  useEffect(() => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persistent) => {
        if (persistent) {
          console.log("Persistent storage granted. Data will not be evicted.");
        } else {
          console.log(
            "Persistent storage not granted. Data may be evicted under pressure.",
          );
        }
      });
    }
  }, []);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("resumeData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.headings) parsed.headings = defaultData.headings;
        if (!parsed.layout) parsed.layout = defaultData.layout;
        if (!parsed.projects) parsed.projects = defaultData.projects;
        if (parsed.linkedin === undefined)
          parsed.linkedin = defaultData.linkedin;
        if (parsed.portfolio === undefined)
          parsed.portfolio = defaultData.portfolio;
        if (!parsed.contactLayout)
          parsed.contactLayout = defaultData.contactLayout;
        return parsed;
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  // Dynamic Google Font Loader
  useEffect(() => {
    if (fontTheme === "custom" && customFont) {
      const linkId = "custom-google-font";
      let link = document.getElementById(linkId);

      let fontName = customFont.trim();
      let urlToLoad = fontName;

      // If it's just a font name like "Outfit", generate the URL
      if (!fontName.includes("http")) {
        urlToLoad = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
      }

      if (!link) {
        link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = urlToLoad;
    }
  }, [fontTheme, customFont]);

  // Extract family name for CSS if user provided a full URL
  const getCustomFontFamily = () => {
    if (!customFont) return "sans-serif";
    const match = customFont.match(/family=([^:&]+)/);
    if (match) return `'${match[1].replace(/\+/g, " ")}', sans-serif`;
    if (!customFont.includes("http")) return `'${customFont}', sans-serif`;
    return "sans-serif";
  };

  useEffect(() => {
    localStorage.setItem("resumeData", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("resumeFontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("resumeFontTheme", fontTheme);
  }, [fontTheme]);

  useEffect(() => {
    localStorage.setItem("resumeCustomFont", customFont);
  }, [customFont]);

  useEffect(() => {
    localStorage.setItem("resumeTemplate", template);
  }, [template]);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setTemplate((prev) => (prev === "classic" ? "modern" : "classic"));
    }
  };

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleHeadingChange = (key, value) => {
    setData((prev) => ({
      ...prev,
      headings: { ...prev.headings, [key]: value },
    }));
  };

  const handleArrayChange = (section, index, key, value) => {
    const newArray = [...data[section]];
    newArray[index][key] = value;
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const handleBulletChange = (section, itemIndex, bulletIndex, value) => {
    const newArray = [...data[section]];
    newArray[itemIndex].bullets[bulletIndex] = value;
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const addBullet = (section, itemIndex) => {
    const newArray = [...data[section]];
    newArray[itemIndex].bullets.push("New bullet point");
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const removeBullet = (section, itemIndex, bulletIndex) => {
    const newArray = [...data[section]];
    newArray[itemIndex].bullets.splice(bulletIndex, 1);
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const moveItem = (section, index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === data[section].length - 1) return;

    const newArray = [...data[section]];
    const temp = newArray[index];
    newArray[index] = newArray[index + (direction === "up" ? -1 : 1)];
    newArray[index + (direction === "up" ? -1 : 1)] = temp;
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const deleteItem = (section, index) => {
    const newArray = [...data[section]];
    newArray.splice(index, 1);
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const addItem = (section) => {
    const newArray = [...data[section]];
    if (section === "experience") {
      newArray.push({
        id: uuidv4(),
        title: "New Job Title",
        date: "Year - Year",
        company: "Company Name",
        location: "City",
        bullets: ["New responsibility"],
      });
    } else if (section === "projects") {
      newArray.push({
        id: uuidv4(),
        name: "New Project",
        link: "",
        description: "Project description.",
      });
    } else if (section === "education") {
      newArray.push({
        id: uuidv4(),
        degree: "New Degree",
        date: "Year - Year",
        institution: "University Name",
        location: "City",
      });
    } else if (section === "skills") {
      newArray.push({ id: uuidv4(), name: "New Skill" });
    } else if (section === "certifications") {
      newArray.push({
        id: uuidv4(),
        name: "New Cert",
        org: "Organization",
        year: "Year",
      });
    }
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const resetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all data to the default template?",
      )
    ) {
      setData(defaultData);
      setFontSize("medium");
      setFontTheme("modern");
      setCustomFont("");
    }
  };

  const moveSection = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === data.layout.length - 1) return;

    const newLayout = [...data.layout];
    const temp = newLayout[index];
    newLayout[index] = newLayout[index + (direction === "up" ? -1 : 1)];
    newLayout[index + (direction === "up" ? -1 : 1)] = temp;
    setData((prev) => ({ ...prev, layout: newLayout }));
  };

  const deleteSection = (index) => {
    const newLayout = [...data.layout];
    newLayout.splice(index, 1);
    setData((prev) => ({ ...prev, layout: newLayout }));
  };

  const insertPageBreak = (index) => {
    const newLayout = [...data.layout];
    newLayout.splice(index + 1, 0, { id: uuidv4(), type: "pageBreak" });
    setData((prev) => ({ ...prev, layout: newLayout }));
  };

  const handleDragStart = (index, type, parentIndex = null) => {
    setDragSource({ index, type, parentIndex });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index, type, parentIndex = null) => {
    if (
      !dragSource ||
      dragSource.type !== type ||
      dragSource.parentIndex !== parentIndex ||
      dragSource.index === index
    )
      return;

    setData((prev) => {
      const newData = { ...prev };
      let list;

      if (type === "layout") {
        list = [...newData.layout];
        const item = list.splice(dragSource.index, 1)[0];
        list.splice(index, 0, item);
        newData.layout = list;
      } else if (type === "contact") {
        list = [...newData.contactLayout];
        const item = list.splice(dragSource.index, 1)[0];
        list.splice(index, 0, item);
        newData.contactLayout = list;
      } else {
        // Experience, Projects, Education, Skills, Certifications
        list = [...newData[type]];
        const item = list.splice(dragSource.index, 1)[0];
        list.splice(index, 0, item);
        newData[type] = list;
      }

      return newData;
    });
    setDragSource(null);
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const userName = (data.name || "USER")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const year = new Date().getFullYear();
    document.title = `001-${userName}-${year}`;

    window.print();

    // Restore title after a brief delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  const parseMarkdown = (text) => {
    if (typeof text !== "string") return text;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong
            key={index}
            style={{ fontWeight: 700, color: "var(--text-main)" }}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const EditableText = ({
    tag: Tag = "span",
    className,
    value,
    onChange,
    multiline = false,
    placeholder = "",
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
    return <Tag className={className}>{parseMarkdown(value)}</Tag>;
  };

  const Controls = ({ onDelete }) => {
    if (!isEditMode) return null;
    return (
      <div className="item-controls hide-print">
        <div
          className="flex gap-1"
          style={{ display: "flex", gap: "4px", alignItems: "center" }}
        >
          <div className="sec-btn drag-handle" title="Drag to reorder">
            <GripVertical size={14} />
          </div>
          <button
            onClick={onDelete}
            title="Delete"
            style={{ color: "#ef4444" }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  const SectionControls = ({ onDelete, onAddBreak }) => {
    if (!isEditMode) return null;
    return (
      <div className="section-controls hide-print">
        <div
          className="flex gap-2"
          style={{ display: "flex", gap: "8px", alignItems: "center" }}
        >
          <div className="sec-btn drag-handle" title="Drag to reorder">
            <GripVertical size={14} />
          </div>
          <button
            className="sec-btn"
            onClick={onDelete}
            title="Delete Section"
            style={{ color: "#ef4444" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
        <button className="sec-btn break-btn" onClick={onAddBreak}>
          <FilePlus size={14} /> Add Page Break Below
        </button>
      </div>
    );
  };

  const renderSection = (sec, index) => {
    const commonProps = {
      index,
      onDelete: () => deleteSection(index),
      onAddBreak: () => insertPageBreak(index),
    };

    const sectionProps = {
      key: sec.id,
      className: `section relative-box sec-box ${dragSource?.type === "layout" && dragSource?.index === index ? "dragging" : ""}`,
      draggable: isEditMode,
      onDragStart: () => handleDragStart(index, "layout"),
      onDragOver: handleDragOver,
      onDrop: () => handleDrop(index, "layout"),
      onDragEnd: () => setDragSource(null),
    };

    switch (sec.type) {
      case "summary":
        return (
          <section {...sectionProps}>
            <SectionControls {...commonProps} />
            <div className="section-header">
              <EditableText
                tag="h3"
                className="section-title"
                value={data.headings.summary}
                onChange={(val) => handleHeadingChange("summary", val)}
              />
            </div>
            <div className="section-content">
              <EditableText
                tag="p"
                value={data.summary}
                onChange={(val) => handleChange("summary", val)}
                multiline
              />
            </div>
          </section>
        );

      case "experience":
        return (
          <section {...sectionProps}>
            <SectionControls {...commonProps} />
            <div className="section-header">
              <EditableText
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
                  <Controls onDelete={() => deleteItem("experience", eIdx)} />
                  <div className="experience-header">
                    <EditableText
                      tag="h4"
                      className="job-title"
                      value={exp.title}
                      onChange={(val) =>
                        handleArrayChange("experience", eIdx, "title", val)
                      }
                    />
                    <EditableText
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
                      value={exp.company}
                      onChange={(val) =>
                        handleArrayChange("experience", eIdx, "company", val)
                      }
                    />
                    &nbsp;&bull;&nbsp;
                    <EditableText
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
                          value={bullet}
                          onChange={(val) =>
                            handleBulletChange("experience", eIdx, bIdx, val)
                          }
                          multiline
                        />
                        {isEditMode && (
                          <button
                            className="del-bullet-btn hide-print"
                            onClick={() =>
                              removeBullet("experience", eIdx, bIdx)
                            }
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

      case "projects":
        return (
          <section {...sectionProps}>
            <SectionControls {...commonProps} />
            <div className="section-header">
              <EditableText
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
                  <Controls onDelete={() => deleteItem("projects", pIdx)} />
                  <div className="experience-header">
                    <EditableText
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

      case "education":
        return (
          <section {...sectionProps}>
            <SectionControls {...commonProps} />
            <div className="section-header">
              <EditableText
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
                  <Controls onDelete={() => deleteItem("education", eIdx)} />
                  <div className="experience-header">
                    <EditableText
                      tag="h4"
                      className="job-title"
                      value={edu.degree}
                      onChange={(val) =>
                        handleArrayChange("education", eIdx, "degree", val)
                      }
                    />
                    <EditableText
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
                      value={edu.institution}
                      onChange={(val) =>
                        handleArrayChange("education", eIdx, "institution", val)
                      }
                    />
                    &nbsp;&bull;&nbsp;
                    <EditableText
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

      case "skills":
        return (
          <section {...sectionProps}>
            <SectionControls {...commonProps} />
            <div className="section-header">
              <EditableText
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

      case "certifications":
        return (
          <section {...sectionProps}>
            <SectionControls {...commonProps} />
            <div className="section-header">
              <EditableText
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
                      onDelete={() => deleteItem("certifications", cIdx)}
                    />
                    <EditableText
                      value={cert.name}
                      onChange={(val) =>
                        handleArrayChange("certifications", cIdx, "name", val)
                      }
                    />
                    &nbsp;&bull;&nbsp;
                    <EditableText
                      value={cert.org}
                      onChange={(val) =>
                        handleArrayChange("certifications", cIdx, "org", val)
                      }
                    />
                    &nbsp;&bull;&nbsp;
                    <EditableText
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

  const dynamicFontTheme =
    fontTheme === "custom"
      ? {
          "--font-heading": getCustomFontFamily(),
          "--font-body": getCustomFontFamily(),
        }
      : FONT_THEMES[fontTheme];

  return (
    <>
      <div className="perspective-grid hide-print"></div>
      <div className="floating-bar hide-print">
        {isEditMode && (
          <button
            className="action-btn"
            popovertarget="styling-menu"
            title="Styling Settings"
          >
            <Palette size={20} />
          </button>
        )}

        <div id="styling-menu" popover="auto" className="dock-popover">
          <div className="dock-settings">
            <select
              className="action-select"
              value={fontTheme}
              onChange={(e) => setFontTheme(e.target.value)}
              title="Font Family"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="custom">Custom</option>
            </select>

            {fontTheme === "custom" && (
              <input
                type="text"
                className="custom-font-input"
                placeholder="Google Font Name"
                value={customFont}
                onChange={(e) => setCustomFont(e.target.value)}
              />
            )}

            <select
              className="action-select"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              title="Font Size"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        {isEditMode && <div className="dock-divider"></div>}

        <div className="top-bar-group">
          {isEditMode && (
            <button
              className="action-btn danger"
              onClick={resetData}
              title="Reset Data"
            >
              <RefreshCw size={20} />
            </button>
          )}
          <button
            className={`action-btn ${isEditMode ? "active" : ""}`}
            onClick={() => setIsEditMode(!isEditMode)}
            title={isEditMode ? "Finish Editing" : "Edit Resume"}
          >
            {isEditMode ? <Check size={20} /> : <Edit3 size={20} />}
          </button>

          {isEditMode && (
            <>
              <button
                className="action-btn"
                popovertarget="help-menu"
                title="Editing Tips"
              >
                <HelpCircle size={20} />
              </button>
              <div
                id="help-menu"
                popover="auto"
                className="dock-popover help-popover"
              >
                <div className="dock-settings help-content">
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      margin: "0 0 12px 0",
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "var(--text-main)",
                    }}
                  >
                    <Edit3 size={16} /> Editing Tips
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      padding: "0 0 0 18px",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                    }}
                  >
                    <li>
                      <strong>Delete:</strong> Click trash icon to clear fields.
                    </li>
                    <li>
                      <strong>Bold:</strong> Wrap text in double asterisks (e.g.{" "}
                      <code>**bold**</code>).
                    </li>
                    <li>
                      <strong>Reorder:</strong> Hover items to reveal drag
                      controls.
                    </li>
                    <li>
                      <strong>Fonts:</strong> Paste a Google Font name (e.g.{" "}
                      <code>Oswald</code>).
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}

          <button
            className="action-btn"
            title="AI Chat Bot (Coming Soon)"
            style={{ color: "var(--accent-color)" }}
          >
            <Sparkles size={20} />
          </button>

          <button
            className="action-btn"
            onClick={handlePrint}
            title="Print / Export PDF"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Wrapper for Side Arrows and Resume */}
      <div className="resume-wrapper">
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

        <div className="resume-slider-viewport">
          <div className={`resume-slider template-active-${template}`}>
            {/* Classic Slide */}
            <div
              className={`resume-slide ${template === "classic" ? "active" : "inactive"}`}
            >
              <div
                className={`resume-container template-classic ${isEditMode ? "editing" : ""}`}
                style={{ ...FONT_SIZES[fontSize], ...dynamicFontTheme }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <header className="header relative-box sec-box">
                  <EditableText
                    tag="h1"
                    className="name"
                    value={data.name}
                    onChange={(val) => handleChange("name", val)}
                  />
                  {data.showProfession ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        position: "relative",
                      }}
                    >
                      <EditableText
                        tag="h2"
                        className="profession"
                        value={data.profession}
                        onChange={(val) => handleChange("profession", val)}
                      />
                      {isEditMode && (
                        <button
                          className="clear-btn hide-print"
                          onClick={() => handleChange("showProfession", false)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    isEditMode && (
                      <button
                        className="sec-btn hide-print"
                        onClick={() => handleChange("showProfession", true)}
                      >
                        <Plus size={14} /> Add Profession
                      </button>
                    )
                  )}
                  <div
                    className="contact-info"
                    style={{ flexWrap: "wrap", gap: "10px 15px" }}
                  >
                    {data.contactLayout.map((key, cIdx) => {
                      const value = data[key];
                      if (!isEditMode && !value) return null;
                      const labels = {
                        email: "Email: ",
                        phone: "Phone: ",
                        location: "Location: ",
                        linkedin: "LinkedIn: ",
                        portfolio: "Portfolio: ",
                      };
                      return (
                        <div
                          key={key}
                          className={`contact-item relative-box ${dragSource?.type === "contact" && dragSource?.index === cIdx ? "dragging" : ""}`}
                          draggable={isEditMode}
                          onDragStart={() => handleDragStart(cIdx, "contact")}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(cIdx, "contact")}
                          onDragEnd={() => setDragSource(null)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {isEditMode && (
                            <div
                              className="drag-handle-mini"
                              style={{
                                cursor: "grab",
                                display: "flex",
                                alignItems: "center",
                                opacity: 0.4,
                              }}
                            >
                              <GripVertical size={12} />
                            </div>
                          )}
                          <span
                            style={{
                              fontWeight: "600",
                              fontSize: "0.9em",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {labels[key]}
                          </span>
                          <EditableText
                            value={value}
                            onChange={(val) => handleChange(key, val)}
                            placeholder={
                              key.charAt(0).toUpperCase() + key.slice(1)
                            }
                          />
                          {isEditMode && (
                            <button
                              className="clear-btn hide-print"
                              onClick={() => handleChange(key, "")}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </header>
                {data.layout.map((sec, index) => renderSection(sec, index))}
              </div>
            </div>

            {/* Modern Slide */}
            <div
              className={`resume-slide ${template === "modern" ? "active" : "inactive"}`}
            >
              <div
                className={`resume-container template-modern ${isEditMode ? "editing" : ""}`}
                style={{ ...FONT_SIZES[fontSize], ...dynamicFontTheme }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div className="modern-layout">
                  <aside className="modern-sidebar">
                    <div className="modern-sidebar-top">
                      <EditableText
                        tag="h1"
                        className="modern-name"
                        value={data.name}
                        onChange={(val) => handleChange("name", val)}
                      />
                      <EditableText
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
          </div>
        </div>
      </div>

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

      {showInstallBanner && (
        <div className="install-banner hide-print">
          <div className="install-content">
            <div className="install-header">
              <div className="install-icon">
                <Download size={28} />
              </div>
              <div className="install-text">
                <h4>Install PocketResume</h4>
                <p>
                  Keep your resume in your pocket. Modify anytime, anywhere.
                </p>
              </div>
            </div>
            <div className="install-actions">
              <button className="install-btn" onClick={handleInstallClick}>
                Install Now
              </button>
              <button className="dismiss-btn" onClick={dismissInstall}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
