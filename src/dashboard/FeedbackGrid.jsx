'use client';
import FeedbackCard from './FeedbackCard';

export default function FeedbackGrid({ forms, setEmbedForm, setShareForm }) {
  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {forms.map((form) => (
        <FeedbackCard
          key={form._id}
          form={form}
          setEmbedForm={setEmbedForm}
          setShareForm={setShareForm}  
        />
      ))}
    </div>
  );
}
