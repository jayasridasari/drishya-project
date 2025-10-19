import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { formatRelativeTime } from '../../utils/formatters';

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
    <div className="comment-section" style={{ marginTop: '32px' }}>
      <h3 style={{ marginBottom: '16px' }}>Comments</h3>
      
      <form onSubmit={handleAddComment} style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
          />
        </div>
        <button type="submit" disabled={loading || !newComment.trim()} className="btn-primary">
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="empty-state">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} style={{ 
              background: 'var(--bg-secondary)', 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{comment.user_name}</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {formatRelativeTime(comment.created_at)}
                </span>
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: '1.6' }}>{comment.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
