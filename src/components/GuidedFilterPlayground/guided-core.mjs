// Grayscale Guided Filter: local linear model in normalized [0, 1] display values.
// Educational implementation; not a scene-linear or OpenCV-equivalent color processor.
function validatePlane(plane, width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      width < 1 || height < 1 || width * height > 1_048_576 ||
      !(plane instanceof Uint8ClampedArray) || plane.length !== width * height) {
    throw new RangeError('有効な8-bitグレースケール画像（最大1,048,576画素）が必要です。');
  }
}

// Integral-image box mean with truncated windows at image borders.
// The actual number of pixels is used at borders; there is no wraparound.
function boxMean(input, width, height, radius) {
  const stride = width + 1;
  const prefix = new Float64Array(stride * (height + 1));
  for (let y = 1; y <= height; y += 1) {
    let row = 0;
    for (let x = 1; x <= width; x += 1) {
      row += input[(y - 1) * width + x - 1];
      prefix[y * stride + x] = prefix[(y - 1) * stride + x] + row;
    }
  }
  const mean = new Float64Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height, y + radius + 1);
    for (let x = 0; x < width; x += 1) {
      const left = Math.max(0, x - radius);
      const right = Math.min(width, x + radius + 1);
      const sum = prefix[bottom * stride + right] - prefix[top * stride + right] -
                  prefix[bottom * stride + left] + prefix[top * stride + left];
      mean[y * width + x] = sum / ((right - left) * (bottom - top));
    }
  }
  return mean;
}

/**
 * p: source to filter; guide: aligned guide image. Either may be the same buffer.
 * radius: box-window radius in pixels (1–8).
 * regularization: display-value levels (1–100), squared after normalization to epsilon.
 */
export function guidedFilterGrayscale(p, guide, width, height, radius = 3, regularization = 20) {
  validatePlane(p, width, height);
  validatePlane(guide, width, height);
  if (!Number.isInteger(radius) || radius < 1 || radius > 8 ||
      !Number.isInteger(regularization) || regularization < 1 || regularization > 100) {
    throw new RangeError('半径は1〜8px、正則化の目安は1〜100階調の整数です。');
  }
  const n = width * height;
  const I = new Float64Array(n);
  const P = new Float64Array(n);
  const II = new Float64Array(n);
  const IP = new Float64Array(n);
  for (let i = 0; i < n; i += 1) {
    I[i] = guide[i] / 255;
    P[i] = p[i] / 255;
    II[i] = I[i] * I[i];
    IP[i] = I[i] * P[i];
  }
  const meanI = boxMean(I, width, height, radius);
  const meanP = boxMean(P, width, height, radius);
  const meanII = boxMean(II, width, height, radius);
  const meanIP = boxMean(IP, width, height, radius);
  const epsilon = (regularization / 255) ** 2;
  const a = new Float64Array(n);
  const b = new Float64Array(n);
  for (let i = 0; i < n; i += 1) {
    const variance = Math.max(0, meanII[i] - meanI[i] * meanI[i]);
    const covariance = meanIP[i] - meanI[i] * meanP[i];
    a[i] = covariance / (variance + epsilon);
    b[i] = meanP[i] - a[i] * meanI[i];
  }
  const meanA = boxMean(a, width, height, radius);
  const meanB = boxMean(b, width, height, radius);
  const result = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i += 1) {
    result[i] = 255 * (meanA[i] * I[i] + meanB[i]);
  }
  return result;
}
