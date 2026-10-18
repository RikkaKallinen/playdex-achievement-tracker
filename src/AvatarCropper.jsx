import { useState } from "react";
import Cropper from "react-easy-crop";

function AvatarCropper({ imageSrc, onCancel, onDone }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [cropArea, setCropArea] = useState(null);

    return (
        <div className="cropper-panel">
            <p>Drag to move the picture. Use the slider to zoom.</p>
            <div className="cropper-area">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(croppedArea, croppedAreaPixels) => setCropArea(croppedAreaPixels)}
                />
            </div>
            <label htmlFor="avatar-zoom">Zoom</label>
            <input
                type="range"
                id="avatar-zoom"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
            />
            <div className="button-row">
                <button type="button" onClick={() => onDone(cropArea)} disabled={!cropArea}>
                    Use this crop
                </button>
                <button type="button" className="button-quiet" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default AvatarCropper;
