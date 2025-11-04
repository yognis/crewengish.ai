'use client';

import { Download } from 'lucide-react';

interface PDFDownloadButtonProps {
  title: string;
}

export default function PDFDownloadButton({ title }: PDFDownloadButtonProps) {
  const handleDownload = () => {
    window.print();
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-thy-gray hover:bg-gray-50 hover:border-thy-red hover:text-thy-red transition-colors print:hidden"
      aria-label={`${title} sayfasını PDF olarak indir`}
      type="button"
    >
      <Download className="w-4 h-4" aria-hidden="true" />
      <span>PDF İndir</span>
    </button>
  );
}

