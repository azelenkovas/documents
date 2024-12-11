from fastapi import FastAPI, Request
from pydantic import BaseModel, Field
from typing import List, Dict
import os
import glob
from fastapi.responses import FileResponse
from pathlib import Path
import logging
import lorem

DOCUMENT_DIR = './docs'

class Document(BaseModel):
    name: str = Field(..., example="document.pdf")
    path: str = Field(..., example="/path/to/document")
    type: str = Field(..., example="pdf")
    
class CategorizedDocument(Document):
    category: str = Field(..., example="business")

class DocumentStatus(BaseModel):
    categorized_documents: Dict[str, List[CategorizedDocument]] = Field(..., example={'category1': []})
    uncategorized_documents: List[Document] = Field(..., example=[{"path": "/path/to/document"}])

class Check(BaseModel):
    category: str = Field(... , example="business")
    name: str = Field(..., example="Check name")
    categorized_document: CategorizedDocument = Field(..., example={"path": "/path/to/document", "type": "pdf", "category": "business", "name": "document.pdf"})
    uncategorized_documents: List[Document] = Field(..., example=[{"path": "/path/to/document1", "name": "document1.pdf"}])
    markdown: str = Field(..., example="This is a markdown string")

class SelectedDocuments(BaseModel):
    categorized_documents: List[CategorizedDocument] = Field(..., example=[{"path": "/path/to/document", "type": "pdf", "category": "business", "name": "document.pdf"}])
    uncategorized_documents: List[Document] = Field(..., example=[{"path": "/path/to/document", "type": "pdf", "name": "document.pdf"}])

def pdfs(base_url: str, directory: str) -> DocumentStatus:
    categorized = {}
    uncategorized = []
    result = glob.glob(os.path.join(DOCUMENT_DIR, '**/*.pdf'), recursive=True)
    for file in result:
        _, name = os.path.split(file)
        path = f'{base_url}doc/{name}'
        if 'uncategorized' in file:
            uncategorized.append(Document(name = name, path=path, type="pdf"))
        else:
            category=file.split('/')[-2]
            d = CategorizedDocument(name = name, path=path, type="pdf", category=category)
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
    return pdfs(request.base_url, DOCUMENT_DIR)
   
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

@app.get("/documents/{file_name}", response_class=FileResponse)
def download_pdf(file_name: str) -> FileResponse:
    result = list(filter(lambda x: file_name in x, glob.glob(os.path.join(DOCUMENT_DIR, '**', '*.pdf'), recursive=True)))
    if not result:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(result[0], media_type="application/pdf", filename=file_name)

@app.post("/checks")
def checks(selected_documents: SelectedDocuments) -> List[Check]:
    cs = []
    for doc in selected_documents.categorized_documents:
        c = Check(
            category=doc.category,
            name=lorem.sentence(),
            categorized_document=doc, 
            uncategorized_documents=selected_documents.uncategorized_documents, 
            markdown=lorem.paragraph())
        cs.append(c)
    return cs