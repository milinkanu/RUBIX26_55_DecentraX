import React from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Search,
  Shield,
  MapPin,
  Lock,
  CheckCircle,
  Users,
  Eye,
  ArrowRight
} from "lucide-react";
import { Navbar } from "./Navbar";

export function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8 mt-4">

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight tight-leading bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 animate-slide-up">
            Don’t Lose Hope. <br />
            Just <span className="text-yellow-400">FoundIt!</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed animate-slide-up-delayed">
            The community-powered platform connecting lost items with their owners.
            Whether you’ve lost a key or found a phone, we make reuniting simple, safe, and smart.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-slide-up-more-delayed">
            <Link
              to="/find"
              className="group px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
            >
              I Lost Something
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>

            <Link
              to="/post"
              className="group px-8 py-4 bg-yellow-400 text-black rounded-full font-bold text-lg hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              I Found Something
              <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-black to-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Reclaiming Made Easy</h2>
            <p className="text-gray-400">Simplifying the process into an easy workflow for everyone.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-gray-900/50 p-8 rounded-3xl border border-gray-800 hover:border-yellow-400/50 hover:bg-gray-800/50 transition-all duration-300">
              <div className="w-14 h-14 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Snap & Post</h3>
              <p className="text-gray-400 leading-relaxed">
                Create a listing in seconds. Upload a photo, add a description, and pin the location.
                Our Structured Listings ensure you capture the details that matter most.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-gray-900/50 p-8 rounded-3xl border border-gray-800 hover:border-yellow-400/50 hover:bg-gray-800/50 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Automatic Matching</h3>
              <p className="text-gray-400 leading-relaxed">
                Stop scrolling endlessly. Our Match Suggestion System analyzes item attributes
                and location data to instantly highlight potential matches nearby.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-gray-900/50 p-8 rounded-3xl border border-gray-800 hover:border-yellow-400/50 hover:bg-gray-800/50 transition-all duration-300">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Recovery</h3>
              <p className="text-gray-400 leading-relaxed">
                Chat anonymously using our Secure Messaging. Once you're ready to meet,
                use our Verification Workflow to ensure the item goes back to the right person.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Highlights */}
      <section className="py-24 px-6 bg-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white leading-tight">
              A Smarter Way to <br />
              <span className="text-yellow-400">Search Safely</span>
            </h2>
            <p className="text-gray-400 text-lg">
              We've built tools to cut through the noise and keep your data safe while you search.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: MapPin,
                  title: "Location-First Filtering",
                  desc: "Filter by specific neighborhoods. We show you what's relevant to where you lost your item."
                },
                {
                  icon: Lock,
                  title: "Privacy Protection",
                  desc: "Your contact details stay private. Coordinate returns through our internal chat system."
                },
                {
                  icon: CheckCircle,
                  title: "Verified Ownership",
                  desc: "Finders can ask 'challenge questions' before handing an item over."
                },
                {
                  icon: Eye,
                  title: "Actively Moderated",
                  desc: "Our team reviews posts to keep the platform spam-free and trustworthy."
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="mt-1">
                    <feature.icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{feature.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full transform rotate-12"></div>
            <div className="relative bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
              {/* Mock UI for Trust/Feature */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Community Trust</div>
                      <div className="text-xs text-green-400">Verified Active</div>
                    </div>
                  </div>
                  <Shield className="w-5 h-5 text-yellow-400" />
                </div>

                <div className="space-y-3">
                  <div className="h-2 bg-gray-800 rounded-full w-3/4"></div>
                  <div className="h-2 bg-gray-800 rounded-full w-1/2"></div>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-gray-800">
                  <p className="text-sm text-gray-300 italic">"I found my lost keys within 2 hours thanks to the location filter!"</p>
                  <p className="text-right text-xs text-yellow-400 mt-2">- Verified User</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Statistics */}
      <section className="py-16 bg-gray-900 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Items Reported", value: "1,240+" },
            { label: "Successful Reunions", value: "890+" },
            { label: "Active Neighbors", value: "3.5k" },
            { label: "Cities Covered", value: "12" }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-20 px-6 bg-black text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-white">Join the FoundIt! Neighborhood Watch</h2>
          <p className="text-gray-400 text-lg">
            Help us build a more honest, helpful community. Keep an eye out and report what you find.
          </p>
          <Link
            to="/find"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors duration-300"
          >
            Browse Recent Listings
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="pt-12 flex flex-col md:flex-row justify-center gap-8 text-sm text-gray-500 border-t border-gray-900 mt-12">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Community Guidelines</span>
            <span>© 2026 FoundIt! Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
