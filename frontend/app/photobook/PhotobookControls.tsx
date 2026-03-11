import { PrimaryButton } from "../uicomponents/Buttons";
import { generatePDF } from "networking/NetworkService";
import { useToast } from "../contexts/ToastContext";

export default function PhotobookControls({ title, photobookKey }: { title: string; photobookKey: string }) {
  const { showError } = useToast();

  return (
    <div className="photobook-controls">
      <PrimaryButton
        onClick={async () => {
          try {
            const pdfBlob = await generatePDF(photobookKey);

            // Create download link
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
        }}
      >
        PRINT
      </PrimaryButton>
    </div>
  );
}
