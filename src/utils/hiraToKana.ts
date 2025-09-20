/**
 *
 * @param str
 * @returns 全角ひらがなをカタカナにします
 */

export default function hiraToKana(str: string) {
  return str.replace(/[\u3041-\u3096\u30FC]/g, (m) =>
    String.fromCharCode(m.charCodeAt(0) + 0x60));
}