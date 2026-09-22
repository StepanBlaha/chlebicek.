const WIDTH = 1320;
const HEIGHT = 840;

function revokeLater(url: string): void {
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function pathFill(path: SVGPathElement): string | null {
  if (path.hasAttribute('fill')) return path.getAttribute('fill');

  if (typeof getComputedStyle === 'function') {
    const fill = getComputedStyle(path).fill;
    if (fill) return fill;
  }

  let parent = path.parentElement;
  while (parent) {
    const fill = parent.getAttribute('fill');
    if (fill) return fill;
    parent = parent.parentElement;
  }
  return 'black';
}

function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const sourcePaths = Array.from(svg.querySelectorAll('path'));
  const clonedPaths = Array.from(clone.querySelectorAll('path'));

  clonedPaths.forEach((path, index) => {
    const fill = pathFill(sourcePaths[index] ?? path);
    if (fill) path.setAttribute('fill', fill);
  });

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('viewBox', '0 0 660 420');
  clone.setAttribute('width', '660');
  clone.setAttribute('height', '420');
  clone.removeAttribute('class');
  clone.removeAttribute('style');
  clone.querySelectorAll('style, animate, animateMotion, animateTransform, set').forEach((element) => element.remove());
  clone.querySelectorAll('*').forEach((element) => {
    element.removeAttribute('class');
    element.removeAttribute('aria-pressed');
    element.removeAttribute('tabindex');
    element.removeAttribute('style');
    element.removeAttribute('begin');
    element.removeAttribute('dur');
    element.removeAttribute('repeatCount');
  });

  return new XMLSerializer().serializeToString(clone);
}

function imageFromSvg(svgText: string): { image: HTMLImageElement; url: string } {
  const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  return { image, url };
}

function decodeImage(image: HTMLImageElement): Promise<void> {
  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Could not decode SVG image.'));
    void image.decode().then(resolve, reject);
  });
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not create PNG.'));
    }, 'image/png');
  });
}

function cropSticker(source: HTMLCanvasElement): HTMLCanvasElement {
  const context = source.getContext('2d');
  if (!context) throw new Error('Could not access canvas.');

  const pixels = context.getImageData(0, 0, source.width, source.height).data;
  let left = source.width;
  let top = source.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      if (pixels[(y * source.width + x) * 4 + 3] > 0) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < 0) return source;

  const padding = 30;
  const contour = 10;
  const cropped = document.createElement('canvas');
  cropped.width = right - left + 1 + padding * 2;
  cropped.height = bottom - top + 1 + padding * 2;
  cropped.getContext('2d')!.drawImage(source, left, top, right - left + 1, bottom - top + 1, padding, padding, right - left + 1, bottom - top + 1);

  const output = document.createElement('canvas');
  output.width = cropped.width + contour * 2;
  output.height = cropped.height + contour * 2;
  const outputContext = output.getContext('2d');
  if (!outputContext) throw new Error('Could not access canvas.');
  const contourLayer = document.createElement('canvas');
  contourLayer.width = output.width;
  contourLayer.height = output.height;
  const contourContext = contourLayer.getContext('2d')!;
  for (let y = -contour; y <= contour; y += 1) {
    for (let x = -contour; x <= contour; x += 1) {
      if (x * x + y * y <= contour * contour) contourContext.drawImage(cropped, contour + x, contour + y);
    }
  }
  contourContext.globalCompositeOperation = 'source-in';
  contourContext.fillStyle = 'white';
  contourContext.fillRect(0, 0, output.width, output.height);
  outputContext.drawImage(contourLayer, 0, 0);
  outputContext.drawImage(cropped, contour, contour);
  return output;
}

export async function exportPng(svg: SVGSVGElement, sticker: boolean): Promise<void> {
  const { image, url } = imageFromSvg(serializeSvg(svg));
  try {
    await decodeImage(image);
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not access canvas.');
    if (!sticker) {
      context.fillStyle = '#f4f5f7';
      context.fillRect(0, 0, WIDTH, HEIGHT);
    }
    context.drawImage(image, 0, 0, WIDTH, HEIGHT);
    const output = sticker ? cropSticker(canvas) : canvas;
    const blob = await canvasBlob(output);
    const downloadUrl = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = sticker ? 'chlebicek-samolepka.png' : 'chlebicek.png';
      link.click();
    } finally {
      revokeLater(downloadUrl);
    }
  } finally {
    revokeLater(url);
  }
}
