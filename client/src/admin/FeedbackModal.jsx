import { FiX } from 'react-icons/fi';
import FeedbackList from './FeedbackList';

export default function FeedbackModal({ formId, feedbacks, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-xl font-bold mb-2 text-gray-800">Responses for Form: {formId}</h2>
        <p className="text-sm text-gray-500 mb-4">Total: {feedbacks.length}</p>

        <FeedbackList feedbacks={feedbacks} />
      </div>
    </div>
  );
}

