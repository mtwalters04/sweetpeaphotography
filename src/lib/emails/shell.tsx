// Shared email shell. Inline styles, conservative HTML, mail-client friendly.
// Mirrors the public site palette without depending on web fonts.

const colors = {
  ink: '#1a1716',
  bone: '#f4efe9',
  vellum: '#ece4d9',
  mist: '#e6dfd6',
  ash: '#7a716a',
  accent: '#8a6f5a',
};

const wrap: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: colors.bone,
  fontFamily: 'Georgia, "Iowan Old Style", "Palatino Linotype", serif',
  color: colors.ink,
  WebkitTextSizeAdjust: 'none',
};

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '48px 32px',
};

export function EmailShell({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{preview}</title>
      </head>
      <body style={wrap}>
        {/* Preheader */}
        <div
          style={{
            display: 'none',
            overflow: 'hidden',
            lineHeight: 0,
            opacity: 0,
            visibility: 'hidden',
          }}
        >
          {preview}
        </div>
        <div style={container}>
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: colors.ash,
              marginBottom: '40px',
            }}
          >
            Sweet Pea Photography
          </div>
          {children}
          <hr
            style={{
              border: 'none',
              borderTop: `1px solid ${colors.mist}`,
              margin: '40px 0 24px',
            }}
          />
          <p
            style={{
              fontSize: '11px',
              color: colors.ash,
              lineHeight: '1.6',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            Sweet Pea Photography · By appointment.
          </p>
        </div>
      </body>
    </html>
  );
}

export const emailColors = colors;

export const styles = {
  h1: {
    fontSize: '32px',
    lineHeight: 1.15,
    margin: '0 0 16px',
    fontWeight: 400,
    color: colors.ink,
  } as React.CSSProperties,
  h2: {
    fontSize: '20px',
    lineHeight: 1.3,
    margin: '32px 0 12px',
    fontWeight: 500,
    color: colors.ink,
  } as React.CSSProperties,
  body: {
    fontSize: '16px',
    lineHeight: 1.65,
    margin: '0 0 16px',
    color: colors.ink,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  meta: {
    fontSize: '13px',
    lineHeight: 1.6,
    margin: '0 0 8px',
    color: colors.ash,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  card: {
    backgroundColor: colors.vellum,
    padding: '20px 24px',
    margin: '24px 0',
    border: `1px solid ${colors.mist}`,
  } as React.CSSProperties,
  button: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: colors.ink,
    color: colors.bone,
    textDecoration: 'none',
    fontSize: '13px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,
  link: {
    color: colors.accent,
    textDecoration: 'underline',
  } as React.CSSProperties,
};
