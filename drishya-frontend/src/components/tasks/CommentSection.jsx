import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { formatRelativeTime } from '../../utils/formatters';

function CommentSection({ taskId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/tasks/${taskId}/comments`);
      // Normalize response
      const commentList = data.comments || data || [];
      setComments(Array.isArray(commentList) ? commentList : []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post(`/api/tasks/${taskId}/comments`, { 
        comment: newComment.trim() 
      });
      
      // Optimistically update UI with new comment
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const newCommentObj = {
        id: response.data.id || Date.now().toString(),
        comment: newComment.trim(),
        user_name: user.name || 'You',
        created_at: new Date().toISOString()
      };
      
      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      toast.success('Comment added ✅');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error(error.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-section" style={{ marginTop: '32px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
        Comments ({comments.length})
      </h3>
      
      <form onSubmit={handleAddComment} style={{ marginBottom: '24px' }}>
        <div className="form-group">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
            disabled={submitting}
            aria-label="Add comment"
          />
        </div>
        <button 
          type="submit" 
          disabled={submitting || !newComment.trim()} 
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {submitting && <span className="spinner" style={{ width: '16px', height: '16px' }}></span>}
          {submitting ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      <div className="comments-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
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
                  {comment.created_at ? formatRelativeTime(comment.created_at) : 'Just now'}
                </span>
              </div>
              <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
                {comment.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
