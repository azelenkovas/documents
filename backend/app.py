import logging.config
from fastapi import FastAPI, Request
from pydantic import BaseModel, Field
from typing import List, Dict
import os
import glob
from fastapi.responses import FileResponse
from pathlib import Path
import logging
import lorem
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

logging.basicConfig(level = logging.DEBUG)
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
    categorized_documents: Dict[str, str] = Field(..., example={'category1': 'document1.pdf'})
    uncategorized_documents: List[str] = Field(..., example=["/path/to/document"])

def base_url(request: Request):
    return str(request.base_url).replace('8000','3000')

def find_document(file_name: str) -> List[str]:
    return list(filter(lambda x: file_name in x, glob.glob(os.path.join(DOCUMENT_DIR, '**', '*.pdf'), recursive=True))) 

def to_document(base_url: str, file: str) -> Document:
    logging.debug(file)
    url, name = path_to_url(base_url, file)
    if 'uncategorized' in file:
        return Document(name = name, path=url, type="pdf")
    else:
        category=file.split('/')[-2]
        return CategorizedDocument(name = name, path=url, type="pdf", category=category)

def url_to_path(base_url: str, url: str) -> str:
    return url.replace(f'{base_url}documents', DOCUMENT_DIR)

def path_to_url(base_url: str, path: str) -> str:
    p = path.replace(DOCUMENT_DIR, f'{base_url}documents')
    _, name = os.path.split(path)
    return p, name

def pdfs(base_url: str, directory: str) -> DocumentStatus:
    categorized = {}
    uncategorized = []
    result = glob.glob(os.path.join(DOCUMENT_DIR, '**/*.pdf'), recursive=True)
    for file in result:
        d = to_document(base_url, file)
        if type(d) is CategorizedDocument:
            c = categorized.get(d.category)
            if not c:
                categorized[d.category] = [d]
            else:
                c.append(d)
        else:
            uncategorized.append(d)
    return DocumentStatus(categorized_documents=categorized, uncategorized_documents=uncategorized)

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/documentstatus")
def get_document_status(request: Request) -> DocumentStatus:
    return pdfs(base_url(request), DOCUMENT_DIR)
   

@app.get("/documents/{rest_of_path:path}", response_class=FileResponse)
def download_pdf(rest_of_path: str) -> FileResponse:
    _, name = os.path.split(rest_of_path)
    file = os.path.join(DOCUMENT_DIR, rest_of_path)
    return FileResponse(file, media_type="application/pdf", filename=name)

@app.post("/checks")
def checks(selected_documents: SelectedDocuments, request: Request) -> List[Check]:
    cs = []
    uds = list(map(lambda x: to_document(base_url(request), x), selected_documents.uncategorized_documents))
    for category, file_url in selected_documents.categorized_documents.items():
        doc_file = url_to_path(base_url(request), file_url)
        d = to_document(base_url(request), doc_file)
        c = Check(
            category=d.category,
            name=lorem.sentence(),
            categorized_document=d, 
            uncategorized_documents=uds, 
            markdown=lorem.paragraph())
        cs.append(c)
    return cs