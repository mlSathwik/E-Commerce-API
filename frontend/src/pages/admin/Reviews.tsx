import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle2, Search } from 'lucide-react';
import { reviewApi } from '../../api/reviewApi.js';
import { Review } from '../../types/index.js';
import { formatDate } from '../../utils/formatters.js';
import { RatingStars } from '../../components/common/RatingStars.js';
import { Button } from '../../components/common/Button.js';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewApi.getAllReviewsAdmin();
      setReviews(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating !== 'ALL' && r.rating !== filterRating) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Customer Reviews</h1>
          <p className="text-xs text-gray-400 mt-1">Review feedback, rating breakdowns, and moderation</p>
        </div>

        {/* Filter by star rating */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Rating:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="ALL">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-3xl border border-gray-200/80 bg-white p-12 text-center text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900">
            No reviews match the selected filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Product: {rev.productName}
                  </span>
                  <RatingStars rating={rev.rating} size="sm" />
                </div>
                {rev.title && <h4 className="text-xs font-bold text-gray-900 dark:text-white">{rev.title}</h4>}
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span>Author: <strong className="text-gray-700 dark:text-gray-300">{rev.user?.name || 'Customer'}</strong></span>
                  <span>•</span>
                  <span>{formatDate(rev.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:border-gray-800 dark:hover:bg-rose-950/40"
                  title="Delete Review"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
