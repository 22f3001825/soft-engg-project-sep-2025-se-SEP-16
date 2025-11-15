import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, MessageSquare, Users, BarChart3, Shield, CheckCircle, ArrowRight, Sparkles, Zap, Star, Bot, BrainCircuit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Animated Section Component
const AnimatedSection = ({ children, id, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`${className} ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      {children}
    </section>
  );
};

// Tilt Card Component
const TiltCard = ({ children, delay = 0 }) => {
  return (
    <div 
      className="animate-fade-in-up hover:scale-105 hover:-translate-y-2 transition-all duration-300"
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const roleRoutes = {
        customer: '/customer/dashboard',
        agent: '/agent/dashboard',
        supervisor: '/supervisor/dashboard',
        vendor: '/vendor/dashboard'
      };
      navigate(roleRoutes[user.role] || '/customer/dashboard');
    }
  }, [user, navigate]);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Smart Ticketing",
      description: "Advanced support ticket management with real-time messaging and file attachments",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Multi-Role Portal",
      description: "Dedicated dashboards for customers, agents, supervisors, and vendors",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Comprehensive analytics with trend analysis and performance metrics",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with role-based access control",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const team = [
    { name: "Ali Jawad", roll: "22f3001825", role: "Full Stack Developer" },
    { name: "Deepti Gurnani", roll: "21f3002204", role: "Product Manager" },
    { name: "Harsh Mathur", roll: "23f1000602", role: "Frontend Developer" },
    { name: "Harshita Jain", roll: "21f1003224", role: "Scrum Master" },
    { name: "Mayank Singh", roll: "23f1000598", role: "Frontend Developer" },
    { name: "Rachita Vohra", roll: "22f1001847", role: "Tester" },
    { name: "Mohammad Aman", roll: "21f3000044", role: "Backend Developer" },
    { name: "Duvvuri Sai Kyvalya", roll: "21f1003975", role: "GenAI Developer" }
  ];

  const roles = [
    { role: 'Customer', color: 'from-sky-400 to-blue-500', features: ['Order Tracking', 'Support Tickets', 'Real-time Chat'], icon: MessageSquare },
    { role: 'Agent', color: 'from-orange-400 to-red-500', features: ['Ticket Management', 'Customer History', 'Refund Processing'], icon: Users },
    { role: 'Supervisor', color: 'from-violet-400 to-purple-500', features: ['Team Analytics', 'Performance Metrics', 'System Overview'], icon: BarChart3 },
    { role: 'Vendor', color: 'from-indigo-400 to-blue-600', features: ['Product Analytics', 'Complaint Tracking', 'Performance Insights'], icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 4s ease-in-out infinite; }
      `}</style>
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center animate-fade-in-up">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="animate-fade-in-up">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-2xl opacity-50 animate-pulse-slow" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2xl hover:scale-110 hover:rotate-12 transition-all duration-300">
                  <span className="text-3xl font-bold text-primary-foreground">I</span>
                </div>
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className="text-7xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Intellica
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Next-generation customer support platform with intelligent ticketing, 
              real-time analytics, and seamless multi-role collaboration
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link 
                to="/login" 
                className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-10 py-4 text-lg font-semibold rounded-xl shadow-lg inline-flex items-center justify-center hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  Login 
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <Link 
                to="/register" 
                className="group backdrop-blur-2xl bg-white/5 border-2 border-purple-500/30 hover:border-purple-400/50 px-10 py-4 text-lg font-semibold rounded-xl shadow-lg inline-flex items-center justify-center hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  Register
                  <Star className="ml-2 h-5 w-5" />
                </span>
              </Link>
            </div>

            {/* AI Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
              <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-8 border-l-4 border-blue-500 hover:bg-white/10 hover:scale-105 hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-2">
                  RAG Chatbot
                </div>
                <div className="text-slate-400">Intelligent customer support</div>
              </div>

              <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-8 border-l-4 border-purple-500 hover:bg-white/10 hover:scale-105 hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:-rotate-12 transition-transform duration-300">
                    <BrainCircuit className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  AI Copilot
                </div>
                <div className="text-slate-400">For Agent, Vendor & Supervisor</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer animate-float"
          onClick={() => scrollToSection('features')}
        >
          <ChevronDown className="h-10 w-10 text-purple-400" />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <AnimatedSection id="features" className="py-32 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Powerful Features
              </span>
            </h2>
            <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full w-48 mx-auto mb-6" />
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to deliver exceptional customer support
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <TiltCard key={index} delay={index * 0.1}>
                <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-8 h-full border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ROLES SECTION */}
      <AnimatedSection id="roles" className="py-32 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Built for Every Role
              </span>
            </h2>
            <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full w-48 mx-auto mb-6" />
            <p className="text-xl text-slate-400">
              Tailored experiences for different user types
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roles.map((item, index) => (
              <TiltCard key={index} delay={index * 0.1}>
                <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-8 h-full border-l-4 border-transparent hover:border-current transition-all duration-300"
                  style={{ borderColor: item.color.includes('sky') ? '#38bdf8' : item.color.includes('orange') ? '#fb923c' : item.color.includes('violet') ? '#a78bfa' : '#6366f1' }}
                >
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg hover:scale-110 hover:-rotate-6 transition-all duration-300`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {item.role}
                  </h3>
                  
                  <ul className="space-y-3">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* TEAM SECTION */}
      <AnimatedSection id="team" className="py-32 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Meet Our Team
              </span>
            </h2>
            <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full w-48 mx-auto mb-6" />
            <p className="text-xl text-slate-400">
              The brilliant minds behind Intellica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <TiltCard key={index} delay={index * 0.08}>
                <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-8 h-full border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-3">
                  <div className="mb-6 relative">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg hover:scale-110 hover:rotate-12 transition-all duration-300">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {member.name}
                  </h3>
                  
                  <p className="text-blue-400 text-sm font-mono mb-4">
                    {member.roll}
                  </p>
                  
                  <div className="inline-block px-4 py-2 rounded-lg backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                    <p className="text-blue-300 text-sm font-semibold">
                      {member.role}
                    </p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* FOOTER */}
      <footer className="relative py-16 border-t border-white/10">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Link to="/" className="flex items-center group">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-xl hover:scale-110 hover:rotate-12 transition-all duration-300">
                <span className="text-xl font-bold text-primary-foreground">I</span>
              </div>
              <span className="ml-4 text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">Intellica</span>
            </Link>
          </div>
          
          <p className="text-slate-400 mb-6">
            © 2025 Intellica. Advanced Customer Support Platform.
          </p>
          
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Built with passion by an amazing team</span>
            <Sparkles className="h-4 w-4 text-blue-400" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;