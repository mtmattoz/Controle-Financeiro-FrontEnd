import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Campo de senha com botão de mostrar/ocultar. Repassa as props de acessibilidade do <Campo>. */
export default function CampoSenha({ value, onChange, autoComplete = 'current-password', ...props }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="campo-senha">
      <input
        {...props}
        type={visivel ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="campo-senha__botao"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visivel ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
