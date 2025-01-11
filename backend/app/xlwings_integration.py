import xlwings as xw

def read_excel():
    wb = xw.Book.caller()  # This attaches to the Excel instance
    sheet = wb.sheets[0]
    data = sheet.range('A1').value
    return data