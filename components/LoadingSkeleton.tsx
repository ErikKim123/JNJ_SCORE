// Design Ref: §7 — neutral skeleton using grey-100/200, no shadows.

import * as React from 'react';

type SkeletonProps = {
  count?: number;
  height?: number;
  radius?: string;
};

export function LoadingSkeleton({
  count = 6,
  height = 64,
  radius = 'var(--jnj-radius-pill)',
}: SkeletonProps): React.ReactElement {
  return (
    <>
      <style>{SKELETON_KEYFRAMES}</style>
      <div
        style={{
          display: 'grid',
          gap: 'var(--jnj-space-3)',
          width: '100%',
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            aria-hidden
            style={{
              height,
              borderRadius: radius,
              background:
                'linear-gradient(90deg, var(--jnj-grey-100) 0%, var(--jnj-grey-200) 50%, var(--jnj-grey-100) 100%)',
              backgroundSize: '200% 100%',
              animation: 'jnj-skeleton 1.4s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    </>
  );
}

const SKELETON_KEYFRAMES = `
@keyframes jnj-skeleton {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;
