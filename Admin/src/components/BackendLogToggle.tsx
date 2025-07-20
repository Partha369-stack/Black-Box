import React, { useEffect, useRef } from 'react';

interface BackendLogDrawerProps {
  open: boolean;
  onClose: () => void;
}

const drawerStyle: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  bottom: 0,
  width: '100vw',
  height: '320px',
  background: '#18181b',
  color: '#0f0',
  fontFamily: 'Fira Mono, monospace',
  fontSize: '14px',
  borderTop: '2px solid #333',
  boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
  zIndex: 1000,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#232326',
  borderBottom: '1px solid #333',
  padding: '0.5em 1em',
  color: '#fff',
  fontWeight: 600,
};

const preStyle: React.CSSProperties = {
  margin: 0,
  background: 'none',
  color: 'inherit',
  padding: '1em',
  flex: 1,
  overflow: 'auto',
  maxHeight: 'calc(100% - 48px)',
};

const BackendLogDrawer: React.FC<BackendLogDrawerProps> = ({ open, onClose }) => {
  const [logs, setLogs] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const text = await res.text();
      setLogs(text);
    } catch (err) {
      setLogs('Failed to fetch logs.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
      intervalRef.current = setInterval(fetchLogs, 2000); // Poll every 2s
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line
  }, [open]);

  if (!open) return null;

  return (
    <div style={drawerStyle}>
      <div style={headerStyle}>
        <span>Backend Console Log</span>
        <button onClick={onClose} style={{background: '#333', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 12px', cursor: 'pointer', fontWeight: 700}}>Close</button>
      </div>
      <pre style={preStyle}>{loading ? 'Loading...' : logs}</pre>
    </div>
  );
};

export default BackendLogDrawer; 