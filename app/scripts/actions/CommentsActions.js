export function addComment(comment) {
  return {
    type: 'NEW_COMMENT',
    comment: comment
  };
}
