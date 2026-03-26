import React from 'react';

const Skeleton = ({ className, height, width, circle }) => {
  return (
    <div
      className={`animate-pulse bg-zinc-200/60 rounded-xl ${className}`}
      style={{
        height: height || '100%',
        width: width || '100%',
        borderRadius: circle ? '9999px' : undefined,
      }}
    />
  );
};

export default Skeleton;
