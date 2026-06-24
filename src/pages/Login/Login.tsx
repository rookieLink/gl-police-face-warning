import { useState } from 'react';
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

  return (
    <div className="login-container">
      <div className="login-bg">
        <div className="grid-overlay" />
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
      </div>

      <div className="login-card">
        <div className="scan-line" />

        <div className="login-header">
          <div className="logo-icon">⚡</div>
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
