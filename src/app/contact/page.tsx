"use client";
import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="bg-background font-body-md text-on-surface">
      {/* Hero Section */}
      <section className="hero-gradient py-8 md:py-16 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-8 grid grid-cols-1 md:grid-cols-12 items-center gap-16">
          <div className="md:col-span-7">
            <span className="text-label-caps font-label-caps text-secondary uppercase tracking-widest mb-6 block">Get in Touch</span>
            <h1 className="font-h1 text-h1 text-white/80 mb-8">We're here to help you secure your community.</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Have questions about MyGateBell? Our team is ready to provide you with the answers and support you need. Reach out to us today.
            </p>
          </div>
          <div className="md:col-span-5 relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden editorial-shadow">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Contact Support" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Details & Form Section */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-label-caps font-label-caps mb-8">Contact Info</span>
              <h2 className="font-h2 text-h2 text-primary mb-8">Let's start a conversation</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-12">
                Whether you're looking for a demo, need customer support, or have a general inquiry, we're always just a message or call away.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-container p-3 rounded-xl text-blue-400 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-h2 text-xl text-primary mb-2">Head Office</h4>
                    <p className="font-body-md text-on-surface-variant">123 Tech Park, Innovation Hub<br />Bengaluru, Karnataka 560001, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary-container p-3 rounded-xl text-blue-400 shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-h2 text-xl text-primary mb-2">Phone</h4>
                    <p className="font-body-md text-on-surface-variant">+91 1800 123 4567<br />Mon-Fri from 9am to 6pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary-container p-3 rounded-xl text-blue-400 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-h2 text-xl text-primary mb-2">Email</h4>
                    <p className="font-body-md text-on-surface-variant">hello@mygatebell.com<br />support@mygatebell.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-surface-container-low p-8 md:p-12 rounded-3xl">
              <h3 className="font-h2 text-2xl text-primary mb-8">Send us a message</h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label-caps text-sm text-on-surface-variant block">First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-outline bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-caps text-sm text-on-surface-variant block">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-outline bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-caps text-sm text-on-surface-variant block">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-outline bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="john@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="font-label-caps text-sm text-on-surface-variant block">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-outline bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button type="submit" className="w-full py-4 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">
                  Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
