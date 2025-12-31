import { Target, Heart, Zap, Award } from 'lucide-react';

export function About() {
  const values = [
    {
      icon: Heart,
      title: 'Horse-First Approach',
      description: 'Every feature we build is designed with the welfare and care of horses as our top priority.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We continuously evolve our platform with the latest technology to serve you better.',
    },
    {
      icon: Target,
      title: 'Simplicity',
      description: 'Complex problems deserve simple solutions. We make stable management effortless.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from customer support to product quality.',
    },
  ];

  const team = [
    {
      name: 'Sarah Mitchell',
      role: 'Founder & CEO',
      bio: '20 years of equestrian facility management experience',
    },
    {
      name: 'Michael Chen',
      role: 'Head of Product',
      bio: 'Former software architect with passion for horses',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Customer Success',
      bio: 'Certified equine specialist and stable manager',
    },
  ];

  return (
    <div className="bg-gray-50">
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Stable Horse Management
          </h1>
          <p className="text-xl text-green-100 leading-relaxed">
            We're passionate about making stable management easier, so you can focus on what truly matters: the horses.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Founded in 2018 by experienced stable managers and technology professionals, Stable Horse Management was born from a simple observation: running an equestrian facility shouldn't be so complicated.
              </p>
              <p>
                After years of juggling spreadsheets, paper records, and disconnected systems, we knew there had to be a better way. We set out to create software that actually understands the unique needs of stable management.
              </p>
              <p>
                Today, we're proud to serve hundreds of facilities across the country, helping them save time, reduce stress, and provide better care for their horses.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 md:p-12">
            <div className="space-y-8">
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">2018</div>
                <div className="text-gray-700">Company Founded</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-gray-700">Stables Trust Us</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">10,000+</div>
                <div className="text-gray-700">Horses Under Care</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-700">Customer Support</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <div className="text-green-600 font-medium mb-3">
                  {member.role}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover why stable managers everywhere are choosing our platform.
          </p>
          <button className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition shadow-lg">
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
}
