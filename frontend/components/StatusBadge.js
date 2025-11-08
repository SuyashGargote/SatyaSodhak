import { CheckCircle2, XCircle, HelpCircle, Clock } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    verified: {
      icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      label: 'Verified'
    },
    disputed: {
      icon: <XCircle className="h-4 w-4 mr-1.5" />,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      label: 'Disputed'
    },
    outdated: {
      icon: <Clock className="h-4 w-4 mr-1.5" />,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      label: 'Outdated'
    },
    default: {
      icon: <HelpCircle className="h-4 w-4 mr-1.5" />,
      className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      label: 'Pending'
    }
  };

  const { icon, className, label } = statusConfig[status?.toLowerCase()] || statusConfig.default;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {icon}
      {label}
    </span>
  );
};

export default StatusBadge;
