import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

type Props = {
    fps: number;
    qrbox: number;
    aspectRatio?: number;
    disableFlip: boolean;
    qrCodeSuccessCallback: (decodedText: string, decodedResult: object) => void;
    verbose?: boolean
}

export default function QRScanner({fps, qrbox, aspectRatio, disableFlip, qrCodeSuccessCallback, verbose}: Props) {
    const scannerRef: React.RefObject<null | Html5QrcodeScanner> = useRef(null);

    const qrcodeRegionId = "html5qr-code-full-region";

    useEffect(() => {
        const config = {fps, qrbox, aspectRatio, disableFlip, qrCodeSuccessCallback};
        // Suceess callback is required.
        if (!(qrCodeSuccessCallback)) {
            throw "qrCodeSuccessCallback is required callback.";
        }

        // checks if scanner is already created and exits
        if(!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
        }
        scannerRef.current.render(qrCodeSuccessCallback, (error) => {
            if(error?.includes("No MultiFormat Readers were able to detect the code")) return;
            console.log("render: ", error)
        });
        
        return () => {
            if(scannerRef.current){
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, []);

    return (
        <div id={qrcodeRegionId} />
    );
}