import { useEffect, useRef, useState } from 'react';
import { BellIcon, UserIcon } from './Icons';

interface UserMenuProps {
  userName: string;
  onLogout: () => void;
  onNotifications: () => void;
}

export default function UserMenu({ userName, onLogout, onNotifications }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!open) return;
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        type="button"
        className="user-menu-button user-menu-bell"
        onClick={onNotifications}
        aria-label="View notifications"
      >
        <BellIcon />
      </button>

      <button
        type="button"
        className="user-menu-button user-menu-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open profile menu"
      >
        <UserIcon />
      </button>

      {open ? (
        <div className="user-menu-panel" role="menu">
          <div className="user-menu-identity">
            Signed in as <strong>{userName}</strong>
          </div>
          <button
            type="button"
            className="user-menu-item"
            onClick={onLogout}
            role="menuitem"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
