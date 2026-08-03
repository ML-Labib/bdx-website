// cropUtils.js

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

/**
 * Extracts the cropped square region from the source image and returns a 300x300 PNG Blob.
 * 
 * @param {string} imageSrc - Object URL or Base64 string of the selected image
 * @param {Object} pixelCrop - Crop area containing { x, y, width, height }
 * @returns {Promise<Blob>} The cropped 300x300 PNG blob
 */
export async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Output dimension fixed to 300x300
    canvas.width = 300;
    canvas.height = 300;

    // Render crop area to canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        300,
        300
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas export to PNG failed."));
            },
            "image/png" // Outputs lossless PNG format
        );
    });
}