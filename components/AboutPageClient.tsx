'use client';

import { motion } from 'framer-motion';
import { Code, Brain, Rocket, Building, Mail, Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/Layout';

const features = [
  {
    name: 'Expert Content',
    description: 'Articles written by experienced developers with 15+ years in the industry.',
    icon: Code,
  },
  {
    name: 'AI Integration',
    description: 'Practical guides for integrating AI capabilities into backend systems.',
    icon: Brain,
  },
  {
    name: 'Startup Focus',
    description: 'Tech stack decisions and architectural patterns for growing startups.',
    icon: Rocket,
  },
  {
    name: 'Enterprise Solutions',
    description: 'Building scalable, enterprise-grade systems that grow with your business.',
    icon: Building,
  },
];

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: Github,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: Twitter,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: Linkedin,
  },
  {
    name: 'Email',
    href: 'mailto:contact@example.com',
    icon: Mail,
  },
];

export default function AboutPageClient() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
          >
            About Backend Engineering Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300"
          >
            A modern technical blog focused on backend engineering, AI integration, 
            and tech innovations. Built for developers, by developers.
          </motion.p>
        </div>

        {/* Mission Statement */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 p-8 dark:from-gray-800 dark:to-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              We believe that great backend engineering is the foundation of successful software products. 
              Our mission is to share practical knowledge, real-world experiences, and cutting-edge insights 
              that help developers build scalable, maintainable, and innovative backend systems.
            </p>
          </div>
        </motion.section>

        {/* What We Cover */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            What We Cover
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {feature.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Author Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col items-center text-center md:flex-row md:text-left">
              <div className="mb-6 md:mb-0 md:mr-8">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">PG</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Satyam Parmar
                </h3>
                <p className="text-lg text-primary-600 dark:text-primary-400 mb-4">
                  Senior Backend Engineer & Tech Writer
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  With over 10 years of experience in backend engineering, I&apos;ve built scalable systems 
                  for startups and enterprises alike. I&apos;m passionate about sharing knowledge and helping 
                  developers navigate the complex world of backend development, AI integration, and 
                  modern software architecture.
                </p>
                <div className="flex space-x-4">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <motion.a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-primary-900 dark:hover:text-primary-400"
                      >
                        <Icon className="h-5 w-5" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Practical Focus
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every article provides actionable insights you can implement immediately.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Innovation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We explore cutting-edge technologies and emerging trends in backend development.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Community
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We believe in the power of sharing knowledge and building a supportive developer community.
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="rounded-2xl bg-primary-600 p-8 text-center dark:bg-primary-700">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Level Up Your Backend Skills?
            </h2>
            <p className="text-primary-100 mb-6">
              Join thousands of developers who are already improving their backend engineering skills.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50"
              >
                Explore Articles
              </Link>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-primary-600"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}
