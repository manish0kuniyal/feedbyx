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

  // ---------- METADATA state ----------
  const [metadata, setMetadata] = useState({
    utm: {},          // will hold utm_* and related params
    referrer: '',
    pageUrl: '',
    userAgent: '',
    location: null,   // { lat, lng, accuracy } if allowed
    clientTs: null    // optional client timestamp
  });

  // fetch form
  useEffect(() => {
    if (!formId) return;
    (async () => {
      try {
        setError('');
        const res = await fetch(`http://localhost:5000/api/forms/${formId}`);
        if (!res.ok) throw new Error('Form not found');
        const data = await res.json();
        setForm(data);
      } catch (err) {
        setError(err.message || 'Failed to load form');
      }
    })();
  }, [formId]);

  // parse URL params, get referrer, userAgent, pageUrl and attempt geolocation
  useEffect(() => {
    // parse URLSearchParams
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

    // attempt browser geolocation (asks permission)
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
        (err) => {
          // ignore failure; keep location null
        },
        { maximumAge: 1000 * 60 * 5, timeout: 5000 }
      );
    }
  }, []); // run once on mount

  // sanitize + validate
  const sanitizeInput = (value, { maxLen = 2000 } = {}) => {
    if (!value) return '';
    return String(value).trim().slice(0, maxLen).replace(/<[^>]*>?/gm, '');
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

  // recompute validity
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

  const handleChange = (field, index) => (e) => {
    const key = field.label || `field-${index}`;
    setValues((prev) => ({ ...prev, [key]: sanitizeInput(e.target.value) }));
  };

  const handleRadioChange = (field, index) => (e) => {
    const key = field.label || `field-${index}`;
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form) return;

    // FINAL synchronous validation before submit
    const nextValidity = {};
    let ok = true;
    // include metadata in payload
    const payload = { formId, formName: form.name, responses: {}, metadata };

    (form.fieldType || []).forEach((f, i) => {
      const key = f.label || `field-${i}`;
      const res = validateField(f, i);
      nextValidity[key] = res;
      if (!res.ok) ok = false;

      // collect normalized values when valid
      if (res.ok) {
        if ((f.type || '').toLowerCase() === 'rating') {
          payload.responses[key] = Number(ratings[i] ?? null);
        } else {
          payload.responses[key] = res.normalizedValue ?? (values[key] ?? '');
        }
      }
    });

    setFieldValidity((prev) => ({ ...prev, ...nextValidity }));
    setFormValid(ok);

    if (!ok) {
      setError('Please fix validation errors before submitting.');
      return;
    }

    // submit
    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || 'Submission failed');
      }

      setSuccessMsg('✅ Feedback submitted successfully!');
      setShowForm(false);
      setValues({});
      setRatings({});
    } catch (err) {
      setError(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!form) return <div className="p-6 text-gray-300">Loading...</div>;

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
            {form.fieldType?.map((field, index) => {
              const key = field.label || `field-${index}`;
              const validity = fieldValidity[key] ?? { ok: true };
              const val = values[key] || '';

              switch ((field.type || '').toLowerCase()) {
                case 'input':
                case 'text':
                case 'email':
                case 'number':
                  return (
                    <div key={index}>
                      <label className="block mb-1 font-medium text-gray-200">{key}</label>
                      <input
                        name={key}
                        value={val}
                        onChange={handleChange(field, index)}
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
                    <div key={index}>
                      <label className="block mb-1 font-medium text-gray-200">{key}</label>
                      <textarea
                        name={key}
                        value={val}
                        onChange={handleChange(field, index)}
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
                    <div key={index}>
                      <p className="font-medium text-gray-200 mb-2">{key}</p>
                      <div className="flex flex-col gap-2">
                        {field.options?.map((opt, i) => (
                          <label key={i} className="inline-flex items-center gap-2 text-gray-300">
                            <input
                              type="radio"
                              name={key}
                              value={opt}
                              checked={val === opt}
                              onChange={handleRadioChange(field, index)}
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
                    <div key={index}>
                      <p className="font-medium text-gray-200 mb-2">{key}</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() =>
                              setRatings((prev) => ({ ...prev, [index]: star }))
                            }
                            className={`cursor-pointer text-2xl ${
                              ratings[index] >= star
                                ? 'text-yellow-400'
                                : 'text-gray-600'
                            }`}
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
                    <div key={index} className="text-red-400">
                      Unsupported field type: {field.type}
                    </div>
                  );
              }
            })}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={!formValid || isSubmitting}
              className={`w-full rounded px-4 py-2 font-semibold transition
                ${(!formValid || isSubmitting)
                  ? 'opacity-60 cursor-not-allowed bg-gray-600'
                  : 'bg-[var(--blue)] hover:bg-[var(--lightblue)]'}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-400">{successMsg}</p>
            <button
              onClick={() => {
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
