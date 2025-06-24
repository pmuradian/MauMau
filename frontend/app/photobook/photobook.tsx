import { useNavigate, useSearchParams } from "react-router-dom";
import { PrimaryButton } from "../UserInterface/UserInterfaceComponents";
import { useEffect, useState } from "react";
import { viewPhotobook } from "networking/NetworkService";
import { HorizontalTripplet } from "UserInterface/Layouts";
import { A4Portrait } from "UserInterface/Pages";
import { File } from "UserInterface/Dropzone";

class PhotobookData {
    constructor(
        public title: string = "",
        public description: string = "",
        public images: string[] = []
    ) { }
}

export default function Photobook() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState({} as PhotobookData);
    const photobookKey = searchParams.get("key") || "";

    useEffect(() => {
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
        <div style={{ padding: 20, display: 'flex', flexDirection: 'row', gap: 20 }}>
            <SideContent />

            <div className="min-h-screen h-screen bg-gray-100 p-4">
                <A4Portrait>
                    <HorizontalTripplet onImageDropped={(file: File) => {
                        console.log("Image dropped:");
                        // var reader = new FileReader();
                        // reader.readAsDataURL(file.data);
                        // reader.onload = () => {
                        //     uploadImage(photobookKey, reader.result as string)
                        //     console.log(reader.result); //base64encoded string
                        // };
                        // reader.onerror = error => {
                        //     console.log("Error: ", error);
                        // };
                    }} />
                </A4Portrait>

                <PrimaryButton onClick={() => {
                    console.log("Print button clicked");
                }}>
                    PRINT
                </PrimaryButton>
            </div>
        </div>
    );
}

function SideContent() {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ flex: '1', width: '40px', aspectRatio: 210 / 297, backgroundColor: 'red' }}></div>
        <div style={{ flex: '1', width: '40px', aspectRatio: 210 / 297, backgroundColor: 'red' }}></div>

        <PrimaryButton onClick={() => {
            console.log("Add page clicked");
        }}>
            Add Page
        </PrimaryButton>
    </div>
}