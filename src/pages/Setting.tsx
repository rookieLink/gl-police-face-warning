import { Form, Input, Switch, Button, Card } from 'antd';

export default function Setting() {
  const onFinish = (values: Record<string, unknown>) => {
    console.log('Received values:', values);
  };

  return (
    <>
      <h2>系统设置</h2>
      <Card style={{ maxWidth: 500 }}>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ siteName: 'Antd Demo', enabled: true }}>
          <Form.Item label="站点名称" name="siteName">
            <Input />
          </Form.Item>
          <Form.Item label="启用通知" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">保存</Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
