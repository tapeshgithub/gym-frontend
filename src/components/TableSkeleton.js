import React from 'react';

const SkeletonRow = () => (
  <tr>
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 rounded-lg shimmer-line" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

const TableSkeleton = ({ rows = 5 }) => (
  <>
    {[...Array(rows)].map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </>
);

export default TableSkeleton;
