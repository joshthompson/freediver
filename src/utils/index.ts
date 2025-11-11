export function activeTarget(
  targets: string[],
  headerRef: HTMLElement | undefined,
  scrollY: () => number,
  scrollPadding = 20,
): string {
  const sorted = targets
    .map(target => ({
      id: target,
      top:
        document.getElementById(target)?.getBoundingClientRect().top ??
        Infinity,
    }))
    .sort((a, b) => a.top - b.top)
  if (scrollY() === 0) {
    return sorted[0]?.id
  }
  if (scrollY() + window.innerHeight >= document.documentElement.scrollHeight) {
    return sorted[sorted.length - 1]?.id
  }

  const headerHeight = headerRef?.getBoundingClientRect().height ?? 0

  return (
    (
      sorted.findLast(target => target.top < headerHeight + scrollPadding) ??
      sorted[0]
    )?.id ?? ''
  )
}

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
