import { useState } from "preact/hooks";
import { v4 as uuidv4 } from "uuid";

export const useLayoutManager = (data, setData) => {
  const [minimizedSections, setMinimizedSections] = useState(new Set());
  const [dragSource, setDragSource] = useState(null);

  const toggleMinimize = (id) => {
    setMinimizedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const moveSection = (oldIndex, newIndex) => {
    const newLayout = [...data.layout];
    const [item] = newLayout.splice(oldIndex, 1);
    newLayout.splice(newIndex, 0, item);
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

  return {
    minimizedSections,
    toggleMinimize,
    deleteSection,
    insertPageBreak,
    dragSource,
    setDragSource,
    handleDragStart,
    handleDragOver,
    handleDrop,
    moveSection,
  };
};
