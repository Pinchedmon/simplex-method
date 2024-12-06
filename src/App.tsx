import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { IterationInfo, solveSimplex } from "./lib/simplex";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Row } from "./row";

export enum operations {
  LESSEQUAL = "<=",
  GREATEREQUAL = ">=",
  EQUAL = "=",
}

export interface IRow {
  values: number[];
  operation: string;
  constraint: number;
  setRow?: (x: IRow) => void;
}

function App() {
  const [rowsFxValue, setRowsFxValue] = useState<number[]>([1, 1, 1]);
  const [rows, setRows] = useState<IRow[]>([
    { values: [-1, 3, 2], operation: operations.LESSEQUAL, constraint: 6 },
    { values: [2, 4, 2], operation: operations.LESSEQUAL, constraint: 8 },
    { values: [3, 2, -1], operation: operations.LESSEQUAL, constraint: 4 },
  ]);
  const [iterations, setIterations] = useState<IterationInfo[]>([]);
  const [result, setResult] = useState<number[]>();
  const handleFxValueChange = (index: number, value: string) => {
    const newValue = Number(value);
    setRowsFxValue((prevValues) => {
      const updatedValues = [...prevValues];
      updatedValues[index] = newValue;
      return updatedValues;
    });
  };

  const addRow = () => {
    setRowsFxValue((prev) => [...prev, 0]);
    const newRow = {
      values: Array(rowsFxValue.length + 1).fill(0),
      operation: operations.LESSEQUAL,
      constraint: 0,
    };
    const updatedRows = rows.map((row) => ({
      ...row,
      values: Array(rowsFxValue.length + 1).fill(0),
    }));

    setRows([...updatedRows, newRow]);
  };
  const addRowWithoutFX = () => {
    const newRow = {
      values: Array(rowsFxValue.length).fill(0),
      operation: operations.LESSEQUAL,
      constraint: 0,
    };

    setRows((prev) => [...prev, newRow]);
  };

  const deleteRow = () => {
    if (rows.length > 0) {
      const updatedRows = rows.slice(0, -1);
      setRowsFxValue(rowsFxValue.slice(0, -1));
      const newRows = updatedRows.map((row) => ({
        ...row,
        values: Array(rowsFxValue.length - 1).fill(0),
      }));

      setRows(newRows);
    }
  };
  const deleteRowWithoutFx = () => {
    if (rows.length > 0) {
      const updatedRows = rows.slice(0, -1);
      setRows(updatedRows);
    }
  };

  const setRow = (index: number, updatedRow: IRow) => {
    const updatedRows = [...rows];
    updatedRows[index] = updatedRow;
    setRows(updatedRows);
  };

  const solve = () => {
    const result = solveSimplex(rows, rowsFxValue);
    setIterations(result.iterations);
    setResult(result.answers as number[]);
  };

  const resolveFinal = () => {
    let x = 0;
    if (result) {
      result.forEach((val: number, i: number) => {
        x += rowsFxValue[i] * val;
      });
    }

    return x;
  };
  return (
    <div className="p-4 container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Симплекс метод</CardTitle>
          <CardDescription>Сделал Темников Алексей 419/8</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-8">
            Целевая функция: fx=
            {rowsFxValue.map((value, index) => (
              <div className="flex gap-2 items-center" key={index}>
                <Input
                  onChange={(e) => handleFxValueChange(index, e.target.value)}
                  value={value}
                />
                <p>x{index + 1}</p>

                {index !== rowsFxValue.length - 1 && `+`}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {rows.map((item, index) => (
              <Row
                key={index}
                {...item}
                setRow={(updatedRow: IRow) => setRow(index, updatedRow)}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-4">
            <Button className="mt-4" onClick={solve}>
              Решить
            </Button>
            <Button variant="secondary" className="mt-4" onClick={addRow}>
              Добавить
            </Button>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={addRowWithoutFX}
            >
              Добавить без огр
            </Button>
            <Button variant="destructive" className="mt-4" onClick={deleteRow}>
              Удалить
            </Button>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={deleteRowWithoutFx}
            >
              Удалить без Огр
            </Button>
          </div>
        </CardFooter>
      </Card>
      <div className="mt-8">
        {iterations.map((iteration, index) => (
          <Card key={index} className="mb-4">
            <CardHeader>
              <CardTitle>
                {index == 0
                  ? `Создаём матрицу`
                  : `Итерация ${iteration.iterationNum}`}
              </CardTitle>
              <CardDescription>
                Разрешающий элемент: {iteration.pivot}
              </CardDescription>
            </CardHeader>
            <CardContent>
              0.15
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      {iteration.matrix[0].map((_: any, colIndex: number) => (
                        <th key={colIndex} className="border px-4 py-2">
                          {colIndex !== iteration.matrix[0].length - 1
                            ? `x${colIndex + 1}`
                            : "вектор ресурсов"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {iteration.matrix.map((row: number[], rowIndex: number) => (
                      <tr key={rowIndex}>
                        {row.map((value: number, colIndex: number) => (
                          <td key={colIndex} className="border px-4 py-2">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {result && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Ответ</CardTitle>
            <CardContent className="flex w-full justify-between">
              {result.map((item, index) => (
                <p key={index}>
                  x{index}: {item}
                </p>
              ))}
              <p>fx: {resolveFinal()}</p>
            </CardContent>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

export default App;
