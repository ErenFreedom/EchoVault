import React from 'react';
import { useParams } from 'react-router-dom';
import './Locker.css';

const Locker = () => {
  const { lockerName } = useParams();

  // Example placeholders for recently uploaded documents
  const recentDocs = [
    { id: 1, name: 'Recent Document 1' },
    { id: 2, name: 'Recent Document 2' },
    // ... more placeholders
  ];

  // Example placeholders for all documents
  const allDocs = [
    { id: 3, name: 'Document 1' },
    { id: 4, name: 'Document 2' },
    // ... more placeholders
  ];

  return (
    <div className="locker-page">
      {/* Convert the locker name to title case and replace hyphens with spaces */}
      <h1 className="locker-name">{lockerName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Locker'}</h1>
      
      <section className="recently-uploaded">
        <h2>Recently Uploaded</h2>
        <div className="documents-grid">
          {recentDocs.map((doc) => (
            <div className="document-card" key={doc.id}>
              <p>{doc.name}</p>
              {/* Add more details here if needed */}
            </div>
          ))}
        </div>
      </section>

      <section className="all-documents">
        <h2>Documents</h2>
        <div className="documents-grid">
          {allDocs.map((doc) => (
            <div className="document-card" key={doc.id}>
              <p>{doc.name}</p>
              {/* Add more details here if needed */}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Locker;
