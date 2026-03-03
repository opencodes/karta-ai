import { Link } from 'react-router-dom';

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <Link to="/" className="brand-link" aria-label="Karta home">
      <span className="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img" focusable="false">
          <path d="M13 2 4 14h6l-1 8 11-12h-6l1-8Z" fill="currentColor" />
        </svg>
      </span>
      <span className="brand-text">KARTA AI</span>
      {compact ? <span className="sr-only">Karta AI</span> : null}
    </Link>
  );
}
