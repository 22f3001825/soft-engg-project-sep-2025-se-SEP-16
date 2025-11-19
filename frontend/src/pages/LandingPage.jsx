import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, MessageSquare, Users, BarChart3, Shield, CheckCircle, ArrowRight, Sparkles, Star, Bot, BrainCircuit } from 'lucide-react';
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
    <div className="min-h-screen text-slate-800 overflow-hidden" style={{backgroundColor: '#F4F9E9'}}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.6s ease-out forwards; }
      `}</style>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{backgroundColor: '#153243'}}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                <span className="text-xl font-bold text-primary-foreground">I</span>
              </div>
              <span className="text-2xl font-bold text-white">Intellica</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-white/80 hover:text-white font-medium transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('roles')} className="text-white/80 hover:text-white font-medium transition-colors">
                Solutions
              </button>
              <button onClick={() => scrollToSection('team')} className="text-white/80 hover:text-white font-medium transition-colors">
                Team
              </button>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-white/80 hover:text-white font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 border border-white/20">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16">
        <div className="container mx-auto px-6 text-center relative z-10 max-w-5xl">
          <div className="fade-in">
            
            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-tight">
              <span className="text-slate-800">
                Intellica
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform customer support with AI-powered intelligence and seamless collaboration
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-4 text-lg font-semibold rounded-xl shadow-lg inline-flex items-center justify-center hover:shadow-xl transition-shadow duration-200 text-white"
              >
                Get Started 
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              
              <Link 
                to="/login" 
                className="bg-white border border-slate-300 hover:border-blue-400 px-10 py-4 text-lg font-semibold rounded-xl shadow-sm inline-flex items-center justify-center hover:shadow-lg transition-all duration-200 text-slate-700 hover:text-blue-600"
              >
                Sign In
              </Link>
            </div>
            
            {/* AI Features - Enhanced Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
              }}>
                <div className="flex items-center mb-4">
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                  }}>
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div style={{
                    fontSize: '19px',
                    fontWeight: '700',
                    color: '#1e293b',
                    letterSpacing: '-0.01em'
                  }}>
                    RAG Chatbot
                  </div>
                </div>
                <div style={{
                  color: '#475569',
                  fontSize: '14.5px',
                  lineHeight: '1.65',
                  fontWeight: '400'
                }}>
                  Intelligent customer support with contextual understanding
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
              }}>
                <div className="flex items-center mb-4">
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)'
                  }}>
                    <BrainCircuit className="h-6 w-6 text-white" />
                  </div>
                  <div style={{
                    fontSize: '19px',
                    fontWeight: '700',
                    color: '#1e293b',
                    letterSpacing: '-0.01em'
                  }}>
                    AI Copilot
                  </div>
                </div>
                <div style={{
                  color: '#475569',
                  fontSize: '14.5px',
                  lineHeight: '1.65',
                  fontWeight: '400'
                }}>
                  Smart assistance for agents, vendors & supervisors
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={() => scrollToSection('features')}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200 hover:bg-white">
            <ChevronDown className="h-6 w-6 text-slate-600" />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <AnimatedSection id="features" className="py-32 relative">
        <div className="container mx-auto px-6 relative z-10 max-w-6xl">
          <div className="text-center mb-20">
            <div className="inline-block bg-blue-50 text-blue-600 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-blue-200">
              POWERFUL FEATURES
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-slate-800">
              Everything you need
            </h2>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Deliver exceptional customer support with our comprehensive suite of intelligent tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '28px',
                height: '100%',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
              }}>
                <div className="mb-5">
                  <div className={`bg-gradient-to-r ${feature.gradient}`} style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '12px',
                  lineHeight: '1.4',
                  letterSpacing: '-0.01em'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#475569',
                  fontSize: '14px',
                  lineHeight: '1.65',
                  fontWeight: '400'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ROLES SECTION */}
      <AnimatedSection id="roles" className="py-40 relative bg-slate-50">
        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <div className="text-center mb-24">
            <div className="inline-block bg-purple-50 text-purple-600 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-purple-200">
              FOR EVERY ROLE
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-slate-800">
              Built for everyone
            </h2>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Tailored experiences that empower every member of your support team
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {roles.map((item, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '18px',
                padding: '32px',
                height: '100%',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.14), 0 6px 12px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
              }}>
                <div className="mb-6">
                  <div className={`bg-gradient-to-r ${item.color}`} style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)'
                  }}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '24px',
                  letterSpacing: '-0.01em'
                }}>
                  {item.role}
                </h3>
                
                <ul className="space-y-3">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle style={{
                        width: '18px',
                        height: '18px',
                        color: '#10b981',
                        marginRight: '12px',
                        flexShrink: 0,
                        marginTop: '2px'
                      }} />
                      <span style={{
                        color: '#475569',
                        fontSize: '14.5px',
                        lineHeight: '1.6',
                        fontWeight: '500'
                      }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* TEAM SECTION */}
      <AnimatedSection id="team" className="py-40 relative">
        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <div className="text-center mb-24">
            <div className="inline-block bg-green-50 text-green-600 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-green-200">
              OUR TEAM
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-slate-800">
              Meet the creators
            </h2>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              The passionate team of innovators who brought Intellica to life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {team.map((member, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '18px',
                padding: '28px',
                height: '100%',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.14), 0 6px 12px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
              }}>
                <div className="mb-5 relative">
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 50%, #ec4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '700',
                    transition: 'transform 0.3s ease',
                    boxShadow: '0 6px 16px rgba(168, 85, 247, 0.3)',
                    letterSpacing: '-0.02em'
                  }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '8px',
                  letterSpacing: '-0.01em'
                }}>
                  {member.name}
                </h3>
                
                <p style={{
                  color: '#3b82f6',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  marginBottom: '16px',
                  fontWeight: '500'
                }}>
                  {member.roll}
                </p>
                
                <div style={{
                  display: 'inline-block',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  border: '1px solid rgba(203, 213, 225, 0.6)'
                }}>
                  <p style={{
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* FOOTER */}
      <footer className="relative py-16 border-t border-slate-200">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Link to="/" className="flex items-center group">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl hover:scale-110 hover:rotate-12 transition-all duration-300">
                <span className="text-xl font-bold text-white">I</span>
              </div>
              <span className="ml-4 text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Intellica</span>
            </Link>
          </div>
          
          <p className="text-slate-600 mb-6">
            © 2025 Intellica. Advanced Customer Support Platform.
          </p>
          
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span>Built with passion by an amazing team</span>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;