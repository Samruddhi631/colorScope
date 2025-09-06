document.addEventListener('DOMContentLoaded', () => {
  const back = document.getElementById('back');
  const forward = document.getElementById('forward');
  const colorPalette = document.getElementById('colorPalette');
  const paletteInfo = document.getElementById('paletteInfo');
  const copyNotification = document.getElementById('copyNotification');
  const decreaseColorsBtn = document.getElementById('decreaseColors');
  const increaseColorsBtn = document.getElementById('increaseColors');
  const colorCountDisplay = document.getElementById('colorCountDisplay');

  // ---------- History ----------
  let history = JSON.parse(localStorage.getItem('paletteHistory')) || [];
  let currentIndex = parseInt(localStorage.getItem('paletteIndex')) || -1;

  // ---------- Config ----------
  let colorCount = 5; // default number of colors

  // ---------- Utility ----------
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      Math.round(
        (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255
      );
    return `#${f(0).toString(16).padStart(2, '0')}${f(8)
      .toString(16)
      .padStart(2, '0')}${f(4).toString(16).padStart(2, '0')}`;
  }

  function getContrastColor(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  async function getColorName(code) {
    const res = await fetch(`https://www.thecolorapi.com/id?hex=${code}`);
    if (!res.ok) throw new Error('Color not found.');
    return await res.json();
  }

  // ---------- Copy Notification ----------
  async function copyToClipboard(color) {
    try {
      await navigator.clipboard.writeText(color);
      copyNotification.classList.remove('invisible');
      copyNotification.classList.add('block');
      setTimeout(() => {
        copyNotification.classList.add('invisible');
        copyNotification.classList.remove('block');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  }

  // ---------- Palette Generators (with improvements) ----------
  function generatePalette(harmony, baseHue, count) {
  const colors = [];
  let hues = [];

  switch (harmony) {
    case 'Triadic':
      hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
      break;
    case 'Split Complementary':
    const complement = (baseHue + 180) % 360;
    const offset = randomInt(20, 40); // wider flexible offset
    hues = [
    baseHue,
    (complement - offset + 360) % 360,
    (complement + offset) % 360,
    ];
    break;
    case 'Tetradic':
  // Wider spread instead of fixed 90°
  const stepAngle = randomInt(60, 120); // flexible gap
  hues = [
    baseHue,
    (baseHue + stepAngle) % 360,
    (baseHue + 180) % 360,
    (baseHue + 180 + stepAngle) % 360,
  ];
  break;

    case 'Analogous':
      // spread across ±60 instead of ±30
      const step = 120 / (count - 1); // distribute evenly
      for (let i = 0; i < count; i++) {
        hues.push((baseHue - 60 + i * step + 360) % 360);
      }
      break;
    case 'Monochromatic':
      // vary saturation and lightness more widely
      for (let i = 0; i < count; i++) {
        const s = 30 + i * (50 / (count - 1)); // 30 → 80
        const l = 20 + i * (60 / (count - 1)); // 20 → 80
        colors.push(hslToHex(baseHue, s, l));
      }
      return colors;
    case 'Natural':
      hues = Array(count)
        .fill(0)
        .map((_, i) => (baseHue + i * 20) % 360);
      break;
  }

  // generate final colors (for non-monochromatic)
  for (let i = 0; i < count; i++) {
    const h = hues[i % hues.length];
    colors.push(hslToHex(h, randomInt(40, 80), randomInt(40, 80)));
  }

  return colors;
}


  function getRandomHarmony() {
    const types = [
      'Triadic',
      'Split Complementary',
      'Tetradic',
      'Analogous',
      'Monochromatic',
      'Natural',
    ];
    return types[randomInt(0, types.length - 1)];
  }

  function newPalette(harmony = null, baseHue = null) {
    const chosenHarmony = harmony || getRandomHarmony();
    const hue = baseHue !== null ? baseHue : randomInt(0, 360);
    const colors = generatePalette(chosenHarmony, hue, colorCount);

    const palette = {
      colors,
      name: chosenHarmony,
      description: `${chosenHarmony} Harmony`,
      baseHue: hue,
    };

    pushPalette(palette);
    renderPalette(palette);
    updateButtons();
  }

  // ---------- Render ----------
  function createColorBox(color, colorCount) {
    const textColor = getContrastColor(color);

    // Adjust size based on colorCount
    let padding = 'p-6';
    let hexSize = 'text-4xl';
    let nameSize = 'text-sm';
    let clickSize = 'text-xs';

    if (colorCount >= 7) {
      padding = 'p-3';
      hexSize = 'text-lg';
      nameSize = 'text-xs';
      clickSize = 'text-[10px]';
    } else if (colorCount === 6) {
      padding = 'p-4';
      hexSize = 'text-2xl';
      nameSize = 'text-sm';
      clickSize = 'text-xs';
    } else if (colorCount === 5) {
      padding = 'p-5';
      hexSize = 'text-3xl';
      nameSize = 'text-sm';
      clickSize = 'text-xs';
    }

    const box = document.createElement('div');
    box.classList.add(
      'flex-1',
      'flex',
      'flex-col',
      'justify-center',
      'items-center',
      padding,
      'cursor-pointer'
    );
    box.style.backgroundColor = color;

    box.innerHTML = `
      <h2 class="${hexSize} font-bold mb-2" style="color:${textColor}">${color
      .replace('#', '')
      .toUpperCase()}</h2>
      <p class="color-name ${nameSize} opacity-90" style="color:${textColor}">Loading...</p>
      <p class="${clickSize} mt-2 opacity-60" style="color:${textColor}">Click to copy</p>
    `;

    box.addEventListener('click', () => copyToClipboard(color));
    return box;
  }

  function renderPalette(paletteData) {
    colorPalette.innerHTML = '';
    paletteInfo.textContent = `${paletteData.name} - ${paletteData.description}`;

    paletteData.colors.forEach((color) => {
      const box = createColorBox(color, paletteData.colors.length);
      colorPalette.appendChild(box);

      getColorName(color.replace('#', ''))
        .then((data) => {
          const nameEl = box.querySelector('.color-name');
          if (nameEl) nameEl.textContent = data.name.value;
        })
        .catch(() => {
          const nameEl = box.querySelector('.color-name');
          if (nameEl) nameEl.textContent = 'Color';
        });
    });
  }

  // ---------- History Management ----------
  function saveHistory() {
    localStorage.setItem('paletteHistory', JSON.stringify(history));
    localStorage.setItem('paletteIndex', currentIndex);
  }

  function pushPalette(palette) {
    history = history.slice(0, currentIndex + 1); // remove future
    history.push(palette);
    currentIndex = history.length - 1;
    saveHistory();
  }

  function undo() {
    if (currentIndex > 0) {
      currentIndex--;
      renderPalette(history[currentIndex]);
      saveHistory();
      updateButtons();
    }
  }

  function redo() {
    if (currentIndex < history.length - 1) {
      currentIndex++;
      renderPalette(history[currentIndex]);
      saveHistory();
      updateButtons();
    }
  }

  function updateButtons() {
    setEnabled(back, currentIndex > 0);
    setEnabled(forward, currentIndex < history.length - 1);
    if (colorCountDisplay) colorCountDisplay.textContent = colorCount;
  }

  function setEnabled(el, enabled) {
    if (!el) return;
    if (enabled) {
      el.classList.remove('text-gray-400', 'pointer-events-none');
      el.classList.add('text-black', 'cursor-pointer', 'hover:text-gray-600');
    } else {
      el.classList.remove('text-black', 'cursor-pointer', 'hover:text-gray-600');
      el.classList.add('text-gray-400', 'pointer-events-none');
    }
  }

  // ---------- Event Listeners ----------
  back.addEventListener('click', undo);
  forward.addEventListener('click', redo);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      newPalette();
    } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
      e.preventDefault();
      undo();
    } else if (e.key === 'ArrowRight' && e.ctrlKey) {
      e.preventDefault();
      redo();
    }
  });

  if (increaseColorsBtn && decreaseColorsBtn) {
    increaseColorsBtn.addEventListener('click', () => {
      if (colorCount < 7) {
        colorCount++;
        const lastPalette = history[currentIndex];
        newPalette(lastPalette.name, lastPalette.baseHue);
      }
    });

    decreaseColorsBtn.addEventListener('click', () => {
      if (colorCount > 4) {
        colorCount--;
        const lastPalette = history[currentIndex];
        newPalette(lastPalette.name, lastPalette.baseHue);
      }
    });
  }

  // ---------- Init ----------
  if (currentIndex < 0 || history.length === 0) newPalette();
  else renderPalette(history[currentIndex]);
  updateButtons();
});
