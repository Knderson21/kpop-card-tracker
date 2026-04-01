import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

// 55mm × 85mm photocard aspect ratio
const ASPECT = 11 / 17;
// Output dimensions — 800px wide at 11:17
const OUTPUT_WIDTH = 800;
const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / ASPECT); // 1236

function initCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, ASPECT, width, height),
    width,
    height
  );
}

async function cropToBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context.");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty."))),
      "image/jpeg",
      0.85
    );
  });
}

interface ImageCropModalProps {
  /** Object URL of the selected image */
  imageSrc: string;
  originalFileName: string;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

export function ImageCropModal({
  imageSrc,
  originalFileName,
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [applying, setApplying] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(initCrop(width, height));
  }, []);

  const handleApply = async () => {
    if (!imgRef.current || !completedCrop) return;
    setApplying(true);
    try {
      const blob = await cropToBlob(imgRef.current, completedCrop);
      const baseName = originalFileName.replace(/\.[^.]+$/, "");
      const file = new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
      onConfirm(file);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop image to photocard ratio (55 × 85 mm)</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-2">
          Drag the handles to reposition. The crop is locked to the 11:17 aspect ratio.
        </p>

        <div className="flex justify-center rounded-md bg-muted/30 p-2">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={ASPECT}
            minWidth={50}
            style={{ maxWidth: "100%" }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              style={{ maxHeight: "55vh", maxWidth: "100%", width: "auto", display: "block" }}
            />
          </ReactCrop>
        </div>

        <p className="text-xs text-muted-foreground">
          Output: {OUTPUT_WIDTH} × {OUTPUT_HEIGHT} px · JPEG 85%
        </p>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={applying}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!completedCrop || applying}>
            {applying && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Apply crop
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
