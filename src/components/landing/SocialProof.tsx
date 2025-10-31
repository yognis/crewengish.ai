'use client';

import { motion } from 'framer-motion';
import { Star, Users, Trophy, Globe } from 'lucide-react';

const stats = [
  {
    icon: Trophy,
    value: '1,000+',
    label: 'Test Tamamlandı',
  },
  {
    icon: Star,
    value: '4.8★',
    label: 'Ortalama Değerlendirme',
  },
  {
    icon: Users,
    value: '95%',
    label: 'Memnuniyet Oranı',
  },
  {
    icon: Globe,
    value: '20+',
    label: 'Ülkeden Kullanıcı',
  },
];

const testimonials = [
  {
    name: 'Ahmet Yılmaz',
    role: 'THY Pilot',
    avatar: 'AY',
    rating: 5,
    text: 'İngilizce konuşma sınavıma bu platform sayesinde harika hazırlandım. AI feedback gerçekten işe yarıyor!',
  },
  {
    name: 'Elif Demir',
    role: 'Kabin Görevlisi',
    avatar: 'ED',
    rating: 5,
    text: 'Havacılık terimleriyle pratik yapmak çok faydalı oldu. Kendime güvenim arttı.',
  },
  {
    name: 'Mehmet Kaya',
    role: 'Yer Hizmetleri',
    avatar: 'MK',
    rating: 5,
    text: '7/24 pratik yapabilmek büyük avantaj. İngilizce konuşma seviyem çok gelişti.',
  },
];

export default function SocialProof() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Statistics */}
        <div className="mb-16 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-thy-red/10">
                  <Icon className="h-8 w-8 text-thy-red" />
                </div>
                <div className="text-3xl font-bold text-thy-gray">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Section Title */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-thy-gray lg:text-4xl">
            THY Çalışanları Ne Diyor?
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Binlerce THY çalışanı İngilizce konuşma becerilerini geliştirmek için platformumuzu kullanıyor.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="rounded-xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <svg
                  className="h-8 w-8 text-thy-red/20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Rating */}
              <div className="mb-3 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="mb-6 text-gray-700 leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-thy-red text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-thy-gray">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
