import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../UserInterface/UserInterfaceComponents";

export default function Photobook() {
    let navigate = useNavigate();
    const routeChange = () => {
        let path = `photobook`;
        navigate(path);
    }

    return (<div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PrimaryButton onClick={routeChange}>
            Clime me
        </PrimaryButton>
    </div>
    )
}