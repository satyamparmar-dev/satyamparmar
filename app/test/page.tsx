import Layout from '@/components/Layout';
import NewsletterSignup from '@/components/NewsletterSignup';
import ContactForm from '@/components/ContactForm';

export default function TestPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🧪 Test Your Forms
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Test your newsletter and contact forms here
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Newsletter Test */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Newsletter Test
              </h2>
              <NewsletterSignup />
            </div>

            {/* Contact Form Test */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Form Test
              </h2>
              <ContactForm />
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/setup"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              🔧 Setup Email Services
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
