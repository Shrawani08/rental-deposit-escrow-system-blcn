/**
 * Cryptographic utility for SHA-256 evidence hashing
 */

/**
 * Computes SHA-256 hash of a string input
 * @param {string} text 
 * @returns {Promise<string>} Hex representation of SHA-256 hash
 */
export async function computeStringHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes SHA-256 hash of an uploaded File object (image, document)
 * @param {File} file 
 * @returns {Promise<string>} Hex representation of SHA-256 hash
 */
export async function computeFileHash(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a browser-session image preview without uploading the file.
 * @param {File} file
 * @returns {Promise<string>} Data URL suitable for an image src
 */
export function readFilePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string' || !reader.result) {
        reject(new Error('Unable to create an image preview.'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error || new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Truncates an Ethereum address or Hash for clean UI display
 */
export function shortenHash(hash, chars = 6) {
  if (!hash) return '';
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}
