import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function FormView() {
  const { formId } = useParams(); // dynamic URL param
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(true);

  // fetch form data by id
  useEffect(() => {
    if (!formId) return;
    const fetchForm = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/forms/${formId}`);
        if (!res.ok) throw new Error('Form not found');
        const data = await res.json();
        setForm(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchForm();
  }, [formId]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form) return;

  const formData = new FormData(e.target);
  const payload = { formId, formName: form.name }; // <-- Add formName here

  form.fieldType?.forEach((field, index) => {
    const key = field.label || `field-${index}`;
    const value =
      field.type === 'radio' || field.type === 'rating'
        ? formData.get(`${field.type}-${index}`)
        : formData.get(key);
    if (value) payload[key] = value;
  });

  try {
    setIsSubmitting(true);
    setSuccessMsg('');
    const res = await fetch('http://localhost:5000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId, formName: form.name, responses: payload }), // send formName
    });

    if (!res.ok) throw new Error('Failed to submit feedback');

    setSuccessMsg('✅ Feedback submitted successfully!');
    setShowForm(false);
    e.target.reset();
  } catch (err) {
    setError(err.message);
  } finally {
    setIsSubmitting(false);
  }
};


  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!form) return <div className="p-6 text-gray-300">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-xl text-gray-100 relative">
        <h1 className="text-2xl font-bold mb-6 text-center">{form.name}</h1>

        {showForm ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {form.fieldType?.map((field, index) => {
              const key = field.label || `field-${index}`;
              switch (field.type) {
                case 'input':
                case 'text':
                case 'email':
                case 'number':
                  return (
                    <div key={index}>
                      <label className="block mb-1 font-medium text-gray-200">{key}</label>
                      <input
                        name={key}
                        type={field.type === 'input' ? 'text' : field.type}
                        required={field.required}
                        className="w-full border border-[var(--lightblue)] text-white rounded p-2 outline-none"
                      />
                    </div>
                  );
                case 'textarea':
                  return (
                    <div key={index}>
                      <label className="block mb-1 font-medium text-gray-200">{key}</label>
                      <textarea
                        name={key}
                        required={field.required}
                        className="w-full border border-[var(--lightblue)] text-white rounded p-2 outline-none"
                      />
                    </div>
                  );
                case 'radio':
                  return (
                    <div key={index}>
                      <p className="font-medium text-gray-200">{key}</p>
                      {field.options?.map((opt, i) => (
                        <label key={i} className="block text-gray-300">
                          <input type="radio" name={`radio-${index}`} value={opt} required={field.required} className="mr-2 accent-blue-500" />
                          {opt}
                        </label>
                      ))}
                    </div>
                  );
                case 'rating':
                  return (
                    <div key={index}>
                      <p className="font-medium text-gray-200">{key}</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <label key={star}>
                            <input type="radio" name={`rating-${index}`} value={star} required={field.required} className="hidden peer" />
                            <span className="cursor-pointer text-2xl text-gray-500 peer-checked:text-yellow-400">⭐</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                default:
                  return <div key={index} className="text-red-400">Unknown field type: {field.type}</div>;
              }
            })}
            <button type="submit" disabled={isSubmitting} className="bg-[var(--blue)] hover:bg-[var(--lightblue)] text-white px-4 py-2 rounded w-full transition">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-400">{successMsg}</p>
            <button onClick={() => { setSuccessMsg(''); setShowForm(true); }} className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
              Submit Another Response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
