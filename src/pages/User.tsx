import { Table, Button, Space } from 'antd';

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age' },
  { title: '地址', dataIndex: 'address', key: 'address' },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <Space>
        <Button type="link" size="small">编辑</Button>
        <Button type="link" danger size="small">删除</Button>
      </Space>
    ),
  },
];

const data = [
  { key: '1', name: '张三', age: 32, address: '北京市' },
  { key: '2', name: '李四', age: 42, address: '上海市' },
  { key: '3', name: '王五', age: 28, address: '广州市' },
];

export default function User() {
  return (
    <>
      <h2>用户管理</h2>
      <Table columns={columns} dataSource={data} />
    </>
  );
}
