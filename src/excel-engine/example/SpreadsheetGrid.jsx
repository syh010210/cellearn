import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Sheet } from '../index.js';
import { colIndexToLetters } from '../cellAddress.js';

// 기본 데모용 그리드: 실제 프로젝트에서는 컴활 실기 문제 데이터에 맞게
// numRows/numCols와 초기값을 조정해서 쓰면 됩니다.
const NUM_ROWS = 20;
const NUM_COLS = 10;

export default function SpreadsheetGrid() {
  const sheetRef = useRef(null);
  if (!sheetRef.current) sheetRef.current = new Sheet();
  const sheet = sheetRef.current;

  const [version, setVersion] = useState(0); // 강제 리렌더용
  const [selected, setSelected] = useState('A1');
  const [editingValue, setEditingValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useMemo(() => {
    sheet.onChange(() => setVersion((v) => v + 1));
  }, [sheet]);

  const columns = useMemo(
    () => Array.from({ length: NUM_COLS }, (_, i) => colIndexToLetters(i)),
    []
  );
  const rows = useMemo(() => Array.from({ length: NUM_ROWS }, (_, i) => i + 1), []);

  const commitEdit = useCallback(
    (address, value) => {
      sheet.setCellInput(address, value);
      setIsEditing(false);
    },
    [sheet]
  );

  const handleCellClick = (address) => {
    if (isEditing && selected !== address) {
      commitEdit(selected, editingValue);
    }
    setSelected(address);
    setEditingValue(sheet.getRawInput(address));
    setIsEditing(false);
  };

  const handleCellDoubleClick = (address) => {
    setSelected(address);
    setEditingValue(sheet.getRawInput(address));
    setIsEditing(true);
  };

  const handleKeyDown = (e, address) => {
    if (e.key === 'Enter') {
      commitEdit(address, editingValue);
      moveSelection(address, 1, 0);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingValue(sheet.getRawInput(address));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      commitEdit(address, editingValue);
      moveSelection(address, 0, 1);
    }
  };

  const moveSelection = (fromAddress, dRow, dCol) => {
    const colLetter = fromAddress.match(/[A-Za-z]+/)[0];
    const rowNum = parseInt(fromAddress.match(/\d+/)[0], 10);
    const colIdx = columns.indexOf(colLetter);
    const nextCol = columns[Math.min(columns.length - 1, Math.max(0, colIdx + dCol))];
    const nextRow = Math.min(NUM_ROWS, Math.max(1, rowNum + dRow));
    const nextAddr = `${nextCol}${nextRow}`;
    setSelected(nextAddr);
    setEditingValue(sheet.getRawInput(nextAddr));
    setIsEditing(false);
  };

  const formulaBarValue = isEditing ? editingValue : sheet.getRawInput(selected);

  return (
    <div style={styles.wrapper}>
      <div style={styles.formulaBar}>
        <span style={styles.cellBadge}>{selected}</span>
        <input
          style={styles.formulaInput}
          value={formulaBarValue}
          onChange={(e) => {
            setEditingValue(e.target.value);
            setIsEditing(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit(selected, editingValue);
          }}
          placeholder="셀 값이나 =수식을 입력하세요 (예: =SUM(A1:A3))"
        />
      </div>

      <div style={styles.gridScroll}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.cornerHeader} />
              {columns.map((col) => (
                <th key={col} style={styles.colHeader}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <th style={styles.rowHeader}>{row}</th>
                {columns.map((col) => {
                  const address = `${col}${row}`;
                  const isSelected = address === selected;
                  const isCellEditing = isSelected && isEditing;
                  const displayValue = sheet.getDisplayValue(address);
                  const isError = typeof displayValue === 'string' && displayValue.startsWith('#');

                  return (
                    <td
                      key={address}
                      style={{
                        ...styles.cell,
                        ...(isSelected ? styles.cellSelected : {}),
                      }}
                      onClick={() => handleCellClick(address)}
                      onDoubleClick={() => handleCellDoubleClick(address)}
                    >
                      {isCellEditing ? (
                        <input
                          autoFocus
                          style={styles.cellInput}
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => commitEdit(address, editingValue)}
                          onKeyDown={(e) => handleKeyDown(e, address)}
                        />
                      ) : (
                        <span style={isError ? styles.errorText : undefined}>
                          {displayValue}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: '"Segoe UI", -apple-system, sans-serif',
    fontSize: 13,
    border: '1px solid #d0d7de',
    borderRadius: 6,
    overflow: 'hidden',
    background: '#fff',
  },
  formulaBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderBottom: '1px solid #d0d7de',
    background: '#f6f8fa',
  },
  cellBadge: {
    minWidth: 40,
    textAlign: 'center',
    fontWeight: 600,
    padding: '4px 6px',
    background: '#fff',
    border: '1px solid #d0d7de',
    borderRadius: 4,
  },
  formulaInput: {
    flex: 1,
    padding: '5px 8px',
    border: '1px solid #d0d7de',
    borderRadius: 4,
    fontSize: 13,
    fontFamily: 'inherit',
  },
  gridScroll: {
    overflow: 'auto',
    maxHeight: 480,
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
  },
  cornerHeader: {
    width: 36,
    background: '#f6f8fa',
    border: '1px solid #d0d7de',
    position: 'sticky',
    left: 0,
    top: 0,
    zIndex: 3,
  },
  colHeader: {
    minWidth: 80,
    padding: '4px 6px',
    background: '#f6f8fa',
    border: '1px solid #d0d7de',
    fontWeight: 600,
    color: '#57606a',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
  rowHeader: {
    width: 36,
    padding: '4px 6px',
    background: '#f6f8fa',
    border: '1px solid #d0d7de',
    fontWeight: 600,
    color: '#57606a',
    position: 'sticky',
    left: 0,
    zIndex: 1,
  },
  cell: {
    minWidth: 80,
    height: 26,
    padding: '2px 6px',
    border: '1px solid #e1e4e8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'cell',
  },
  cellSelected: {
    outline: '2px solid #1a73e8',
    outlineOffset: -2,
    background: '#e8f0fe',
  },
  cellInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: 13,
    fontFamily: 'inherit',
    background: 'transparent',
  },
  errorText: {
    color: '#cf222e',
  },
};
