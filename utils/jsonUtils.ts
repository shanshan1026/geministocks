/**
 * Extracts the likely JSON part from a string.
 * It looks for the first '{' or '['.
 * If it finds a balanced closing brace, it returns that segment.
 * If the string ends prematurely (truncated), it returns from the start brace to the end of the string,
 * allowing jsonrepair to fix the unclosed structures.
 */
export function extractJson(text: string): string {
    let startIndex = text.indexOf('{');
    const arrayStartIndex = text.indexOf('[');

    // Determine if we are looking for an object or an array
    // We prefer the one that appears first.
    let isObject = true;
    if (arrayStartIndex !== -1 && (startIndex === -1 || arrayStartIndex < startIndex)) {
        startIndex = arrayStartIndex;
        isObject = false;
    }

    if (startIndex === -1) return text; // No JSON start found

    const openChar = isObject ? '{' : '[';
    const closeChar = isObject ? '}' : ']';

    let balance = 0;
    let inString = false;
    let isEscaped = false;
    let endIndex = -1;

    for (let i = startIndex; i < text.length; i++) {
        const char = text[i];

        if (isEscaped) {
            isEscaped = false;
            continue;
        }

        if (char === '\\') {
            isEscaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === openChar) {
                balance++;
            } else if (char === closeChar) {
                balance--;
                if (balance === 0) {
                    endIndex = i;
                    break;
                }
            }
        }
    }

    if (endIndex !== -1) {
        return text.substring(startIndex, endIndex + 1);
    }

    // If we couldn't balance the braces (e.g. truncated output due to max_tokens),
    // we return the substring from the start. `jsonrepair` will handle closing it.
    return text.substring(startIndex);
}
