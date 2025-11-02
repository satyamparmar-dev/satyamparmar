/**
 * Artillery Processor
 * 
 * Helper functions for generating random data in Artillery tests.
 * This file is optional - only needed if you use {{ $randomString() }} in YAML.
 * 
 * Usage in YAML:
 *   url: "/blog/{{ $randomString() }}"
 */

module.exports = {
  // Generate random blog slug from list
  randomBlogSlug: function(context, events, done) {
    const blogSlugs = [
      'incident-playbook-for-beginners',
      'llm-integration-guide',
      'rest-api-best-practices',
      'microservices-architecture',
      'startup-tech-stack',
      'cloud-native-backend',
      'ai-backend-integration',
      'kafka-interview-simulation',
    ];
    
    const randomSlug = blogSlugs[Math.floor(Math.random() * blogSlugs.length)];
    context.vars.blogSlug = randomSlug;
    return done();
  },
  
  // Generate random category
  randomCategory: function(context, events, done) {
    const categories = [
      'backend-engineering',
      'ai',
      'startup-world',
      'tech-innovations',
    ];
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    context.vars.category = randomCategory;
    return done();
  },
};

