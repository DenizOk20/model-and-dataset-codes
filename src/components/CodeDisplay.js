import React, { useState, useEffect } from 'react';

const CodeDisplay = ({ fileName }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/src/dataset/${fileName}`);
        if (!response.ok) {
          throw new Error('Failed to load code');
        }
        const text = await response.text();
        setCode(text);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (fileName) {
      fetchCode();
    }
  }, [fileName]);

  if (loading) {
    return <div className="code-preview">Loading code...</div>;
  }

  if (error) {
    return <div className="code-preview error">Error loading code: {error}</div>;
  }

  return (
    <pre className="code-preview">
      <code>{code}</code>
    </pre>
  );
};

export default CodeDisplay; 