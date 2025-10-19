import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

function CommentSection({ taskId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/api/tasks/${taskId}/comments`);
      setComments(data.comments);
    } catch (error) {
      console.error('Failed to fetch comments');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await api.post(`/api/tasks/${taskId}/comments`, { comment: newComment });
      setNewComment('');
      fetchComments();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments</h3>
      
      <form onSubmit={handleAddComment} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows="3"
        />
        <button type="submit" disabled={loading || !newComment.trim()} className="btn-primary">
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="empty-state">No comments yet</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <strong>{comment.user_name}</strong>
                <span className="comment-date">{formatDate(comment.created_at)}</span>
              </div>
              <p className="comment-text">{comment.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
