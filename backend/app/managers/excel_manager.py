import xlwings as xw
import pandas as pd

class ExcelManager:
    def __init__(self):
        self.wb = None
        self.active_sheet = None
    
    def connect_to_excel(self) -> bool:
        try:
            self.wb = xw.books.active
            self.active_sheet = self.wb.sheets.active
            return True
        except Exception as e:
            print(f"Error connecting to Excel: {e}")
            return False
    
    def read_active_sheet(self) -> dict:
        if not self.active_sheet:
            return {"error": "No active sheet"}
        
        try:
            used_range = self.active_sheet.used_range
            values = used_range.value
            df = pd.DataFrame(values)
            if not df.empty:
                df.columns = df.iloc[0] if any(isinstance(x, str) for x in df.iloc[0]) else [f"Column{i}" for i in range(len(df.columns))]
                df = df.iloc[1:] if any(isinstance(x, str) for x in df.iloc[0]) else df
            return {"data": df.to_dict('records')}
        except Exception as e:
            return {"error": f"Error reading sheet: {e}"}
    
    def update_cell(self, cell: str, value: any) -> bool:
        try:
            self.active_sheet.range(cell).value = value
            return True
        except Exception as e:
            print(f"Error updating cell: {e}")
            return False