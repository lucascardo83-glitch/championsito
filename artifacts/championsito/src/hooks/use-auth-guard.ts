import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export function useAuthGuard() {
  const token = localStorage.getItem('championsito_admin_token');
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!token) {
      setLocation('/admin');
    }
  }, [token, setLocation]);

  return !!token;
}
