'use client';

import { useEffect, useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Accordion */}
      <div className="lg:hidden mb-6 print:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
          aria-expanded={isOpen}
          aria-controls="mobile-toc"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-thy-gray" aria-hidden="true" />
            <span className="font-semibold text-thy-gray">İçindekiler</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-thy-gray transition-transform ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {isOpen && (
          <div id="mobile-toc" className="mt-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`
                      text-left w-full text-sm transition-colors py-1
                      ${item.level === 2 ? 'pl-0' : 'pl-4'}
                      ${
                        activeId === item.id
                          ? 'text-thy-red font-medium border-l-2 border-thy-red pl-2'
                          : 'text-gray-600 hover:text-thy-gray'
                      }
                    `}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Desktop Sticky TOC */}
      <nav className="hidden lg:block sticky top-24 self-start print:hidden" aria-label="Sayfa içeriği">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-thy-gray" aria-hidden="true" />
            <h3 className="font-semibold text-thy-gray">İçindekiler</h3>
          </div>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    text-left w-full text-sm transition-all py-1
                    ${item.level === 2 ? 'pl-0' : 'pl-4'}
                    ${
                      activeId === item.id
                        ? 'text-thy-red font-medium border-l-2 border-thy-red pl-2'
                        : 'text-gray-600 hover:text-thy-gray'
                    }
                  `}
                  aria-current={activeId === item.id ? 'location' : undefined}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

