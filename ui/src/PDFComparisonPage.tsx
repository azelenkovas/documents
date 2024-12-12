import React, { useState } from "react";
import { Container, Row, Col, Button, ButtonGroup } from "react-bootstrap";
import { Document, Page } from "react-pdf";
import { useLocation } from "react-router-dom";
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.mjs'

interface Check {
  category: string;
  name: string;
  categorized_document: {
    name: string;
    path: string;
    type: string;
    category: string;
  };
  uncategorized_documents: {
    name: string;
    path: string;
    type: string;
  }[];
  markdown: string;
}

interface Props {
  checks: Check[];
}

const PDFComparisonPage = () => {
  const location = useLocation();
  const { checks } = location.state || {};
  const [selectedCheckIndex, setSelectedCheckIndex] = useState<number | null>(null);
  const [uncategorizedIndex, setUncategorizedIndex] = useState(0);
  
  const handleCheckSelect = (index: number) => {
    setSelectedCheckIndex(index);
    setUncategorizedIndex(0); // Reset uncategorized document index
  };

  const handleNextUncategorized = () => {
    if (selectedCheckIndex !== null) {
      setUncategorizedIndex((prev) =>
        (prev + 1) % checks[selectedCheckIndex].uncategorized_documents.length
      );
    }
  };

  const handlePrevUncategorized = () => {
    if (selectedCheckIndex !== null) {
      setUncategorizedIndex((prev) =>
        (prev - 1 + checks[selectedCheckIndex].uncategorized_documents.length) %
        checks[selectedCheckIndex].uncategorized_documents.length
      );
    }
  };

  const selectedCheck = selectedCheckIndex !== null ? checks[selectedCheckIndex] : null;
  const selectedUncategorizedDocument =
    selectedCheck && selectedCheck.uncategorized_documents[uncategorizedIndex];

  return (
    <Container fluid>
      <Row>
        {/* Left Column */}
        <Col md={2} className="bg-light border-right vh-100">
          {checks.map((check: Check, index: number) => (
            <Button
              key={index}
              className="w-100 mb-2"
              onClick={() => handleCheckSelect(index)}
              variant={selectedCheckIndex === index ? "primary" : "outline-primary"}
            >
              <span>{check.name}</span>
            </Button>
          ))}
        </Col>

        {/* Right Column */}
        <Col md={10} className="p-4">
          {selectedCheck && (
            <>
              <Row>
                {/* Categorized Document */}
                <Col md={6} className="border">
                  <Row><h5>Categorized Document</h5></Row>
                  <Row>
                    <Col className="pdf-wrapper" style={{ maxHeight: '60vh', overflow: 'auto' }}>
                      <Document file={selectedCheck.categorized_document.path} loading={<div>Loading PDF...</div>}>
                        <Page pageNumber={1} />
                      </Document>
                    </Col>
                  </Row>
                </Col>

                {/* Uncategorized Document */}
                <Col md={6} className="border">
                  <Row>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Button onClick={handlePrevUncategorized} variant="secondary">&lt;</Button>
                      <h5>Uncategorized Document</h5>
                      <Button onClick={handleNextUncategorized} variant="secondary">&gt;</Button>
                    </div>
                  </Row>
                  <Row>
                    {selectedUncategorizedDocument && (
                      <div className="pdf-wrapper" style={{ maxHeight: '60vh', overflow: 'auto' }}>

                        <Document className="pdf-wrapper" file={selectedUncategorizedDocument.path} loading={<div>Loading PDF...</div>}>
                          <Page pageNumber={1} />
                        </Document>
                      </div>
                    )}
                  </Row>
                </Col>
              </Row>

              {/* Markdown Section */}
              <Row className="mt-4">
                <Col>
                  <h5>Check Details</h5>
                  <div className="p-3 bg-light border rounded">
                    <pre>{selectedCheck.markdown}</pre>
                  </div>
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PDFComparisonPage;
