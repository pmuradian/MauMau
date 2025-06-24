import { PrimaryButton, SecondaryButton } from "../UserInterface/UserInterfaceComponents";
import { createPhotobook, viewPhotobook } from "networking/NetworkService";
import { useNavigate } from "react-router-dom";

export default function Home() {
  return <HomeContent />;
}

function HomeContent() {
  let navigate = useNavigate();
  const routeChange = (path: string) => {
    console.log("Navigating to:", path);
    navigate(`photobook?key=${path}`);
  }

  return (<div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
    <PrimaryButton onClick={() => {
      createPhotobook("My Photobook", "A4", 10)
        .then((response) => {
          alert(`Photobook created successfully ${response.key}`);
          console.log("Photobook created:", response);
          routeChange(response.key);
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