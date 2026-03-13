import { useNavigate } from "react-router-dom";
import { PrimaryButton, SecondaryButton } from "../uicomponents/Buttons";
import { generatePDF } from "networking/NetworkService";
import { useToast } from "../contexts/ToastContext";

export default function PhotobookControls({ title, photobookKey }: { title: string; photobookKey: string }) {
  const { showError } = useToast();
  const navigate = useNavigate();

  const handlePrint = async () => {
    try {
      const pdfBlob = await generatePDF(photobookKey);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title || "photobook"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showError("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="photobook-header">
      <div className="photobook-header-left">
        <span className="photobook-brand" onClick={() => navigate("/home")}>MauMau</span>
        {title && (
          <>
            <span className="photobook-header-separator" />
            <span className="photobook-header-title">{title}</span>
          </>
        )}
      </div>
      <div className="photobook-header-actions">
        <SecondaryButton onClick={handlePrint}>Preview</SecondaryButton>
        <PrimaryButton onClick={handlePrint}>Order print</PrimaryButton>
      </div>
    </div>
  );
}
