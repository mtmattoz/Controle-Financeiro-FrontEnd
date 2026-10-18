import { useId, cloneElement, isValidElement } from 'react';

/** Rótulo + campo + mensagem de erro, com ligação acessível entre eles. */
export default function Campo({ rotulo, erro, dica, children, className = '' }) {
  const id = useId();
  const idMensagem = `${id}-msg`;
  const filho = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-invalid': erro ? true : undefined,
        'aria-describedby': erro || dica ? idMensagem : undefined,
      })
    : children;

  return (
    <div className={`campo ${erro ? 'campo--erro' : ''} ${className}`}>
      <label htmlFor={id}>{rotulo}</label>
      {filho}
      {(erro || dica) && (
        <span id={idMensagem} className={erro ? 'campo__erro' : 'campo__dica'}>
          {erro || dica}
        </span>
      )}
    </div>
  );
}
