// src/views/FormView.jsx
'use client';

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function FormView() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(true);

  const [values, setValues] = useState({});
  const [ratings, setRatings] = useState({});
  const [fieldValidity, setFieldValidity] = useState({});
  const [formValid, setFormValid] = useState(false);

  const [metadata, setMetadata] = useState({
    utm: {},
    referrer: '',
    pageUrl: '',
    userAgent: '',
    location: null,
    clientTs: null
  });

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!formId) return;
    (async () => {
      try {
        setError('');
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/forms/${formId}`);
        if (!res.ok) throw new Error('Form not found');
        const data = await res.json();
        setForm(data);
        setPage(0);
      } catch (err) {
        setError(err.message || 'Failed to load form');
      }
    })();
  }, [formId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    for (const [k, v] of params.entries()) {
      if (k.startsWith('utm_') || ['source', 'campaign', 'gclid', 'fbclid', 'ref'].includes(k)) {
        utm[k] = v;
      }
    }

    const initialMeta = {
      utm,
      referrer: document.referrer || '',
      pageUrl: window.location.href,
      userAgent: navigator.userAgent || '',
      location: null,
      clientTs: new Date().toISOString()
    };

    setMetadata(initialMeta);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMetadata((prev) => ({
            ...prev,
            location: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            }
          }));
        },
        () => {},
        { maximumAge: 1000 * 60 * 5, timeout: 5000 }
      );
    }
  }, []);

  const sanitizeInput = (value, { maxLen = 2000 } = {}) => {
    if (value == null) return '';
    return String(value).slice(0, maxLen).replace(/<[^>]*>?/gm, '');
  };

  const validateField = (field, index) => {
    const key = field.label || `field-${index}`;
    const type = (field.type || '').toLowerCase();
    const val = values[key];

    if (field.required) {
      if (type === 'rating') {
        if (!ratings[index] || ratings[index] < 1) {
          return { ok: false, msg: 'Required' };
        }
      } else if (!val || String(val).trim() === '') {
        return { ok: false, msg: 'Required' };
      }
    }

    if (type === 'email' && val) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(val)) return { ok: false, msg: 'Invalid email' };
    }

    if (type === 'number' && val) {
      const n = Number(val);
      if (Number.isNaN(n)) return { ok: false, msg: 'Must be a number' };
    }

    return { ok: true };
  };

  useEffect(() => {
    if (!form?.fieldType) {
      setFieldValidity({});
      setFormValid(false);
      return;
    }

    const next = {};
    let allOk = true;

    form.fieldType.forEach((f, i) => {
      const res = validateField(f, i);
      const key = f.label || `field-${i}`;
      next[key] = res;
      if (!res.ok) allOk = false;
    });

    setFieldValidity(next);
    setFormValid(Boolean(allOk));
  }, [values, ratings, form]);

  const handleChange = (field, globalIndex) => (e) => {
    const key = field.label || `field-${globalIndex}`;
    setValues((prev) => ({ ...prev, [key]: sanitizeInput(e.target.value) }));
  };

  const handleRadioChange = (field, globalIndex) => (e) => {
    const key = field.label || `field-${globalIndex}`;
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form) return;

    const nextValidity = {};
    let ok = true;
    const payload = { formId, formName: form.name, responses: {}, metadata };

    (form.fieldType || []).forEach((f, i) => {
      const key = f.label || `field-${i}`;
      const res = validateField(f, i);
      nextValidity[key] = res;
      if (!res.ok) ok = false;

      if (res.ok) {
        if ((f.type || '').toLowerCase() === 'rating') {
          payload.responses[key] = Number(ratings[i] ?? null);
        } else {
          const rawVal = values[key] ?? '';
          payload.responses[key] = sanitizeInput(String(rawVal).trim());
        }
      }
    });

    setFieldValidity((prev) => ({ ...prev, ...nextValidity }));
    setFormValid(ok);

    if (!ok) {
      setError('Please fix validation errors before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || 'Submission failed');
      }

      setSuccessMsg('Feedback submitted successfully!');
      setShowForm(false);
      setValues({});
      setRatings({});
    } catch (err) {
      let message = err.message || 'Submission error';
      try {
        const parsed = JSON.parse(message);
        message = parsed.error || message;
      } catch (_) {
        if (message.includes('"error"')) {
          const match = message.match(/"error"\s*:\s*"([^"]+)"/);
          if (match) message = match[1];
        }
      }
      setError(message);
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) return <div className="p-6 text-gray-300">Loading...</div>;

  const totalFields = form.fieldType?.length || 0;
  const pageCount = Math.max(1, Math.ceil(totalFields / PAGE_SIZE));
  const safePage = Math.min(Math.max(0, page), pageCount - 1);
  if (safePage !== page) setPage(safePage);
  const start = safePage * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, totalFields);
  const visibleFields = (form.fieldType || []).slice(start, end);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-xl text-gray-100 relative">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
          <img src="/logo.png" alt="Feedbyx" className="h-6 w-auto" />
          <span className="text-xs text-gray-300">
            Created with <span className="font-semibold">feedbyx.com</span>
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">{form.name}</h1>

        {showForm ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {visibleFields.map((field, localIdx) => {
              const globalIndex = start + localIdx;
              const key = field.label || `field-${globalIndex}`;
              const validity = fieldValidity[key] ?? { ok: true };
              const val = values[key] || '';

              switch ((field.type || '').toLowerCase()) {
                case 'input':
                case 'text':
                case 'email':
                case 'number':
                  return (
                    <div key={globalIndex}>
                      <label className="block mb-1 font-medium text-gray-200">{key}</label>
                      <input
                        name={key}
                        value={val}
                        onChange={handleChange(field, globalIndex)}
                        type={field.type === 'input' ? 'text' : field.type}
                        required={field.required}
                        className="w-full border border-[var(--lightblue)] bg-transparent text-white rounded p-2 outline-none"
                      />
                      {!validity.ok && (
                        <p className="text-xs text-red-400 mt-1">{validity.msg}</p>
                      )}
                    </div>
                  );

                case 'textarea':
                  return (
                    <div key={globalIndex}>
                      <label className="block mb-1 font-medium text-gray-200">{key}</label>
                      <textarea
                        name={key}
                        value={val}
                        onChange={handleChange(field, globalIndex)}
                        required={field.required}
                        className="w-full border border-[var(--lightblue)] bg-transparent text-white rounded p-2 outline-none"
                      />
                      {!validity.ok && (
                        <p className="text-xs text-red-400 mt-1">{validity.msg}</p>
                      )}
                    </div>
                  );

                case 'radio':
                  return (
                    <div key={globalIndex}>
                      <p className="font-medium text-gray-200 mb-2">{key}</p>
                      <div className="flex flex-col gap-2">
                        {field.options?.map((opt, i) => (
                          <label key={i} className="inline-flex items-center gap-2 text-gray-300">
                            <input
                              type="radio"
                              name={key}
                              value={opt}
                              checked={val === opt}
                              onChange={handleRadioChange(field, globalIndex)}
                              required={field.required}
                              className="accent-blue-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      {!validity.ok && (
                        <p className="text-xs text-red-400 mt-1">{validity.msg}</p>
                      )}
                    </div>
                  );

                case 'rating':
                  return (
                    <div key={globalIndex}>
                      <p className="font-medium text-gray-200 mb-2">{key}</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() =>
                              setRatings((prev) => ({ ...prev, [globalIndex]: star }))
                            }
                            className={`cursor-pointer text-2xl ${ratings[globalIndex] >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {!validity.ok && (
                        <p className="text-xs text-red-400 mt-1">{validity.msg}</p>
                      )}
                    </div>
                  );

                default:
                  return (
                    <div key={globalIndex} className="text-red-400">
                      Unsupported field type: {field.type}
                    </div>
                  );
              }
            })}

