interface Row {
  values: number[];
  operation: string;
  constraint: number;
}

export interface IterationInfo {
  iterationNum: number;
  pivot: number;
  matrix: number[][];
}
function compileMatrix(rows: Row[], functionCoefs: number[]): number[][] {
  const additionalVars: { [key: number]: number } = {};
  rows.forEach((row, i) => {
    switch (row.operation) {
      case "=":
        break;
      case "<=":
        additionalVars[i] = 1;
        break;
      case ">=":
        additionalVars[i] = -1;
        break;
    }
  });

  let addVarNum = 0;
  const matrix: number[][] = new Array(rows.length + 1);
  rows.forEach((row, i) => {
    const columnsCount =
      row.values.length + Object.keys(additionalVars).length + 1;
    matrix[i] = new Array(columnsCount).fill(0);
    row.values.forEach((value, j) => {
      matrix[i][j] = value;
    });

    if (additionalVars[i] !== undefined) {
      const addVarIndex = row.values.length + addVarNum;
      addVarNum++;
      matrix[i][addVarIndex] = additionalVars[i];
    }
    matrix[i][columnsCount - 1] = row.constraint;
  });

  const lastRow = rows.length;
  const length = [...functionCoefs];
  for (let i = 0; i < rows.length + 1; i++) {
    length.push(0);
  }
  matrix[lastRow] = length;
  return matrix;
}

function getColumn(matrix: number[][], j: number): number[] {
  return matrix.map((row) => row[j]);
}

function functionCoefs(matrix: number[][]): number[] {
  return matrix[matrix.length - 1];
}

function isOptimal(matrix: number[][]): boolean {
  return functionCoefs(matrix).every((coef) => coef <= 0);
}

function getOptimalPivot(matrix: number[][]): [number, number] {
  const a = matrix.slice(0, matrix.length - 1).map((row) => {
    return row.slice(0, row.length - 1);
  });
  const b = getColumn(matrix, matrix[0].length - 1);

  const ratios = a.map((row, i) => {
    return row.map((val) => {
      return val > 0 ? b[i] / val : 0;
    });
  });

  const coefs = functionCoefs(matrix);
  let maxVal = 0;
  let pivotRow = -1;
  let pivotColumn = -1;

  ratios[0].forEach((_, j) => {
    let minColumnVal = Infinity;
    let minRow = -1;

    ratios.forEach((row, i) => {
      if (row[j] > 0 && row[j] < minColumnVal) {
        minColumnVal = row[j];
        minRow = i;
      }
    });

    if (minRow !== -1 && coefs[j] * minColumnVal > maxVal) {
      maxVal = coefs[j] * minColumnVal;
      pivotRow = minRow;
      pivotColumn = j;
    }
  });

  return [pivotRow, pivotColumn];
}

export function solveSimplex(
  rows: Row[],
  functionCoefs: number[]
): { answers: number[] | null; iterations: IterationInfo[] } {
  const matrix = compileMatrix(rows, functionCoefs);
  const iterations: IterationInfo[] = [];
  iterations.push({
    iterationNum: 0,
    pivot: 0,
    matrix: JSON.parse(JSON.stringify(matrix)),
  });
  let iterationNum = 0;

  let count = 0;
  while (!isOptimal(matrix) && count < 30) {
    iterationNum++;
    const [pivotRow, pivotColumn] = getOptimalPivot(matrix);

    if (pivotRow === -1) {
      console.log("no solution");
      return { answers: null, iterations: [] };
    }

    const pivot = matrix[pivotRow][pivotColumn];
    matrix[pivotRow] = matrix[pivotRow].map((val) => val / pivot);

    if (count > 20) {
      console.log("no solution");
      return { answers: null, iterations: [] };
    }
    for (let i = 0; i < matrix.length; i++) {
      if (i === pivotRow) continue;
      const factor = matrix[i][pivotColumn];
      matrix[i] = matrix[i].map((val, j) => val - factor * matrix[pivotRow][j]);
    }

    iterations.push({
      iterationNum,
      pivot,
      matrix: JSON.parse(JSON.stringify(matrix)),
    });
    count++;
  }

  const answers = new Array(rows[0].values.length).fill(0);
  const b = getColumn(matrix, matrix[0].length - 1).slice(
    0,
    rows[0].values.length
  );
  const validColumns: { [key: number]: boolean } = {};

  for (let j = 0; j < rows[0].values.length; j++) {
    const column = getColumn(matrix, j);
    let oneCount = 0;
    let forceInvalid = false;

    for (const val of column) {
      if (val === 1) oneCount++;
      else if (val !== 0) {
        forceInvalid = true;
        break;
      }
    }

    if (forceInvalid) continue;
    validColumns[j] = oneCount === 1;
  }

  for (let i = 0; i < rows[0].values.length; i++) {
    for (let j = 0; j < rows[0].values.length; j++) {
      if (matrix[i][j] === 1 && validColumns[j]) {
        answers[j] = b[i];
        break;
      }
    }
  }

  return { answers, iterations };
}
