import { useState, useEffect } from "preact/hooks";
import { v4 as uuidv4 } from "uuid";
import { defaultData } from "../constants/resumeData";
import { updateDocumentTitle } from "../utils/helpers";

export const useResumeData = () => {
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
        if (parsed.promptInjection === undefined)
          parsed.promptInjection = defaultData.promptInjection;
        if (!parsed.contactLayout)
          parsed.contactLayout = defaultData.contactLayout;
        if (parsed.fontScale === undefined)
          parsed.fontScale = defaultData.fontScale;
        return parsed;
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem("resumeData", JSON.stringify(data));
    updateDocumentTitle(data);
  }, [data]);

  const handleChange = (path, value) => {
    setData((prev) => {
      const keys = path.split(".");
      const update = (obj, pathKeys) => {
        const [currentKey, ...remainingKeys] = pathKeys;
        
        // Final key in the path
        if (remainingKeys.length === 0) {
          if (Array.isArray(obj)) {
            const newArr = [...obj];
            newArr[currentKey] = value;
            return newArr;
          }
          return { ...obj, [currentKey]: value };
        }

        // Mid-path: handle nested objects or arrays
        if (Array.isArray(obj)) {
          const newArr = [...obj];
          newArr[currentKey] = update(obj[currentKey] || {}, remainingKeys);
          return newArr;
        } else {
          return {
            ...obj,
            [currentKey]: update(obj[currentKey] || {}, remainingKeys),
          };
        }
      };
      return update(prev, keys);
    });
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

  return {
    data, setData,
    handleChange,
    handleHeadingChange,
    handleArrayChange,
    handleBulletChange,
    addBullet,
    removeBullet,
    deleteItem,
    addItem
  };
};
