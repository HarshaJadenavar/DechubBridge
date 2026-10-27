import { ReactNode } from 'react';

interface ActionButtonProps {
  children:  ReactNode;
  onClick:   () => void | Promise<void>;   // accepts both sync and async
  loading?:  boolean;
  disabled?: boolean;
  type?:     'button' | 'submit' | 'reset';
  className?: string;
}

export default function ActionButton({
  children,
  onClick,
  loading   = false,
  disabled  = false,
  type      = 'button',
  className = '',
}: ActionButtonProps) {
  const isDisabled = loading || disabled;

  const handleClick = () => {
    if (isDisabled) return;
    // Swallow the Promise — button handlers must be void
    void onClick();
  };

  return (
    <button
      type={type}
      className={`btn-primary ${className}`.trim()}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
    >
      {loading ? (
        <>
          <span
            className="spinner"
            aria-hidden="true"
            style={{
              width:           16,
              height:          16,
              border:          '2px solid rgba(255,255,255,0.3)',
              borderTopColor:  'white',
              borderRadius:    '50%',
              display:         'inline-block',
              animation:       'spin 0.6s linear infinite',
              flexShrink:      0,
            }}
          />
          Processing…
        </>
      ) : (
        children
      )}
    </button>
  );
}