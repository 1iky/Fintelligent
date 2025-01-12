import xlwings as xw
import pandas as pd

class ExcelManager:
    def __init__(self):
        self.wb = None
        self.active_sheet = None
    
    def connect_to_excel(self) -> bool:
        """Establish connection to active Excel workbook"""
        try:
            self.wb = xw.books.active
            self.active_sheet = self.wb.sheets.active
            return True
        except Exception as e:
            print(f"Error connecting to Excel: {e}")
            return False
    
    def read_active_sheet(self) -> dict:
        """Read data from active Excel sheet"""
        if not self.active_sheet:
            return {"error": "No active sheet"}
        
        try:
            used_range = self.active_sheet.used_range
            values = used_range.value
            
            # Handle empty sheet
            if not values:
                return {"data": []}
                
            df = pd.DataFrame(values)
            
            if not df.empty:
                # Extract headers from first row
                headers = df.iloc[0] if any(isinstance(x, str) for x in df.iloc[0]) else [f"Column{i}" for i in range(len(df.columns))]
                
                
                unique_headers = []
                seen = {}
                for header in headers:
                    if header in seen:
                        seen[header] += 1
                        unique_headers.append(f"{header}_{seen[header]}")
                    else:
                        seen[header] = 0
                        unique_headers.append(header)
                
                # Set the unique headers
                df.columns = unique_headers
                
                # Remove header row if it was used
                df = df.iloc[1:] if any(isinstance(x, str) for x in values[0]) else df
                
                # Reset index to ensure proper serialization
                df = df.reset_index(drop=True)
            
            return {"data": df.to_dict('records')}
            
        except Exception as e:
            print(f"Error reading sheet: {e}")
            return {"error": f"Error reading sheet: {e}"}
    
    def update_cell(self, cell: str, value: any) -> bool:
        """Update specific cell in Excel with given value"""
        try:
            # Remove extra equal sign if present in formulas
            if isinstance(value, str) and value.startswith('='):
                value = value.replace('==', '=')
            
            self.active_sheet.range(cell).value = value
            return True
        except Exception as e:
            print(f"Error updating cell: {e}")
            return False
    
    def format_range(self, range_: str, format_type: str) -> bool:
        """Apply formatting to specified range"""
        try:
            range_obj = self.active_sheet.range(range_)
            format_type = format_type.upper()
            
            if format_type == "CURRENCY":
                range_obj.number_format = "$#,##0.00"
            elif format_type == "PERCENTAGE":
                range_obj.number_format = "0.00%"
            elif format_type == "NUMBER":
                range_obj.number_format = "#,##0.00"
            elif format_type == "DATE":
                range_obj.number_format = "mm/dd/yyyy"
            return True
        except Exception as e:
            print(f"Error formatting range: {e}")
            return False