{totalFields > PAGE_SIZE ? (
  <div className="flex items-center justify-between mt-2">
    <button
      type="button"
      onClick={() => setPage((p) => Math.max(0, p - 1))}
      disabled={page <= 0}
      className={`px-3 py-1 rounded ${page <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-700' : 'bg-[var(--blue)] hover:bg-[var(--lightblue)]'}`}
    >
      Previous
    </button>

    <div>
      {page < pageCount - 1 ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => setPage((p) => Math.min(pageCount - 1, p + 1)), 0);
          }}
          disabled={page >= pageCount - 1}
          className={`px-3 py-1 rounded ${page >= pageCount - 1 ? 'opacity-50 cursor-not-allowed bg-gray-700' : 'bg-[var(--blue)] hover:bg-[var(--lightblue)]'}`}
        >
          Next
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!formValid) {
              const ok = window.confirm('One or more required fields are empty. Are you sure you want to submit?');
              if (!ok) return;
            }
            const submitBtn = document.querySelector('button[type="submit"].fb-real-submit');
            if (submitBtn) submitBtn.click();
          }}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded font-semibold ${isSubmitting ? 'opacity-60 cursor-not-allowed bg-gray-600' : 'bg-[var(--blue)] hover:bg-[var(--lightblue)]'}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      )}
    </div>
  </div>
) : (
  <button
    type="submit"
    disabled={!formValid || isSubmitting}
    className={`w-full rounded px-4 py-2 font-semibold transition ${(!formValid || isSubmitting) ? 'opacity-60 cursor-not-allowed bg-gray-600' : 'bg-[var(--blue)] hover:bg-[var(--lightblue)]'}`}
  >
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
)}


{error && <p className="text-center text-red-400 font-medium mt-4">{error}</p>}


            {/* <button
              type="submit"
              disabled={!formValid || isSubmitting}
              className={`w-full rounded px-4 py-2 font-semibold transition ${(!formValid || isSubmitting) ? 'opacity-60 cursor-not-allowed bg-gray-600' : 'bg-[var(--blue)] hover:bg-[var(--lightblue)]'}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button> */}
          </form>
        ) : (
          <div className="text-center">
            {successMsg ? (
              <p className="text-green-400 font-medium">{successMsg}</p>
            ) : (
              <p className="text-red-400 font-medium">{error}</p>
            )}
            <button
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setShowForm(true);
              }}
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Submit Another Response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
