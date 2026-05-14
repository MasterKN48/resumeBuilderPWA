import { h } from "preact";
import { Download } from "lucide-preact";

export const InstallBanner = ({
  showInstallBanner,
  handleInstallClick,
  dismissInstall,
}) => {
  if (!showInstallBanner) return null;

  return (
    <div className="install-banner hide-print">
      <div className="install-content">
        <div className="install-header">
          <div className="install-icon">
            <Download size={28} />
          </div>
          <div className="install-text">
            <h4>Install PocketResume</h4>
            <p>Keep your resume in your pocket. Modify anytime, anywhere.</p>
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
  );
};
