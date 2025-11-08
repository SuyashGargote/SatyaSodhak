import { Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load StatusBadge
const StatusBadge = dynamic(() => import('./StatusBadge'), { ssr: false });

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

const VerificationItem = ({ item, onViewDetails }) => {
  return (
    <li className="hover:bg-muted/30 transition-colors border-b border-border last:border-0">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusBadge status={item.status} />
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(item.created_at || item.submittedAt)}
            </span>
          </div>
          <button
            onClick={() => onViewDetails(item.id)}
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center"
          >
            View details
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {item.claim || 'No title'}
          </p>
        </div>
        {item.explanation && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {item.explanation}
          </p>
        )}
      </div>
    </li>
  );
};

export default VerificationItem;
