'use client';

import { motion } from 'framer-motion';
import { 
  Code, 
  Brain, 
  Rocket, 
  Building, 
  ArrowRight,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import Layout from '@/components/Layout';
import BlogCard from '@/components/BlogCard';
import type { BlogPost } from '@/lib/blog';

interface HomePageClientProps {
  featuredPosts: BlogPost[];
  categories: string[];
}

const features = [
  {
    name: 'Backend Engineering',
    description: 'Deep dives into scalable architecture, microservices, and system design patterns.',
    icon: Code,
    color: 'bg-blue-500',
  },
  {
    name: 'AI Integration',
    description: 'Practical guides for integrating AI capabilities into your backend systems.',
    icon: Brain,
    color: 'bg-purple-500',
  },
  {
    name: 'Startup Tech',
    description: 'Tech stack decisions and architectural choices for growing startups.',
    icon: Rocket,
    color: 'bg-green-500',
  },
  {
    name: 'Enterprise Solutions',
    description: 'Building robust, enterprise-grade systems that scale with your business.',
    icon: Building,
    color: 'bg-orange-500',
  },
];

const stats = [
  { name: 'Articles Published', value: '50+', icon: TrendingUp },
  { name: 'Monthly Readers', value: '10K+', icon: Users },
  { name: 'Avg. Read Time', value: '8 min', icon: Clock },
];

export default function HomePageClient({ featuredPosts, categories }: HomePageClientProps) {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl"
            >
              Backend Engineering
              <span className="block text-primary-600 dark:text-primary-400">
                Made Simple
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
            >
              Discover the latest insights, tutorials, and best practices in backend engineering, 
              AI integration, and tech innovations. Built for developers, by developers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <a
                href="/blog"
                className="group inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Explore Articles
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/about"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
            >
              Featured Articles
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
            >
              Handpicked articles covering the most important topics in backend engineering
            </motion.p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {featuredPosts.map((post, index) => (
              <BlogCard
                key={post.slug}
                post={post}
                featured={index === 0}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="/blog"
              className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
            >
              Explore by Category
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
            >
              Find articles tailored to your interests and expertise level
            </motion.p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.name}
                    </h3>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                  <div className="mt-4">
                    <a
                      href={`/blog?category=${feature.name.toLowerCase()}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Explore articles →
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 dark:bg-primary-700">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Stay Updated
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-4 max-w-2xl text-lg text-primary-100"
            >
              Get the latest articles on backend engineering, AI, and tech innovations 
              delivered to your inbox.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-l-lg border-0 px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-300"
              />
              <button className="rounded-r-lg bg-primary-800 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-300">
                Subscribe
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
