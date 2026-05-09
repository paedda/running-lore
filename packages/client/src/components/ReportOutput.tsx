import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ReportResponse } from '@running-lore/shared';
import './ReportOutput.css';

interface ReportOutputProps {
  result: ReportResponse;
}

export function ReportOutput({ result }: ReportOutputProps) {
  const [copied, setCopied] = useState(false);

  const fullMarkdown = `# ${result.title}\n\n${result.report}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card report-output">
      <div className="report-header">
        <h2 className="card-title" style={{ marginBottom: 0 }}>Your Report</h2>
        <button className="btn-copy" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Markdown'}
        </button>
      </div>
      <h3 className="report-title">{result.title}</h3>
      <div className="report-body">
        <ReactMarkdown>{result.report}</ReactMarkdown>
      </div>
    </div>
  );
}
