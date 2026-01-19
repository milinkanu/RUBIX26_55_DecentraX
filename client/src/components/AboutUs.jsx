import React from 'react';
import { Heart, Shield, Users } from 'lucide-react';
import { Navbar } from './Navbar';

export function AboutUs() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 sm:px-6 md:px-10 lg:px-16 py-12 space-y-16 bg-gradient-to-b from-black via-gray-900 to-black">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white">TraceBack</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're dedicated to helping people reunite with their lost belongings.
            Our platform provides a simple and effective way to connect those who have
            lost items with those who have found them.
          </p>
        </section>

        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-black/70 p-8 rounded-2xl text-center space-y-4 border border-gray-700 hover:border-yellow-400 transition-all">
            <Heart className="h-12 w-12 text-yellow-400 mx-auto" />
            <h2 className="text-xl font-semibold text-white">Our Mission</h2>
            <p className="text-gray-300">
              To create a caring community that helps people recover their lost possessions
              and restore peace of mind.
            </p>
          </div>

          <div className="bg-black/70 p-8 rounded-2xl text-center space-y-4 border border-gray-700 hover:border-yellow-400 transition-all">
            <Shield className="h-12 w-12 text-yellow-400 mx-auto" />
            <h2 className="text-xl font-semibold text-white">Safe & Secure</h2>
            <p className="text-gray-300">
              We prioritize user privacy and security in every interaction on our platform.
            </p>
          </div>

          <div className="bg-black/70 p-8 rounded-2xl text-center space-y-4 border border-gray-700 hover:border-yellow-400 transition-all">
            <Users className="h-12 w-12 text-yellow-400 mx-auto" />
            <h2 className="text-xl font-semibold text-white">Community First</h2>
            <p className="text-gray-300">
              Built on trust and goodwill, our community helps thousands of people every day.
            </p>
          </div>
        </section>
        <section className="bg-black/70 p-8 md:p-10 rounded-2xl border border-gray-700 space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
            How It Works
          </h2>

          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="bg-yellow-400 text-black font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Post Found Items</h3>
                <p className="text-gray-300">
                  If you've found something, create a detailed post with photos and location information.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="bg-yellow-400 text-black font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Search Lost Items</h3>
                <p className="text-gray-300">
                  Looking for something? Browse our database or create a lost item alert.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="bg-yellow-400 text-black font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Connect & Recover</h3>
                <p className="text-gray-300">
                  When you find a match, use our secure messaging system to arrange the return.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
