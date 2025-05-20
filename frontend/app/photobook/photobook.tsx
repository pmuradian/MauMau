import { useNavigate, useSearchParams } from "react-router-dom";
import { PrimaryButton } from "../UserInterface/UserInterfaceComponents";
import React, { useEffect } from "react";
import { createPhotobook, viewPhotobook } from "networking/NetworkService";

export default function Photobook() {
    
    const [searchParams, setSearchParams] = useSearchParams();

    const [data, setData] = React.useState([])
    useEffect(() => {
        console.log("Photobook key:", searchParams.get("key"));
    viewPhotobook(searchParams.get("key") || "")
        .then((response) => {
            console.log("Photobook details:", response);
            setData(response)
        })
  })

    return (<div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PrimaryButton onClick={ () => {}}>
            {data.title}
        </PrimaryButton>
    </div>
    )
}