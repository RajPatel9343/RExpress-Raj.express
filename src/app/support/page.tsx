'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // New ticket state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('ORDER');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketError, setTicketError] = useState('');

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the return and replacement policy?',
      a: 'We offer an unconditional 7-day doorstep return and replacement window for all unopened and manufacturing-defective electronics. Simply request a return through your account portal.',
    },
    {
      q: 'Are all products authentic with manufacturer warranty?',
      a: 'Yes, 100%. Rexpresso is an authorized distributor for Sony, Apple, Bose, Nike, and Dyson in India. All electronics come with original brand warranty cards and GST tax invoices.',
    },
    {
      q: 'How long does express shipping take?',
      a: 'Orders placed before 2 PM IST are dispatched on the same business day. Delivery takes 24 to 48 hours for metro cities (Mumbai, Bengaluru, Delhi NCR, Hyderabad) and 3-4 days for other regions.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We support all major payment options via Razorpay including UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, Mastercard, Net Banking across 50+ Indian banks, and Cash on Delivery (COD).',
    },
  ];

  const fetchTickets = async () => {
    if (!user) return;
    try {
      setLoadingTickets(true);
      const res = await fetch('/api/support/tickets');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setTickets(json.data || []);
      }
    } catch (err) {
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to submit a support ticket.');
      return;
    }
    setSubmitting(true);
    setTicketError('');

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          category,
          priority,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTicketSuccess(true);
        setSubject('');
        setMessage('');
        fetchTickets();
        setTimeout(() => setTicketSuccess(false), 4000);
      } else {
        setTicketError(data.error || 'Failed to submit ticket');
      }
    } catch (err: any) {
      setTicketError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Support Header */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-theme-gray-border shadow-sm text-center space-y-3">
        <div className="w-16 h-16 bg-blue-50 text-theme-blue rounded-full flex items-center justify-center mx-auto">
          <LifeBuoy className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-theme-black tracking-tight">
          Rexpresso Concierge & Support Desk
        </h1>
        <p className="text-xs sm:text-sm text-theme-gray-medium max-w-xl mx-auto">
          Dedicated assistance for order dispatch, acoustic consultations, returns, and corporate GST inquiries.
        </p>

        {/* Quick Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-3xl mx-auto text-left text-xs">
          <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border flex items-center space-x-3">
            <Phone className="w-5 h-5 text-theme-blue flex-shrink-0" />
            <div>
              <span className="font-bold text-theme-black block">Telephone Helpline</span>
              <span className="text-theme-gray-medium">+91 (080) 4567-8900</span>
            </div>
          </div>

          <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border flex items-center space-x-3">
            <Mail className="w-5 h-5 text-theme-blue flex-shrink-0" />
            <div>
              <span className="font-bold text-theme-black block">Email Support</span>
              <span className="text-theme-gray-medium">concierge@Rexpressocommerce.com</span>
            </div>
          </div>

          <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border flex items-center space-x-3">
            <Clock className="w-5 h-5 text-theme-blue flex-shrink-0" />
            <div>
              <span className="font-bold text-theme-black block">Working Hours</span>
              <span className="text-theme-gray-medium">Mon - Sat, 9 AM - 8 PM IST</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ticket Submission Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-5">
          <div className="pb-3 border-b border-theme-gray-border">
            <h2 className="text-base font-bold text-theme-black flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-theme-blue" />
              <span>Open a Support Ticket</span>
            </h2>
            <p className="text-xs text-theme-gray-medium mt-0.5">
              Submit your inquiry and our senior operations team will respond promptly.
            </p>
          </div>

          {ticketSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>Ticket registered successfully! Our team will reply shortly.</span>
            </div>
          )}

          {ticketError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">
              {ticketError}
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-theme-black block mb-1">Subject *</label>
              <input
                type="text"
                placeholder="e.g. Inquiry regarding order tracking or packaging"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-theme-black block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                >
                  <option value="ORDER">Order & Tracking</option>
                  <option value="PAYMENT">Payment & Invoices</option>
                  <option value="RETURN">Returns & Refunds</option>
                  <option value="PRODUCT">Product Specification</option>
                  <option value="GENERAL">General Inquiries</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-theme-black block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">
                Your Detailed Message *
              </label>
              <textarea
                rows={5}
                placeholder="Please describe your question or issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-theme-blue text-white rounded-xl font-bold hover:bg-theme-blue-dark transition-colors shadow-sm disabled:bg-gray-400 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: FAQ Accordion */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
          <div className="pb-3 border-b border-theme-gray-border">
            <h2 className="text-base font-bold text-theme-black flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-theme-blue" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-theme-gray-medium mt-0.5">
              Quick answers to the most common customer questions.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-theme-gray-border rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-theme-black bg-theme-gray-bg hover:bg-gray-100 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-theme-blue flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-theme-gray-medium flex-shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-theme-gray-dark leading-relaxed border-t border-theme-gray-border">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User's recent tickets if logged in */}
          {user && tickets.length > 0 && (
            <div className="pt-4 border-t border-theme-gray-border space-y-3">
              <h3 className="text-xs font-bold text-theme-black uppercase tracking-wider">
                My Open Tickets ({tickets.length})
              </h3>
              <div className="space-y-2">
                {tickets.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-theme-gray-bg rounded-xl border border-theme-gray-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-theme-black">{t.ticketNumber}</span>
                      <p className="text-[11px] text-theme-gray-medium truncate max-w-xs">{t.subject}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
