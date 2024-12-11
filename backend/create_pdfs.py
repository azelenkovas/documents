import sys
import lorem
from reportlab.pdfgen.canvas import Canvas

n = 10
file_prefix = sys.argv[1]
if len(sys.argv) == 3:
    n = int(sys.argv[2])

def create_pdf(prefix: str, n: int):
    for i in range(n):
        name = f'{prefix}_{i}.pdf'
        canvas = Canvas(name, pagesize=(612.0, 792.0))        
        canvas.setFont("Times-Roman", 18)
        canvas.drawString(72, 720, name)
        canvas.setFont("Times-Roman", 12)
        for i in range(8):
            canvas.drawString(72, 648 - 72 * i, lorem.sentence())
        canvas.save()



create_pdf(file_prefix, n)