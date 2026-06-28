import { useState, useMemo } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Modal, Descriptions, Button, Breadcrumb } from 'antd';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  FileOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

const { Header, Sider, Content } = Layout;

interface RouteConfig {
  path: string;
  label: string;
  icon?: ReactNode;
  children?: RouteConfig[];
}

const routeConfig: RouteConfig[] = [
  {
    path: '/',
    label: '首页',
    icon: <HomeOutlined />,
  },
  {
    path: '/dashboard',
    label: '仪表盘',
    icon: <DashboardOutlined />,
    children: [
      { path: '/dashboard/overview', label: '数据概览' },
      { path: '/dashboard/analysis', label: '统计分析' },
    ],
  },
  {
    path: '/user',
    label: '用户管理',
    icon: <TeamOutlined />,
    children: [
      { path: '/user/list', label: '用户列表' },
      { path: '/user/role', label: '角色管理', icon: <SafetyCertificateOutlined /> },
      { path: '/user/permission', label: '权限管理', icon: <LockOutlined /> },
    ],
  },
  {
    path: '/content',
    label: '内容管理',
    icon: <FileOutlined />,
    children: [
      { path: '/content/article', label: '文章管理' },
      { path: '/content/category', label: '分类管理' },
    ],
  },
  {
    path: '/report',
    label: '报表中心',
    icon: <BarChartOutlined />,
  },
  {
    path: '/setting',
    label: '系统设置',
    icon: <SettingOutlined />,
  },
];

const menuItems = routeConfig.map(item => ({
  key: item.path,
  icon: item.icon,
  label: item.label,
  children: item.children?.map(child => ({
    key: child.path,
    icon: child.icon,
    label: child.label,
  })),
}));

const userInfo = {
  name: '管理员',
  role: '系统管理员',
  department: '技术部',
  email: 'admin@example.com',
  phone: '138****8888',
};

function findRouteByPath(path: string): { parent: RouteConfig | null; current: RouteConfig | null } {
  for (const route of routeConfig) {
    if (route.path === path) {
      return { parent: null, current: route };
    }
    if (route.children) {
      for (const child of route.children) {
        if (child.path === path) {
          return { parent: route, current: child };
        }
      }
    }
  }
  return { parent: null, current: null };
}

export default function BasicLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKeys = useMemo(() => {
    const { parent, current } = findRouteByPath(location.pathname);
    if (current) return [current.path];
    if (parent) return [parent.path];
    return [location.pathname];
  }, [location.pathname]);

  const openKeys = useMemo(() => {
    const { parent } = findRouteByPath(location.pathname);
    if (parent) return [parent.path];
    return [];
  }, [location.pathname]);

  const breadcrumbItems = useMemo(() => {
    const { parent, current } = findRouteByPath(location.pathname);
    const items: { title: ReactNode }[] = [
      { title: <Link to="/"><HomeOutlined /> 首页</Link> },
    ];
    if (parent) {
      items.push({ title: <span>{parent.label}</span> });
    }
    if (current && current.path !== '/') {
      items.push({ title: <span>{current.label}</span> });
    }
    return items;
  }, [location.pathname]);

  const handleLogout = () => {
    Modal.confirm({
      title: '确认登出',
      content: '确定要退出登录吗？',
      cancelText: '取消',
      okText: '确认',
      onOk: () => {
        navigate('/login');
      },
    });
  };

  const handleUserAction = ({ key }: { key: string }) => {
    if (key === 'info') {
      setUserModalVisible(true);
    } else if (key === 'logout') {
      handleLogout();
    }
  };

  const userMenuItems = [
    {
      key: 'info',
      icon: <InfoCircleOutlined />,
      label: '个人信息',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    const route = routeConfig.find(r => r.path === key);
    if (route && !route.children) {
      navigate(key);
    }
  };

  const handleSubMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          padding: '0 24px',
          background: '#001529',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Space>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#fff', fontSize: 16 }}
          />
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
            Antd Admin
          </span>
        </Space>
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserAction }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: 'pointer', color: '#fff', marginRight: '10px' }}>
            <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
            <span>{userInfo.name}</span>
          </Space>
        </Dropdown>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          theme="dark"
          width={220}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            items={menuItems}
            onClick={({ key, keyPath }) => {
              if (keyPath.length > 1) {
                handleSubMenuClick({ key });
              } else {
                handleMenuClick({ key });
              }
            }}
          />
        </Sider>
        <Layout>
          <div style={{ padding: '12px 24px', background: '#f5f5f5', borderBottom: '1px solid #f0f0f0' }}>
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="个人信息"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUserModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="用户名">{userInfo.name}</Descriptions.Item>
          <Descriptions.Item label="角色">{userInfo.role}</Descriptions.Item>
          <Descriptions.Item label="部门">{userInfo.department}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{userInfo.email}</Descriptions.Item>
          <Descriptions.Item label="手机号">{userInfo.phone}</Descriptions.Item>
        </Descriptions>
      </Modal>
    </Layout>
  );
}
