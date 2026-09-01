// tokenizer.js
// 수식 문자열 -> 토큰 배열

const TOKEN_PATTERNS = [
  { type: 'RANGE', regex: /^\$?[A-Za-z]+\$?\d+:\$?[A-Za-z]+\$?\d+/ },
  { type: 'CELL', regex: /^\$?[A-Za-z]+\$?\d+/ },
  { type: 'NUMBER', regex: /^\d+(\.\d+)?%?/ },
  { type: 'STRING', regex: /^"([^"]|"")*"/ },
  { type: 'ERROR_LITERAL', regex: /^#(DIV\/0!|VALUE!|REF!|NAME\?|N\/A|NUM!|NULL!)/ },
  { type: 'FUNC_NAME', regex: /^[A-Za-z_][A-Za-z0-9_.]*(?=\()/ },
  { type: 'IDENTIFIER', regex: /^[A-Za-z_][A-Za-z0-9_]*/ },
  { type: 'OP', regex: /^(<>|<=|>=|=|<|>|\+|-|\*|\/|\^|&)/ },
  { type: 'COMMA', regex: /^,/ },
  { type: 'LPAREN', regex: /^\(/ },
  { type: 'RPAREN', regex: /^\)/ },
  { type: 'WS', regex: /^\s+/ },
];

export function tokenize(formula) {
  let src = formula.trim();
  if (src.startsWith('=')) src = src.slice(1);

  const tokens = [];
  let pos = 0;

  while (pos < src.length) {
    const remaining = src.slice(pos);
    let matched = false;

    for (const { type, regex } of TOKEN_PATTERNS) {
      const m = remaining.match(regex);
      if (m && m.index === 0) {
        if (type !== 'WS') {
          tokens.push({ type, value: m[0] });
        }
        pos += m[0].length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      throw new Error(`수식을 해석할 수 없습니다: "${remaining[0]}" (위치 ${pos})`);
    }
  }

  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}
