import { CheckCircle, Users, Calendar, Shield, BarChart3, Clock } from 'lucide-react';

export function Home() {
  const features = [
    {
      icon: Users,
      title: 'Complete Horse Records',
      description: 'Track detailed information for every horse including health records, ownership, and boarding details.',
    },
    {
      icon: Calendar,
      title: 'Scheduling & Management',
      description: 'Organize vet visits, farrier appointments, and daily activities with our integrated calendar system.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and automatic backups.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Generate comprehensive reports on occupancy, revenue, and facility utilization.',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Stay informed with instant notifications and real-time status updates.',
    },
    {
      icon: CheckCircle,
      title: 'Easy to Use',
      description: 'Intuitive interface designed specifically for stable management professionals.',
    },
  ];

  return (
    <div className="bg-gray-50">
      <section className="relative bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Modern Stable Management Made Simple
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto leading-relaxed">
              Streamline your equestrian facility operations with comprehensive tools for horse care, scheduling, and business management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition shadow-lg">
                Get Started
              </button>
              <button className="bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-800 transition border-2 border-white">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Stable
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you focus on what matters most: caring for horses.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
            >
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Trusted by Leading Equestrian Facilities
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                From small private stables to large boarding facilities, our software adapts to your needs. Join hundreds of satisfied stable managers who have transformed their operations.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Reduce administrative time by up to 60%</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Never miss an appointment or important date</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Improve communication with horse owners</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Access your data anywhere, anytime</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-12 text-center">
              <div className="text-6xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-xl text-gray-700 mb-8">Active Stables</div>
              <div className="text-6xl font-bold text-green-600 mb-2">10K+</div>
              <div className="text-xl text-gray-700 mb-8">Horses Managed</div>
              <div className="text-6xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-xl text-gray-700">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Stable Management?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join leading equestrian facilities using our platform to streamline operations.
          </p>
          <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition shadow-lg">
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}
