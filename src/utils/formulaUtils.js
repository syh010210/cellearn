export function toAddr(ri, ci) {
  return String.fromCharCode(65 + ci) + (ri + 1);
}

export function shiftFormula(formula, dRow, dCol) {
  return formula.replace(/(\$?)([A-Z]+)(\$?)(\d+)/g, (_, dc, col, dr, row) => {
    const newCol = dc ? col : String.fromCharCode(col.charCodeAt(0) + dCol);
    const newRow = dr ? row : String(parseInt(row) + dRow);
    return dc + newCol + dr + newRow;
  });
}
