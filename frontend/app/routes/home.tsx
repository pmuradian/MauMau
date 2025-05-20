import { PrimaryButton, SecondaryButton } from "../UserInterface/UserInterfaceComponents";
import { createPhotobook, viewPhotobook } from "networking/NetworkService";

export default function Home() {
  return <HomeContent />;
}

function HomeContent() {
  return (<div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
    <PrimaryButton onClick={() => { 
      createPhotobook("My Photobook", "A4", 10)
        .then((response) => {
          console.log("Photobook created:", response);
        })
        .catch((error) => {
          console.error("Error creating photobook:", error);
        });
    }}>
      Create a new photobook
    </PrimaryButton>
    <SecondaryButton onClick={() => {
      viewPhotobook("12345")
        .then((response) => {
          console.log("Photobook details:", response);
        })
        .catch((error) => {
          console.error("Error viewing photobook:", error);
        })
     }}>
      View existing photobooks
    </SecondaryButton>
  </div>
  )
}