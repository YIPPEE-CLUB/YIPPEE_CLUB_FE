import { useLayoutEffect } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import {
  backOffset,
  readNavigation,
  recordNavigation,
} from '../lib/navigation';

export function NavigationHistory() {
  const location = useLocation();
  const action = useNavigationType();
  useLayoutEffect(() => {
    const index = window.history.state?.idx;
    if (Number.isInteger(index))
      recordNavigation(
        index,
        { key: location.key, path: location.pathname + location.search },
        action,
      );
  }, [location.key, location.pathname, location.search, action]);
  return null;
}

export function useBack(fallback = '/') {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    const offset = backOffset(readNavigation(), window.history.state?.idx, {
      key: location.key,
      path: location.pathname + location.search,
    });
    if (offset !== null) navigate(offset);
    else navigate(fallback, { replace: true });
  };
}
