import { Button, Card, Layout, Space, Typography } from "antd";

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

function App() {
  return (
    <Layout className="min-h-screen">
      <Header className="!h-auto border-b border-slate-200 !bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <Title level={4} className="!m-0">
            Attendance System
          </Title>
          <Space>
            <Button>Docs</Button>
            <Button type="primary">Login</Button>
          </Space>
        </div>
      </Header>

      <Content className="px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <Card className="shadow-sm">
            <Title level={2}>Frontend Base Ready</Title>
            <Paragraph className="!mb-2">
              Stack: React + Vite, Tailwind CSS, and Ant Design.
            </Paragraph>
            <Paragraph>
              Start editing <Text code>apps/frontend/src/App.jsx</Text> to build
              your pages.
            </Paragraph>

            <Space>
              <Button type="primary">Create attendance page</Button>
              <Button>View component guide</Button>
            </Space>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

export default App;
