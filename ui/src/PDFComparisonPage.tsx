import React, { useState } from "react";
import { Container, Row, Col, Button, ButtonGroup } from "react-bootstrap";
import { Document, Page } from "react-pdf";

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

const PDFComparisonPage: React.FC<Props> = ({ checks }) => {
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
          {checks.map((check, index) => (
            <Button
              key={index}
              className="w-100 mb-2"
              onClick={() => handleCheckSelect(index)}
              variant={selectedCheckIndex === index ? "primary" : "outline-primary"}
            >
              {check.name}
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
                  <h5>Categorized Document</h5>
                  <Document file={selectedCheck.categorized_document.path} loading={<div>Loading PDF...</div>}>
                    <Page pageNumber={1} />
                  </Document>
                </Col>

                {/* Uncategorized Document */}
                <Col md={6} className="border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Button onClick={handlePrevUncategorized} variant="secondary">&lt;</Button>
                    <h5>Uncategorized Document</h5>
                    <Button onClick={handleNextUncategorized} variant="secondary">&gt;</Button>
                  </div>
                  {selectedUncategorizedDocument && (
                    <Document file={selectedUncategorizedDocument.path} loading={<div>Loading PDF...</div>}>
                      <Page pageNumber={1} />
                    </Document>
                  )}
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
