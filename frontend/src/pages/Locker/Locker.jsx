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
  const recentDocsStorageKey = `recentDocs_${lockerId}`;  
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');


  // Function to load documents from local storage
  const loadDocuments = key => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  // Function to save documents to local storage
  const saveDocuments = (docs, key) => {
    localStorage.setItem(key, JSON.stringify(docs));
  };
  
  


  // Function to trigger the file input dialog
  const triggerFileUpload = () => fileInputRef.current.click();

  

  useEffect(() => {
    const loadedRecentDocs = loadDocuments(recentDocsStorageKey).filter(doc => 
      new Date().getTime() - new Date(doc.uploadedAt).getTime() < 6 * 60 * 60 * 1000
    );

    const allDocsKey = `allDocs_${lockerId}`;  
    const loadedAllDocs = loadDocuments(allDocsKey);

    setAllDocs(loadedAllDocs);
    setRecentDocs(loadedRecentDocs);
  }, [lockerId, recentDocsStorageKey]);

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
        alert(result.message); 
      } else {
        throw new Error('Failed to upload document');
      }
    } else {
      const data = await response.json();
      const newDocument = {...data.document, uploadedAt: new Date().toISOString()};
      setRecentDocs(prevDocs => [data.document, ...prevDocs]);
      setAllDocs(prevDocs => [data.document, ...prevDocs]);
      setNotifMessage('Document successfully uploaded.');
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 5000);

      saveDocuments([newDocument, ...recentDocs], recentDocsStorageKey);
      saveDocuments([newDocument, ...allDocs], `allDocs_${lockerId}`);
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Error uploading document: ' + error.message);
  }
};

  

  const handleDeleteSelected = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete the selected documents? This action cannot be undone.');
    if (!isConfirmed) return;

    selectedDocs.forEach(async (docId) => {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/document/${docId}`, {
        method: 'DELETE',
      });
    });

    const updatedDocs = allDocs.filter(doc => !selectedDocs.has(doc._id));
    setAllDocs(updatedDocs);
    setSelectedDocs(new Set()); 
  };

  const handleDelete = async (documentId, documentName) => {
  const isConfirmed = window.confirm(`Are you sure you want to delete "${documentName}"? After deletion, your document will become irrecoverable.`);

  if (!isConfirmed) return;

  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/document/${documentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete document');
    }

    setAllDocs(prevDocs => prevDocs.filter(doc => doc._id !== documentId));
    setRecentDocs(prevDocs => prevDocs.filter(doc => doc._id !== documentId));

    setNotifMessage('Document successfully deleted.');
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 5000);

    console.log('Document deleted successfully.');

  } catch (error) {
    console.error('Delete error:', error);
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
      default:
        return <FaFileAlt className="document-icon other" />;
    }
  };
  const handleDocumentClick = (docId) => {
    const previewUrl = `${process.env.REACT_APP_BACKEND_URL}/api/documents/${docId}/preview`;
    window.open(previewUrl, '_blank');
  };
  
  



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

  useEffect(() => {
    const interval = setInterval(() => {
      setRecentDocs(current => current.filter(doc => new Date() - new Date(doc.uploadedAt) < 15 * 60 * 1000));
    }, 60000); 

    return () => clearInterval(interval);
  }, []);





  return (
    <div className="locker-page">
     {showNotif && (
      <div className="notification">
        <div className="notification-content">{notifMessage}</div>
        <div className="notification-timer" style={{ width: '100%' }}></div>
      </div>
    )}
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
                getIconForDocument(doc.fileName) 
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
                getIconForDocument(doc.fileName) 
              )}
              <div className="document-details">
                <p>{doc.fileName}</p>
                <button className="locker-button delete" onClick={(e) => {
                  e.stopPropagation(); 
                  handleDelete(doc._id, doc.fileName); 
                }}><FaTrash /> {/* Icon for delete button */}</button>
                <button className="locker-button download" onClick={(e) => {
                  e.stopPropagation(); 
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