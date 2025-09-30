
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStore } from '../utils/formstore';
export default function CreateForm() {
  const [title, setTitle] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/forms', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    router.push(`/form/${data.form.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create a New Feedback Form</h2>
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        placeholder="Form Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Create Form</button>
    </form>
  );
}
