import { useNavigate, useSearchParams } from "react-router-dom";
import { PrimaryButton } from "../UserInterface/UserInterfaceComponents";
import React, { useEffect, useState } from "react";
import { createPhotobook, viewPhotobook } from "networking/NetworkService";
import { Dropzone } from "../UserInterface/Dropzone";

class PhotobookData {
    constructor(
        public title: string = "",
        public description: string = "",
        public images: string[] = []
    ) {}
}

export default function Photobook() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState({} as PhotobookData);
    const photobookKey = searchParams.get("key") || "";

    useEffect(() => {
        console.log("useEffect triggered for key:", photobookKey);

        if (photobookKey) {
            viewPhotobook(photobookKey)
                .then((response) => {
                    console.log("Photobook details:", response);
                    setData(new PhotobookData(
                        response.title || "Untitled Photobook",
                        response.description || "No description available",
                        response.images || []
                    ));
                })
                .catch((error) => {
                    console.error("Error fetching photobook:", error);
                });
        } else {
            console.log("No photobook key found.");
            setData({} as PhotobookData);
        }
    }, [photobookKey]);

    return (
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <PrimaryButton onClick={() => {}}>
                {data.title || "Loading Title..."}
            </PrimaryButton>
            <Dropzone>

            </Dropzone>
        </div>
    );
}