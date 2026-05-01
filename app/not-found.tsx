import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--jnj-space-4)',
        background: 'var(--jnj-black)',
        color: 'var(--jnj-white)',
        padding: 'var(--jnj-space-6)',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--jnj-font-display)',
          fontSize: 'clamp(48px, 12vw, 96px)',
          margin: 0,
          letterSpacing: '-0.02em',
        }}
      >
        404
      </h1>
      <p style={{ color: 'var(--jnj-grey-400)', margin: 0 }}>
        페이지를 찾을 수 없습니다.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 'var(--jnj-space-3)',
          color: 'var(--jnj-white)',
          textDecoration: 'underline',
        }}
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
