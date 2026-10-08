let pendingVisualFile = null;

/**
 * Store a query image until the homepage can run visual search.
 *
 * @param {File} file
 */
export function queueVisualSearchFile(file) {
  pendingVisualFile = file;
}

/**
 * Take the queued query image, if any.
 *
 * @returns {File | null}
 */
export function takeVisualSearchFile() {
  const file = pendingVisualFile;
  pendingVisualFile = null;
  return file;
}

/**
 * Prefer the device camera on phones and tablets.
 *
 * @returns {boolean}
 */
export function prefersCameraCapture() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(max-width: 1024px), (pointer: coarse)").matches;
}

/**
 * Queue a query image and open the homepage results view.
 *
 * @param {{ push: (href: string) => void }} router
 * @param {File} file
 */
export function startVisualSearchOnHome(router, file) {
  queueVisualSearchFile(file);
  router.push("/");
}
