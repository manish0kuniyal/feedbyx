import { useState } from "react";
import { useThemeStore } from "../utils/themestore";
import FeedbackModal from "../admin/FeedbackModal"

export default function FormCard({ formId, formName, feedbacks }) {
  const [open, setOpen] = useState(false);
  const darkMode = useThemeStore((state) => state.darkMode);

  const avgRating =
    feedbacks.reduce((acc, fb) => acc + (parseInt(fb.responses.rating) || 0), 0) /
    (feedbacks.length || 1);

  const cardClasses = darkMode
    ? 'bg-[var(--dark)] border border-gray-700 text-[var(--white)]'
    : 'bg-white border border-gray-200 text-gray-900';

  const labelClasses = darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-500';
  const titleClasses = darkMode ? 'text-md font-bold text-[var(--white)] truncate' : 'text-md font-bold text-gray-800 truncate';
  const statClasses = darkMode ? 'mt-2 space-y-1 text-sm text-gray-300' : 'mt-2 space-y-1 text-sm text-gray-600';

  return (
    <>
      <div className={`${cardClasses} rounded-xl shadow p-5 flex flex-col justify-between transition hover:shadow-md w-full h-full`}>
        <div>
          <p className={labelClasses}>Form Name</p>
          <h2 className={titleClasses}>{formName}</h2>
          <p className={labelClasses}>Form ID</p>
          <h2 className={titleClasses}>{formId}</h2>

          <div className={statClasses}>
            <p>
              Responses: <strong>{feedbacks.length}</strong>
            </p>
            <p>
              Avg Rating: <strong>{avgRating.toFixed(1)} / 5</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-4 w-full bg-[var(--blue)] text-black font-bold py-2 rounded hover:opacity-90 transition"
        >
          View Responses
        </button>
      </div>

      {open && (
        <FeedbackModal
          formId={formId}
          formName={formName}
          feedbacks={feedbacks}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
