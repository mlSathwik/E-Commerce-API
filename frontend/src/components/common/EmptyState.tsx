import React from 'react';
import { Button } from './Button.js';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center sm:p-12 my-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mb-5 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400 mb-6">{description}</p>
      {actionText && (
        actionLink ? (
          <Link to={actionLink}>
            <Button size="md">{actionText}</Button>
          </Link>
        ) : (
          <Button onClick={onAction} size="md">
            {actionText}
          </Button>
        )
      )}
    </div>
  );
};
