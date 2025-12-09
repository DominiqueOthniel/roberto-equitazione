'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function UserAccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setUserName(userData?.name || 'Utente');
      } catch (error) {
        setIsAuthenticated(false);
      }
    }

    const handleClickOutside = (event) => {
      if (menuRef?.current && !menuRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsOpen(false);
    window.location.href = '/';
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/user-dashboard',
      icon: 'HomeIcon',
    },
    {
      label: 'Cronologia Ordini',
      href: '/order-history',
      icon: 'ClipboardListIcon',
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 p-2 rounded-md transition-fast hover:bg-muted group"
        aria-label="Account menu"
        aria-expanded={isOpen}
      >
        <Icon
          name="UserCircleIcon"
          size={24}
          variant="outline"
          className="text-text-primary group-hover:text-primary transition-fast"
        />
        <span className="hidden md:inline text-text-primary group-hover:text-primary font-body text-sm transition-fast">
          {isAuthenticated ? userName : 'Account'}
        </span>
        <Icon
          name="ChevronDownIcon"
          size={16}
          variant="outline"
          className={`hidden md:inline text-text-secondary transition-base ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-md shadow-dropdown overflow-hidden z-200">
          {isAuthenticated ? (
            <>
              <div className="px-4 py-3 border-b border-border bg-muted">
                <p className="text-sm font-body font-semibold text-text-primary">
                  {userName}
                </p>
                <p className="text-xs font-caption text-text-secondary mt-0.5">
                  Benvenuto
                </p>
              </div>
              <nav className="py-2">
                {menuItems?.map((item) => (
                  <Link
                    key={item?.href}
                    href={item?.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-text-primary font-body text-sm transition-fast hover:bg-muted hover:text-primary"
                  >
                    <Icon name={item?.icon} size={18} variant="outline" />
                    <span>{item?.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="border-t border-border py-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-error font-body text-sm transition-fast hover:bg-muted"
                >
                  <Icon name="LogoutIcon" size={18} variant="outline" />
                  <span>Esci</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-2">
              <Link
                href="/user-dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-text-primary font-body text-sm transition-fast hover:bg-muted hover:text-primary"
              >
                <Icon name="LoginIcon" size={18} variant="outline" />
                <span>Accedi</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}