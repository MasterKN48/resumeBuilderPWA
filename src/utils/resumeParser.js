import { v4 as uuidv4 } from "uuid";

/**
 * Advanced Resume Semantic Parser
 * Extracts structured data from raw OCR/PDF text using heuristics and patterns.
 */
export const parseResumeText = (text) => {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const fullText = lines.join("\n");

  const result = {
    name: "",
    profession: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };

  // --- 1. CONTACT INFO ---
  result.email = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || "";
  result.phone = fullText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || "";
  
  // Clean up phone if it's too long or weird
  if (result.phone.length > 20) result.phone = result.phone.slice(0, 15);

  const linkedinMatch = fullText.match(/(?:linkedin\.com\/in\/|linkedin\.com\/profile\/)([a-zA-Z0-9-._]+)/i);
  result.linkedin = linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : "";

  const urlPattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?\/?(?:[^\s]*))/gi;
  let matches;
  while ((matches = urlPattern.exec(fullText)) !== null) {
    const url = matches[0].toLowerCase();
    if (!url.includes("linkedin.com") && !url.includes("mailto:") && url.length > 8) {
      result.portfolio = url;
      break;
    }
  }

  // Name heuristic: Usually the first line or near the top
  if (lines.length > 0) {
    result.name = lines[0].replace(/[|•,]/g, "").trim().toUpperCase();
    if (lines[1] && lines[1].length < 60 && !lines[1].includes("@") && !lines[1].match(/\d/)) {
      result.profession = lines[1];
    }
  }

  // --- 2. SECTION SEGMENTATION ---
  const sections = {
    summary: ["SUMMARY", "PROFESSIONAL SUMMARY", "OBJECTIVE", "PROFILE", "ABOUT ME"],
    experience: ["EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT HISTORY", "WORK HISTORY"],
    education: ["EDUCATION", "ACADEMIC BACKGROUND", "QUALIFICATIONS", "SCHOLASTIC"],
    skills: ["SKILLS", "TECHNICAL SKILLS", "CORE COMPETENCIES", "EXPERTISE", "TECHNOLOGIES"],
    projects: ["PROJECTS", "PERSONAL PROJECTS", "ACADEMIC PROJECTS", "SELECTED PROJECTS"],
    certifications: ["CERTIFICATIONS", "AWARDS", "LICENSES", "CERTIFICATES"],
  };

  const foundHeaders = [];
  Object.entries(sections).forEach(([type, keywords]) => {
    keywords.forEach((keyword) => {
      const regex = new RegExp(`^\\s*${keyword}\\s*$`, "im");
      const match = fullText.match(regex);
      if (match) {
        foundHeaders.push({ type, index: match.index, text: match[0] });
      }
    });
  });

  // Unique and sorted
  const sortedHeaders = foundHeaders
    .sort((a, b) => a.index - b.index)
    .filter((v, i, a) => a.findIndex((t) => t.type === v.type) === i);

  // Parse each section
  for (let i = 0; i < sortedHeaders.length; i++) {
    const header = sortedHeaders[i];
    const nextHeader = sortedHeaders[i + 1];
    const sectionStart = header.index + header.text.length;
    const sectionEnd = nextHeader ? nextHeader.index : fullText.length;
    const content = fullText.slice(sectionStart, sectionEnd).trim();

    if (!content) continue;

    switch (header.type) {
      case "summary":
        result.summary = content.replace(/\n+/g, " ");
        break;
      case "skills":
        result.skills = content
          .split(/[,\n|•*]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && s.length < 40)
          .map((name) => ({ id: uuidv4(), name }));
        break;
      case "experience":
        result.experience = parseListItems(content, "experience");
        break;
      case "education":
        result.education = parseListItems(content, "education");
        break;
      case "projects":
        result.projects = parseListItems(content, "projects");
        break;
      case "certifications":
        result.certifications = parseListItems(content, "certifications");
        break;
    }
  }

  // Location heuristic: Look for City, ST or City, Country
  const locationMatch = fullText.match(/[A-Z][a-z]+, [A-Z]{2}/);
  if (locationMatch) result.location = locationMatch[0];

  return result;
};

const parseListItems = (content, type) => {
  const items = [];
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  
  // Date pattern: "Jan 2020", "2019", "Present"
  const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d{2}|19\d{2}|Present)/gi;
  
  let currentItem = null;

  lines.forEach((line) => {
    const hasDate = line.match(dateRegex);
    
    // Heuristic for new item start: line contains a date and is relatively short
    if (hasDate && line.length < 120) {
      if (currentItem) items.push(currentItem);
      
      const dateStr = hasDate.join(" - ");
      const titleStr = line.replace(new RegExp(hasDate.join("|"), "gi"), "").replace(/[-–|]/g, "").trim();

      if (type === "experience") {
        currentItem = {
          id: uuidv4(),
          title: titleStr || "Role",
          company: "Company Name",
          date: dateStr,
          location: "Location",
          bullets: [],
        };
      } else if (type === "education") {
        currentItem = {
          id: uuidv4(),
          degree: titleStr || "Degree",
          institution: "University",
          date: dateStr,
          location: "Location",
        };
      } else if (type === "projects") {
          currentItem = {
              id: uuidv4(),
              name: titleStr || "Project Name",
              link: "",
              description: ""
          };
      } else if (type === "certifications") {
          currentItem = {
              id: uuidv4(),
              name: titleStr || "Certification",
              org: "Organization",
              year: dateStr
          };
      }
    } else if (currentItem) {
      // Content processing for existing item
      if (type === "experience") {
        if (line.match(/^[•\-*]/)) {
          currentItem.bullets.push(line.replace(/^[•\-*]\s*/, "").trim());
        } else if (currentItem.bullets.length === 0 && line.length < 60 && currentItem.company === "Company Name") {
          currentItem.company = line;
        } else if (currentItem.bullets.length === 0 && line.length < 60) {
          currentItem.location = line;
        } else {
           if (currentItem.bullets.length > 0) {
               currentItem.bullets[currentItem.bullets.length - 1] += " " + line;
           } else {
               currentItem.bullets.push(line);
           }
        }
      } else if (type === "education") {
          if (currentItem.institution === "University") {
              currentItem.institution = line;
          } else {
              currentItem.location = line;
          }
      } else if (type === "projects") {
          currentItem.description += (currentItem.description ? " " : "") + line;
      } else if (type === "certifications") {
          currentItem.org = line;
      }
    }
  });

  if (currentItem) items.push(currentItem);
  return items;
};
