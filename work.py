class Simplex:
    def init(self, table):
        self.table = table
        self.rows = len(table)
        self.columns = len(table[0])
        self.iteration = 0

    def print_table(self, highlight=None):
        column_width = 12
        precision = 2

        for i in range(self.rows):
            for j in range(self.columns):
                if highlight and (i, j) == highlight:
                    print(f"| {round(self.table[i][j], precision):^{column_width}.2f} ", end="")
                else:
                    print(f"| {round(self.table[i][j], precision):^{column_width}.2f} ", end="")
            print("|")

    def convert_table(self):
        while not self.find_answer():
            print(f"\nТекущая итерация: {self.iteration}")
            self.print_table()

            new_table = [[0] * self.columns for _ in range(self.rows)]

            index_key_rows, index_key_column = self.find_key()
            key_element = self.table[index_key_rows][index_key_column]

            print(f"\nИндексы разрешающего элемента: i:[{index_key_rows + 1}] j:[{index_key_column + 1}]")
            print(f"Разрешающий элемент: {round(key_element, 2)}")
            self.print_table(highlight=(index_key_rows, index_key_column))

            # Нормализуем разрешающую строку
            for j in range(self.columns):
                new_table[index_key_rows][j] = round(self.table[index_key_rows][j] / key_element, 2)

            # Обновляем остальные строки
            for i in range(self.rows):
                if i == index_key_rows:
                    continue
                for j in range(self.columns):
                    new_table[i][j] = round(
                        self.table[i][j] - self.table[i][index_key_column] * new_table[index_key_rows][j], 2)

            self.table = new_table
            self.iteration += 1

        print("\nИтоговая матрица:")
        self.print_table()

        print("\nВектор решения:")
        solution = []
        for j in range(self.columns - 1):
            if self.table[self.rows - 1][j] != 0:
                solution.append("0")
            else:
                one_row_index = next((i for i in range(self.rows - 1) if self.table[i][j] == 1), -1)
                if one_row_index != -1:
                    solution.append(f"{round(self.table[one_row_index][-1], 2)}")
                else:
                    solution.append("0")

        print("X{", "; ".join(solution), "}")

    def find_key(self):
        main_col = -1
        main_row = -1
        min_ratio = float('inf')

        # Находим входящую переменную (наиболее положительное значение в последней строке)
        for j in range(self.columns - 1):
            if self.table[self.rows - 1][j] > 0:
                # Находим выходящую переменную (минимальное отношение)
                for i in range(self.rows - 1):
                    if self.table[i][j] > 0:
                        ratio = self.table[i][self.columns - 1] / self.table[i][j]
                        if ratio < min_ratio:
                            min_ratio = ratio
                            main_row = i
                            main_col = j

        return main_row, main_col

    def find_answer(self):
        # Проверяем, есть ли положительные значения в последней строке
        return all(self.table[self.rows - 1][j] <= 0 for j in range(self.columns - 1))


zero_table = [
    [2.1, 2.3, 3.2, 1, 0, 0, 1500],
    [0.09, 0.07, 0.7, 0, 1, 0, 400],
    [7, 9, 8, 0, 0, 1, 4200],
    [28, 35, 34, 0, 0, 0, 0]
]
simplex = Simplex(zero_table)
simplex.convert_table()