import { useEffect, useState } from 'react';

const oathLines = [
  '对党忠诚',
  '服务人民',
  '执法公正',
  '纪律严明',
];

export default function Home() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        background: 'linear-gradient(135deg, #0c1426 0%, #1a2a4a 50%, #0c1426 100%)',
        borderRadius: 12,
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 装饰光效 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(24,144,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* 标题 */}
      {/* <div
        style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: 12,
          marginBottom: 40,
          fontWeight: 300,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.8s ease',
        }}
      >
        全心全意为人民服务
      </div> */}

      {/* 誓词内容 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {oathLines.map((line, index) => (
          <div
            key={line}
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: 16,
              textShadow: '0 0 40px rgba(24,144,255,0.4), 0 2px 8px rgba(0,0,0,0.3)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
              transition: `all 0.8s ease ${index * 0.2}s`,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* 底部装饰线 */}
      <div
        style={{
          width: 200,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(24,144,255,0.6), transparent)',
          marginTop: 50,
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.2s ease 1s',
        }}
      />

      {/* 底部文字 */}
      <div
        style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: 6,
          marginTop: 20,
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.2s ease 1.2s',
        }}
      >
        专业 · 机制 · 大数据
      </div>
    </div>
  );
}
