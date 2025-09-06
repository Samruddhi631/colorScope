const imageInput = document.getElementById("imageInput");
const paletteContainer = document.getElementById("palette");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    // Draw image to canvas
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Collect colors
    let colors = {};
    for (let i = 0; i < imageData.length; i += 4 * 10) { // step to reduce processing
      let r = imageData[i];
      let g = imageData[i + 1];
      let b = imageData[i + 2];
      let rgb = `${r},${g},${b}`;
      colors[rgb] = (colors[rgb] || 0) + 1;
    }

    // Sort by frequency & pick top 6
    let sortedColors = Object.entries(colors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(c => c[0]);

    // Show palette
    paletteContainer.innerHTML = "";
    sortedColors.forEach(rgb => {
      let hex = rgbToHex(...rgb.split(",").map(Number));
      let box = document.createElement("div");
      box.className = "color-box";
      box.style.background = `rgb(${rgb})`;
      box.innerText = hex;

      // Copy on click
      box.addEventListener("click", () => {
        navigator.clipboard.writeText(hex);
        alert(`Copied ${hex}`);
      });

      paletteContainer.appendChild(box);
    });
  };
});

// Convert RGB to HEX
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
  );
}
