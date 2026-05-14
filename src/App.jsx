import { useState, useEffect, useRef } from "preact/hooks";

import { FONT_SIZES } from "./constants/resumeData";
import { usePWA, useScale, useSwipe } from "./utils/hooks";

// New Hooks
import { useResumeData } from "./hooks/useResumeData";
import { useSettings } from "./hooks/useSettings";
import { useLayoutManager } from "./hooks/useLayoutManager";

// Shared Components
import { FloatingBar } from "./components/shared/FloatingBar";
import {
  TemplateNavButtons,
  IndicatorDots,
} from "./components/shared/TemplateNav";
import { InstallBanner } from "./components/shared/InstallBanner";
import { SectionRenderer } from "./components/SectionRenderer";

// Template Components
import { ClassicTemplate } from "./components/templates/ClassicTemplate";
import { ModernTemplate } from "./components/templates/ModernTemplate";

export default function App() {
  const resumeRefs = useRef({});
  const [isEditMode, setIsEditMode] = useState(false);

  // Core Data Management
  const {
    data,
    setData,
    handleChange,
    handleHeadingChange,
    handleArrayChange,
    handleBulletChange,
    addBullet,
    removeBullet,
    deleteItem,
    addItem,
  } = useResumeData();

  // Settings & Theme Management
  const {
    fontSize,
    setFontSize,
    fontTheme,
    setFontTheme,
    customFont,
    setCustomFont,
    theme,
    setTheme,
    template,
    setTemplate,
    dynamicFontTheme,
    scaledFontSizes,
  } = useSettings(data, handleChange);

  // Layout & Drag-and-Drop Management
  const {
    minimizedSections,
    toggleMinimize,
    deleteSection,
    insertPageBreak,
    dragSource,
    setDragSource,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useLayoutManager(data, setData);

  const { showInstallBanner, handleInstallClick, dismissInstall } = usePWA();
  const { scale, viewportHeight } = useScale(template, data, resumeRefs);
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe(setTemplate);

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

  // Keyboard Navigation for Templates
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      )
        return;

      if (e.key === "ArrowRight" && template === "classic") {
        setTemplate("modern");
      } else if (e.key === "ArrowLeft" && template === "modern") {
        setTemplate("classic");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [template, setTemplate]);

  const resetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all data to the default template?",
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handlePrint = () => {
    setIsEditMode(false);
    const isMobile = (document.documentElement.clientWidth || window.innerWidth) < 840;
    if (isMobile) {
      document.body.classList.add("mobile-print");
    }

    const cleanupPrint = () => {
      document.body.classList.remove("mobile-print");
      window.removeEventListener("afterprint", cleanupPrint);
    };

    window.addEventListener("afterprint", cleanupPrint);
    window.print();
    setTimeout(cleanupPrint, 10000);
  };

  const renderSection = (sec, index) => (
    <SectionRenderer
      key={sec.id}
      sec={sec}
      index={index}
      data={data}
      isEditMode={isEditMode}
      minimizedSections={minimizedSections}
      dragSource={dragSource}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
      setDragSource={setDragSource}
      handleHeadingChange={handleHeadingChange}
      handleChange={handleChange}
      handleArrayChange={handleArrayChange}
      handleBulletChange={handleBulletChange}
      removeBullet={removeBullet}
      addBullet={addBullet}
      addItem={addItem}
      deleteItem={deleteItem}
      deleteSection={deleteSection}
      insertPageBreak={insertPageBreak}
      toggleMinimize={toggleMinimize}
    />
  );

  return (
    <>
      <div className="perspective-grid hide-print"></div>
      <FloatingBar
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        resetData={resetData}
        handlePrint={handlePrint}
        fontTheme={fontTheme}
        setFontTheme={setFontTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        customFont={customFont}
        setCustomFont={setCustomFont}
        promptInjection={data.promptInjection}
        setPromptInjection={(val) => handleChange("promptInjection", val)}
        fontScale={data.fontScale}
        setFontScale={(val) => handleChange("fontScale", val)}
      />

      <div className="resume-wrapper">
        <TemplateNavButtons setTemplate={setTemplate} />

        <div
          className="resume-slider-viewport hide-scrollbar"
          style={{
            width: scale < 1 ? `${800 * scale}px` : "100%",
            height: viewportHeight,
            transition: "height 0.3s ease",
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className={`resume-slider template-active-${template}`}
            style={{
              position: scale < 1 ? "absolute" : "relative",
              top: 0,
              left: 0,
              transform: `scale(${scale}) translateX(${template === "modern" ? "-800px" : "0"})`,
              transformOrigin: "top left",
              width: "1600px",
              display: "flex",
            }}
          >
            <ClassicTemplate
              data={data}
              isEditMode={isEditMode}
              template={template}
              fontSize={fontSize}
              FONT_SIZES={FONT_SIZES}
              scaledFontSizes={scaledFontSizes}
              dynamicFontTheme={dynamicFontTheme}
              resumeRefs={resumeRefs}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              handleChange={handleChange}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              setDragSource={setDragSource}
              dragSource={dragSource}
              renderSection={renderSection}
            />

            <ModernTemplate
              data={data}
              isEditMode={isEditMode}
              template={template}
              fontSize={fontSize}
              FONT_SIZES={FONT_SIZES}
              scaledFontSizes={scaledFontSizes}
              dynamicFontTheme={dynamicFontTheme}
              resumeRefs={resumeRefs}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              handleChange={handleChange}
              renderSection={renderSection}
            />
          </div>
        </div>
      </div>

      <IndicatorDots template={template} setTemplate={setTemplate} />

      <InstallBanner
        showInstallBanner={showInstallBanner}
        handleInstallClick={handleInstallClick}
        dismissInstall={dismissInstall}
      />
    </>
  );
}
