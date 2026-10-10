/**
 * Central list of Redis cache keys for public read-through caching
 * (see utils/cache.js). Kept in one place so a cache and its invalidation
 * site can never drift onto different key strings.
 */
const CACHE_KEYS = {
  academySettings: 'cache:public:academy',
  academyStats: 'cache:public:stats',
  publicCourses: 'cache:public:courses',
  publicTestimonials: 'cache:public:testimonials',
  publicFaqs: 'cache:public:faqs',
  publicAnnouncements: 'cache:public:announcements',
};

module.exports = { CACHE_KEYS };
