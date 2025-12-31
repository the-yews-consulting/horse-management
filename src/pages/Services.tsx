import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  Bell,
  BarChart3,
  Shield,
  Smartphone,
  Clock,
  CheckCircle
} from 'lucide-react';

export function Services() {
  const services = [
    {
      icon: Users,
      title: 'Horse & Owner Management',
      description: 'Comprehensive profiles for every horse and owner, including medical records, ownership details, and contact information.',
      features: [
        'Detailed horse profiles with photos',
        'Health and vaccination tracking',
        'Owner contact management',
        'Emergency contact information',
      ],
    },
    {
      icon: Calendar,
      title: 'Scheduling & Appointments',
      description: 'Never miss a vet visit, farrier appointment, or training session with our intelligent scheduling system.',
      features: [
        'Veterinary appointment tracking',
        'Farrier visit scheduling',
        'Training session calendar',
        'Automated reminders',
      ],
    },
    {
      icon: FileText,
      title: 'Record Keeping',
      description: 'Digital record-keeping that makes information accessible and organized at all times.',
      features: [
        'Medical history logs',
        'Feeding schedules',
        'Exercise and training notes',
        'Document storage',
      ],
    },
    {
      icon: DollarSign,
      title: 'Billing & Payments',
      description: 'Streamline your financial operations with integrated billing and payment tracking.',
      features: [
        'Boarding fee management',
        'Invoice generation',
        'Payment tracking',
        'Financial reporting',
      ],
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Make informed decisions with comprehensive analytics and customizable reports.',
      features: [
        'Occupancy reports',
        'Revenue analytics',
        'Health trend analysis',
        'Custom report builder',
      ],
    },
    {
      icon: Bell,
      title: 'Notifications & Alerts',
      description: 'Stay informed with real-time notifications for important events and updates.',
      features: [
        'Appointment reminders',
        'Payment due alerts',
        'Health issue notifications',
        'Custom alert rules',
      ],
    },
  ];

  const additionalFeatures = [
    { icon: Shield, text: 'Bank-level security and encryption' },
    { icon: Smartphone, text: 'Mobile app for iOS and Android' },
    { icon: Clock, text: '24/7 customer support' },
    { icon: CheckCircle, text: 'Regular updates and improvements' },
  ];

  return (
    <div className="bg-gray-50">
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Comprehensive Solutions for Modern Stables
          </h1>
          <p className="text-xl text-green-100 leading-relaxed">
            Everything you need to run your equestrian facility efficiently and professionally.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Additional Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-12 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Streamline Your Operations?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful stables using our platform to save time and improve horse care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition shadow-lg">
              Start Free Trial
            </button>
            <button className="bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-800 transition border-2 border-white">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Flexible Pricing Plans
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-green-600 mb-4">$49<span className="text-lg text-gray-600">/mo</span></div>
              <p className="text-gray-600 mb-6">Perfect for small stables</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Up to 25 horses</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Basic reporting</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Email support</span>
                </li>
              </ul>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                Get Started
              </button>
            </div>

            <div className="bg-green-600 text-white rounded-xl p-8 shadow-md transform scale-105">
              <div className="bg-green-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <div className="text-4xl font-bold mb-4">$99<span className="text-lg">/mo</span></div>
              <p className="text-green-100 mb-6">For growing facilities</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Up to 100 horses</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Mobile app access</span>
                </li>
              </ul>
              <button className="w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition">
                Get Started
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-green-600 mb-4">Custom</div>
              <p className="text-gray-600 mb-6">For large operations</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unlimited horses</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Dedicated support</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Training included</span>
                </li>
              </ul>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
