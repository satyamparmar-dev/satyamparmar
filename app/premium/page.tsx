import { Metadata } from 'next';
import Link from 'next/link';
import { SAMPLE_PREMIUM_CONTENT } from '@/lib/premium';
import PremiumContent from '@/components/PremiumContent';

export const metadata: Metadata = {
  title: 'Premium Content',
  description: 'Access exclusive premium and VIP content on backend engineering, AI, and tech innovations.',
};

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Premium Content
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Access exclusive articles, tutorials, and insights that are only available to our premium subscribers.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {SAMPLE_PREMIUM_CONTENT.map((content) => (
            <div key={content.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <PremiumContent content={content} showPreview={true} />
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Want Access to Premium Content?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Contact us to get added to our premium subscriber list and unlock exclusive content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
              <Link
                href="/blog"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                View Free Content
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
