from fastapi import FastAPI, Request
from pydantic import BaseModel, Field
from typing import List, Dict
import os
import glob

class Document(BaseModel):
    path: str = Field(..., example="/path/to/document")
    type: str = Field(..., example="pdf")
    
class CategorizedDocument(Document):
    category: str = Field(..., example="business")

class DocumentStatus(BaseModel):
    categorized_documents: Dict[str, List[CategorizedDocument]] = Field(..., example={'category1': []})
    uncategorized_documents: List[Document] = Field(..., example=[{"path": "/path/to/document"}])

class Check(BaseModel):
    categorized_document: Document = Field(..., example={"path": "/path/to/document", "type": "pdf", "category": "business"})
    uncategorized_documents: List[Document] = Field(..., example=[{"path": "/path/to/document1"}])
    markdown: str = Field(..., example="This is a markdown string")

def pdfs(base_url: str, directory: str) -> DocumentStatus:
    categorized = {}
    uncategorized = []
    result = glob.glob(os.path.join('/home/az/workspace/documents', '**/*.pdf'), recursive=True)
    for file in result:
        _, name = os.path.split(file)
        path = f'{base_url}doc/{name}'
        if 'uncategorized' in file:
            uncategorized.append(Document(path=path, type="pdf"))
        else:
            category=file.split('/')[-2]
            d = CategorizedDocument(path=path, type="pdf", category=category)
            c = categorized.get(category)
            if not c:
                categorized[category] = [d]
            else:
                categorized[category].append(d)
    return DocumentStatus(categorized_documents=categorized, uncategorized_documents=uncategorized)

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/documentstatus")
def get_document_status(request: Request) -> DocumentStatus:
    return pdfs(request.base_url, '/home/az/workspace/documents/backend/docs')
   