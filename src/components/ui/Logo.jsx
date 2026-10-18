export default function Logo({ compacto = false }) {
  return (
    <div className={`logo ${compacto ? 'logo--compacto' : ''}`}>
      <span className="logo__marca" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="32" height="32">
          <rect width="32" height="32" rx="9" fill="currentColor" />
          <path d="M8 21l5-5 4 3 7-8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="11" r="2" fill="#fff" />
        </svg>
      </span>
      {!compacto && (
        <span className="logo__texto">
          <strong>Controle Financeiro</strong>
          <small>Inteligente</small>
        </span>
      )}
    </div>
  );
}
