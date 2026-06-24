import { Card, Statistic, Row, Col } from 'antd';
import { UserOutlined, FileOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function Home() {
  return (
    <>
      <h2>首页</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="用户数" value={1128} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="文件数" value={328} prefix={<FileOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="完成任务" value={96} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
