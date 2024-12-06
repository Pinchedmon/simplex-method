import { useState } from "react";
import { IRow, operations } from "./App";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

export const Row = ({ values, operation, constraint, setRow }: IRow) => {
  const [selectedOperation, setSelectedOperation] = useState<string>(operation);

  const handleSelectChange = (value: string) => {
    setSelectedOperation(value);
    if (setRow) {
      setRow({ values, operation: value, constraint });
    }
  };

  const handleValueChange = (index: number, newValue: string) => {
    const updatedValues = [...values];
    updatedValues[index] = Number(newValue);
    if (setRow) {
      setRow({
        values: updatedValues,
        operation: selectedOperation,
        constraint,
      });
    }
  };

  const handleConstraintChange = (newValue: string) => {
    const newConstraint = Number(newValue);
    if (setRow) {
      setRow({
        values,
        operation: selectedOperation,
        constraint: newConstraint,
      });
    }
  };

  return (
    <div className="flex w-full gap-4">
      <div className="flex gap-2">
        {values.map((item: number, index: number) => (
          <Input
            key={index}
            value={item}
            onChange={(e) => handleValueChange(index, e.target.value)} // Обработчик изменения значения
          />
        ))}
      </div>
      <div>
        <Select
          defaultValue={selectedOperation}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue className="text-red" placeholder="Select Operation">
              {selectedOperation}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(operations).map(([key, label]) => (
              <SelectItem
                defaultChecked={key == selectedOperation}
                key={key}
                value={label}
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Input
          value={constraint}
          onChange={(e) => handleConstraintChange(e.target.value)} // Обработчик изменения ограничения
        />
      </div>
    </div>
  );
};
