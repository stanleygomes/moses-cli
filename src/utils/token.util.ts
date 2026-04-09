export class TokenUtil {
  /**
   * Masks a token for display purposes (e.g., **********... (last 4 chars: 1234)).
   */
  static mask(token: string, maskedLength = 10, visibleTail = 4): string {
    const masked = token.replace(/./g, '*').substring(0, maskedLength);
    const tail = token.slice(-visibleTail);
    return `${masked}... (last ${visibleTail} chars: ${tail})`;
  }

  /**
   * Masks all occurrences of a token and its encoded variants within a text.
   */
  static maskInText(text: string, token: string): string {
    if (!token) {
      return text;
    }

    const basicAuth = Buffer.from(`oauth2:${token}`).toString('base64');
    const encodedToken = encodeURIComponent(token);

    return [token, encodedToken, basicAuth].reduce(
      (maskedText, secret) => (secret ? maskedText.replaceAll(secret, '***') : maskedText),
      text,
    );
  }
}
