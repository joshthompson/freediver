export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}

export function randomItem<T>(array: T[] | readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function generateFrames(
  image: string,
  imageWidth: number,
  imageHeight: number,
  displayWidth: number,
  frameCount: number,
  reverse = false,
): string[] {
  const frames = Array(frameCount).fill(null).map(
    (_, n) => `${image}#${displayWidth * n},0,${imageWidth},${imageHeight}`
  )
  return reverse ? frames.reverse() : frames
}

// Frames from a sheet of cells in a row, with empty gutters between them (and half a gutter before
// the first and after the last) so a shrunk frame never picks up the edge of its neighbour. The
// sheet is drawn to the sprite's height, so each cell should be the sprite's shape, or close enough
// that any difference is a sliver of the cell's own empty space or the gutter
export function generateSheetFrames(
  image: string,
  sheet: { cell: { width: number, height: number }, gutter: number, frameCount: number },
  displayHeight: number,
): string[] {
  const { cell, gutter, frameCount } = sheet
  const scale = displayHeight / cell.height
  return Array(frameCount).fill(null).map(
    (_, n) => `${image}#${-(gutter / 2 + n * (cell.width + gutter)) * scale},0,${cell.width},${cell.height}`
  )
}
