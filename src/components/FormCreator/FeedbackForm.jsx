

import { useState } from 'react';

export default function FeedbackForm({ formId }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: '5',
    feedback: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, formId }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ text: 'Thank you for your feedback!', type: 'success' });
        setFormData({ name: '', email: '', rating: '5', feedback: '' });
        console.log('Feedback submitted successfully:', result);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage({ text: 'Error submitting feedback. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
 <form
  onSubmit={handleSubmit}
  className="max-w-xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow space-y-4"
>
 
  {message.text && (
    <div
      className={`p-3 rounded text-sm ${
        message.type === 'success'
          ? 'bg-green-100 border border-green-400 text-green-700'
          : 'bg-red-100 border border-red-400 text-red-700'
      }`}
    >
      {message.text}
    </div>
  )}

  {/* Name + Email */}
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>
  </div>

  {/* Star Rating */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
    <div className="flex gap-1 text-2xl cursor-pointer select-none">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setFormData((prev) => ({ ...prev, rating: String(star) }))}
          className={`transition ${
            star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
          } hover:scale-110`}
        >
          ★
        </span>
      ))}
    </div>
  </div>

  {/* Feedback Textarea */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
    <textarea
      name="feedback"
      value={formData.feedback}
      onChange={handleChange}
      rows="4"
      required
      className="w-full p-2 border border-gray-300 rounded-md"
      placeholder="Write your thoughts..."
    />
  </div>

  {/* Submit Button */}
  <div className="pt-2">
    <button
      type="submit"
      disabled={isSubmitting}
      className="bg-[#9ACD32] text-black font-semibold px-6 py-2 rounded hover:opacity-90 transition disabled:bg-gray-400"
    >
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  </div>
</form>

  );
}
