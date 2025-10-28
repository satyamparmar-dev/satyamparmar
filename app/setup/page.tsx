import Layout from '@/components/Layout';
import EmailServiceSetup from '@/components/EmailServiceSetup';

export default function SetupPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <EmailServiceSetup />
      </div>
    </Layout>
  );
}
