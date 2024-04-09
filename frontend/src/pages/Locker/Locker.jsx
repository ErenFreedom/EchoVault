import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaFilePdf, FaFileImage, FaFileAlt } from 'react-icons/fa';
import { FaTrash, FaDownload } from 'react-icons/fa';

import './Locker.css';

const Locker = () => {
  const { lockerId, lockerName } = useParams();
  const fileInputRef = useRef(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);


  // Function to trigger the file input dialog
  const triggerFileUpload = () => fileInputRef.current.click();

  // Function to handle file upload to server
  // Inside your component

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('document', file);
  formData.append('lockerId', lockerId);

  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/locker/${lockerId}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 409) {
        const result = await response.json();
        alert(result.message); // Show the error message from the server
      } else {
        throw new Error('Failed to upload document');
      }
    } else {
      const data = await response.json();
      setRecentDocs(prevDocs => [data.document, ...prevDocs]);
      setAllDocs(prevDocs => [data.document, ...prevDocs]);
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Error uploading document: ' + error.message);
  }
};

  

  const handleDeleteSelected = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to delete the selected documents? This action cannot be undone.');
    if (!isConfirmed) return;

    // Call API to delete selected documents
    selectedDocs.forEach(async (docId) => {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/document/${docId}`, {
        method: 'DELETE',
      });
      // Optionally handle response
    });

    // Update state to remove deleted documents
    const updatedDocs = allDocs.filter(doc => !selectedDocs.has(doc._id));
    setAllDocs(updatedDocs);
    setSelectedDocs(new Set()); // Clear selection
  };

  const handleDelete = async (documentId, documentName) => {
  // Confirmation dialog
  const isConfirmed = window.confirm(`Are you sure you want to delete "${documentName}"? After deletion, your document will become irrecoverable.`);

  // If the user clicks "No", stop the function
  if (!isConfirmed) return;

  // Implement the logic to call your API to delete a document
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/document/${documentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete document');
    }

    // Refresh the documents list or remove the document from state
    setAllDocs(prevDocs => prevDocs.filter(doc => doc._id !== documentId));
    setRecentDocs(prevDocs => prevDocs.filter(doc => doc._id !== documentId));

    // If you want to show a notification or message
    console.log('Document deleted successfully.');

  } catch (error) {
    console.error('Delete error:', error);
    // If you have a mechanism to show user-facing messages or notifications, use it here
    alert('Error deleting document: ' + error.message);
  }
};


const handleDownload = async (documentId) => {
  const password = prompt("Enter your password to download this document:");
  if (!password) {
    alert("Password is required to download the document.");
    return;
  }

  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/documents/download/${documentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'X-Document-Password': password
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      // Set the download name for the file
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = documentId;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } else {
      const errorText = await response.text();
      alert(`Failed to download document: ${errorText}`);
    }
  } catch (error) {
    console.error('Download error:', error);
    alert('Error downloading document: ' + error.message);
  }
};





  const getIconForDocument = (fileName) => {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    switch (fileExtension) {
      case 'pdf':
        return <FaFilePdf className="document-icon pdf" />;
      case 'jpg':
      case 'jpeg':
        return <FaFileImage className="document-icon image" />;
      // You can add more cases for other file types here
      default:
        return <FaFileAlt className="document-icon other" />;
    }
  };
  const handleDocumentClick = (docId) => {
    const previewUrl = `${process.env.REACT_APP_BACKEND_URL}/api/documents/${docId}/preview`;
    window.open(previewUrl, '_blank');
  };
  
  



  // Fetch documents for the locker
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/locker/${lockerId}/documents`, {
          method: 'GET',
        });

        if (!response.ok) throw new Error('Failed to fetch documents');

        const data = await response.json();
        setAllDocs(data);

      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    if (lockerId) fetchDocuments();
  }, [lockerId]);

  // Effect to filter recent documents to show as recent for 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentDocs(current => current.filter(doc => new Date() - new Date(doc.uploadedAt) < 15 * 60 * 1000));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);



  // ...rest of the component logic


  return (
    <div className="locker-page">
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
      <div className="locker-header">
        <h1 className="locker-name">
          {lockerName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </h1>
        <div className="locker-actions">
          <button className="locker-button upload" onClick={triggerFileUpload}>Upload</button>
          {/* Additional buttons like Delete Selected and Download Selected can be conditionally rendered here based on selection */}
        </div>
      </div>
  
      {selectedDocs.size > 0 && (
        <div className="bulk-actions">
          <button
            className="locker-button delete-selected"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            Delete Selected ({selectedDocs.size})
          </button>
          {/* Similarly for bulk download if needed */}
        </div>
      )}
  
      {/* Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="delete-confirmation-dialog">
          Are you sure you want to delete the selected documents? This action cannot be undone.
          <button className="confirm-button" onClick={handleDeleteSelected}>Yes, Delete</button>
          <button className="cancel-button" onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
        </div>
      )}
  
      {/* Recently Uploaded Section */}
      <section className="recently-uploaded">
        <h2>Recently Uploaded</h2>
        <div className="documents-grid">
          {recentDocs.map(doc => (
            <div className="document-card" key={doc._id} onClick={() => handleDocumentClick(doc._id)}>
              {doc.thumbnailPath ? (
                <img src={`${process.env.REACT_APP_BACKEND_URL}${doc.thumbnailPath}`} alt="Document Thumbnail" className="document-thumbnail"/>
              ) : (
                getIconForDocument(doc.fileName) // This function returns an icon based on the document's file type
              )}
              <div className="document-details">
                <p>{doc.fileName}</p>
                {/* Individual document delete and download buttons */}
              </div>
            </div>
          ))}
        </div>
      </section>
  
      {/* All Documents Section */}
      <section className="all-documents">
        <h2>All Documents</h2>
        <div className="documents-grid">
          {allDocs.map(doc => (
            <div className="document-card" key={doc._id} onClick={() => handleDocumentClick(doc._id)}>
              {doc.thumbnailPath ? (
                <img src={`${process.env.REACT_APP_BACKEND_URL}${doc.thumbnailPath}`} alt="Document Thumbnail"/>
              ) : (
                getIconForDocument(doc.fileName) // Adjust according to the document type
              )}
              <div className="document-details">
                <p>{doc.fileName}</p>
                <button className="locker-button delete" onClick={(e) => {
                  e.stopPropagation(); // Prevent opening the document when clicking delete
                  handleDelete(doc._id, doc.fileName); // Now passing fileName for better user prompt
                }}><FaTrash /> {/* Icon for delete button */}</button>
                <button className="locker-button download" onClick={(e) => {
                  e.stopPropagation(); // Prevent opening the document when clicking download
                  handleDownload(doc._id);
                }}><FaDownload /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
  
  
  
};

export default Locker;