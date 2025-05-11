import { Welcome } from "../welcome/welcome";
import { PrimaryButton, SecondaryButton } from "../UserInterface/UserInterfaceComponents";

export default function Home() {
  return <HomeContent />;
}

function HomeContent() {
  return (<div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
    <PrimaryButton onClick={() => { }}>
      Create a new photobook
    </PrimaryButton>
    <SecondaryButton onClick={() => { }}>
      View existing photobooks
    </SecondaryButton>
  </div>
  )
}