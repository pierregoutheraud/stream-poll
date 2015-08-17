export default function newComment(state = null, action) {

  let { comment } = action;

  switch (action.type) {
    case 'NEW_COMMENT':
      return comment;
    default:
      return state;
  }

}
