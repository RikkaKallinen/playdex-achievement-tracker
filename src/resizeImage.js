function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}

export async function cropImage(src, area, size) {
    const image = await loadImage(src);

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    canvas.getContext("2d").drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);

    return canvas.toDataURL("image/jpeg", 0.85);
}
