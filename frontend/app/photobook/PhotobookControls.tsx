import React from "react";
import { PrimaryButton } from "../UserInterface/Buttons";
import { generatePDF } from "networking/NetworkService";

export default function PhotobookControls({ title, photobookKey }: { title: string; photobookKey: string }) {
  return (
    <div className="photobook-controls">
      <PrimaryButton
        onClick={async () => {
          console.log("Print button clicked");
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

            console.log("PDF generated and download started");
          } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
          }
        }}
      >
        PRINT
      </PrimaryButton>
    </div>
  );
}
