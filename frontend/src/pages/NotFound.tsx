import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button.js';
import { Home, ShoppingBag } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <span className="text-7xl sm:text-9xl font-black text-indigo-600/20 dark:text-indigo-400/20 select-none">
        404
      </span>
      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white -mt-6 sm:-mt-10">
        Oops! Page not found.
      </h1>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-md">
        The page you are looking for might have been moved, renamed, or is temporarily unavailable.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link to="/">
          <Button size="md" className="gap-2 w-full sm:w-auto">
            <Home className="h-4 w-4" /> Go Home
          </Button>
        </Link>
        <Link to="/shop">
          <Button size="md" variant="outline" className="gap-2 w-full sm:w-auto">
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
