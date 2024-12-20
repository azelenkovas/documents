import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const DocumentSelector = () => {
  interface Document {
    path: string;
    type: string;
  }

  interface CategorizedDocument extends Document { 
    category: string;
  }

  interface Data {
    categorized_documents: { [key: string]: CategorizedDocument[] };
    uncategorized_documents: Document[];
  }
  const navigate = useNavigate();
  const [data, setData] = useState<Data | null>(null);
   const [selectedDocs, setSelectedDocs] = useState<{
    categorized: { [key: string]: string };
    uncategorized: string[];
  }>({
    categorized: {},
    uncategorized: [],
  });

  useEffect(() => {
    // Fetch the JSON data from the API
    fetch("/documentstatus") // Replace with the actual API endpoint
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleRadioChange = (category: string, path: string) => {
    setSelectedDocs((prev) => ({
      ...prev,
      categorized: {
        ...prev.categorized,
        [category]: path,
      },
    }));
  };

  const handleCheckboxChange = (path: string) => {
    setSelectedDocs((prev) => {
      const isSelected = prev.uncategorized.includes(path);
      return {
        ...prev,
        uncategorized: isSelected
          ? prev.uncategorized.filter((p) => p !== path)
          : [...prev.uncategorized, path],
      };
    });
  };

  const handleSubmit = () => {
    console.log("Selected Documents:", selectedDocs);
    let s = {
      categorized_documents: selectedDocs.categorized,
      uncategorized_documents: selectedDocs.uncategorized
    }
    const request: RequestInfo = new Request('/checks', {
      // We need to set the `method` to `POST` and assign the headers
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Convert the user object to JSON and pass it as the body
      body: JSON.stringify(s)
    })
  
    // Send the request and print the response
    return fetch(request)
      .then((response) => response.json())
      .then((json) => {
        navigate('/pdf-comparison', { state: { checks: json } });
      })
      .then(() => console.log("Checks submitted successfully!"))
      .catch((error) => console.error("Error submitting checks:", error));

  };

  if (!data) return <div>Loading...</div>;

  return (
    <Container>
      <h1 className="my-4">Document Selector</h1>

      {/* Categorized Documents */}
      {Object.entries(data.categorized_documents).map(([category, documents]) => (
        <Row key={category} className="mb-4">
          <Col>
            <h2>{category}</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Path</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.path}>
                    <td>
                      <Form.Check
                        type="radio"
                        name={`radio-${category}`}
                        value={doc.path}
                        checked={selectedDocs.categorized[category] === doc.path}
                        onChange={() => handleRadioChange(category, doc.path)}
                      />
                    </td>
                    <td>{doc.path}</td>
                    <td>{doc.type}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      ))}

      {/* Uncategorized Documents */}
      <Row className="mb-4">
        <Col>
          <h2>Uncategorized Documents</h2>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Select</th>
                <th>Path</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {data.uncategorized_documents.map((doc) => (
                <tr key={doc.path}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      value={doc.path}
                      checked={selectedDocs.uncategorized.includes(doc.path)}
                      onChange={() => handleCheckboxChange(doc.path)}
                    />
                  </td>
                  <td>{doc.path}</td>
                  <td>{doc.type}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row>
        <Col className="text-center">
          <Button variant="primary" onClick={handleSubmit}>
            Submit Selections
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default DocumentSelector;
