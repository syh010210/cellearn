// dependencyGraph.js
// 셀 간 참조 관계를 그래프로 관리하고, 값이 바뀐 셀로부터 영향받는 모든 셀을
// 위상 정렬(topological sort)하여 올바른 순서로 재계산할 수 있게 해준다.

export class DependencyGraph {
  constructor() {
    this.precedents = new Map(); // cellKey -> Set(이 셀이 참조하는 셀들)
    this.dependents = new Map(); // cellKey -> Set(이 셀을 참조하는 셀들)
  }

  clearCell(cellKey) {
    const prevPrecedents = this.precedents.get(cellKey);
    if (prevPrecedents) {
      prevPrecedents.forEach((p) => {
        const deps = this.dependents.get(p);
        if (deps) deps.delete(cellKey);
      });
    }
    this.precedents.set(cellKey, new Set());
  }

  setDependencies(cellKey, referencedCells) {
    this.clearCell(cellKey);
    const precSet = new Set(referencedCells);
    this.precedents.set(cellKey, precSet);
    referencedCells.forEach((ref) => {
      if (!this.dependents.has(ref)) this.dependents.set(ref, new Set());
      this.dependents.get(ref).add(cellKey);
    });
  }

  getDependents(cellKey) {
    return this.dependents.get(cellKey) || new Set();
  }

  getPrecedents(cellKey) {
    return this.precedents.get(cellKey) || new Set();
  }

  // changedCellKeys로부터 영향받는 모든 셀을 찾고, 계산 가능한 순서로 정렬한다.
  // 순환 참조가 있으면 { sorted, circular } 형태로 순환에 포함된 셀을 분리해서 반환.
  getAffectedCellsSorted(changedCellKeys) {
    const affected = new Set();
    const queue = [...changedCellKeys];
    while (queue.length) {
      const current = queue.shift();
      const deps = this.dependents.get(current) || new Set();
      deps.forEach((d) => {
        if (!affected.has(d)) {
          affected.add(d);
          queue.push(d);
        }
      });
    }

    // Kahn's algorithm: affected 집합 내부에서만 위상 정렬
    const inDegree = new Map();
    affected.forEach((cell) => inDegree.set(cell, 0));
    affected.forEach((cell) => {
      const precs = this.precedents.get(cell) || new Set();
      precs.forEach((p) => {
        if (affected.has(p)) {
          inDegree.set(cell, (inDegree.get(cell) || 0) + 1);
        }
      });
    });

    const sortQueue = [...affected].filter((c) => inDegree.get(c) === 0);
    const sorted = [];
    while (sortQueue.length) {
      const cell = sortQueue.shift();
      sorted.push(cell);
      const deps = this.dependents.get(cell) || new Set();
      deps.forEach((d) => {
        if (affected.has(d)) {
          inDegree.set(d, inDegree.get(d) - 1);
          if (inDegree.get(d) === 0) sortQueue.push(d);
        }
      });
    }

    if (sorted.length !== affected.size) {
      const circular = [...affected].filter((c) => !sorted.includes(c));
      return { sorted, circular };
    }

    return { sorted, circular: [] };
  }
}
