
import React from 'react';
import { FileStatus } from '../types';

interface StatusBadgeProps {
  status: FileStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    [FileStatus.IDLE]: { label: 'Ready', class: 'bg-zinc-800 text-zinc-400' },
    [FileStatus.UPLOADING]: { label: 'Uploading', class: 'bg-blue-500/10 text-blue-500 status-shimmer' },
    [FileStatus.UPLOADED]: { label: 'Ready for conversion', class: 'bg-indigo-500/10 text-indigo-400' },
    [FileStatus.CONVERTING]: { label: 'Processing', class: 'bg-purple-500/10 text-purple-400 status-shimmer' },
    [FileStatus.COMPLETED]: { label: 'Converted', class: 'bg-green-500/10 text-green-500' },
    [FileStatus.ERROR]: { label: 'Failed', class: 'bg-red-500/10 text-red-400' },
  };

  const { label, class: className } = config[status];

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
