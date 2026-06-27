import { useState, useMemo } from 'react';
import { Form, Input, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, WechatOutlined, QqOutlined, GithubOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Login.scss';

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Login:', values);
      message.success('登录成功！');
      navigate('/');
    } catch {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };
  const particles = useMemo(() => {
    const seed = 12345;
    const pseudoRandom = (index: number, offset: number) => {
      const x = Math.sin(seed + index * 13 + offset * 7) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${pseudoRandom(i, 0) * 100}%`,
      animationDuration: `${6 + pseudoRandom(i, 1) * 10}s`,
      animationDelay: `${pseudoRandom(i, 2) * 5}s`,
      size: `${2 + pseudoRandom(i, 3) * 4}px`,
    }));
  }, []);


  return (
    <div className="login-container">

      <div className="login-bg">
        <div className="grid-overlay" />
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />

      </div>
            {/* 做背景动画用 */}
      <div className="particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
      </div>

      <div className="login-card">
        <div className="scan-line" />

        <div className="login-header">
          <img src="/Police_Badge_of_China.svg" alt="公安警徽" className="logo-icon" />
          <h1>鼓楼分局巡防条线</h1>
          <p>智能预警系统 v1.0</p>
        </div>

        <Form
          className="login-form"
          onFinish={onFinish}
          initialValues={{ remember: true }}
          size="large"
        >
          <Form.Item
            className="form-item"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              className="input-wrapper"
              autoComplete='false'
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
            />
          </Form.Item>

          <Form.Item
            className="form-item"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              className="input-wrapper"
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item className="form-item">
            <div className="login-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="remember-me">记住密码</Checkbox>
              </Form.Item>
              <a className="forgot-link" href="#">忘记密码？</a>
            </div>
          </Form.Item>

          <Form.Item className="form-item">
            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? '登录中...' : '登 录'}
            </button>
          </Form.Item>
        </Form>

        <div className="divider-text">
          <span>其他登录方式</span>
        </div>

        <div className="social-login">
          <div className="social-btn"><WechatOutlined /></div>
          <div className="social-btn"><QqOutlined /></div>
          <div className="social-btn"><GithubOutlined /></div>
        </div>
      </div>
    </div>
  );
}
