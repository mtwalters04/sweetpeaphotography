import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose-journal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="font-serif text-t-36 leading-tight mt-16 mb-6">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-t-28 leading-tight mt-12 mb-4">{children}</h3>
          ),
          p: ({ children }) => <p className="text-t-18 leading-[1.6] mb-6">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              className="underline underline-offset-4 hover:text-accent"
              {...(href?.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 text-t-18 leading-[1.6] mb-6 space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 text-t-18 leading-[1.6] mb-6 space-y-2">
              {children}
            </ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent pl-6 italic text-t-22 my-10 text-ash">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-16 border-mist" />,
          code: ({ children }) => (
            <code className="bg-mist px-1.5 py-0.5 text-[0.95em] rounded-sm">{children}</code>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src as string} alt={alt ?? ''} className="my-12 w-full h-auto" />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
