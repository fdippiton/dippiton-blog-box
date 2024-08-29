import { format } from "date-fns";
import { Link } from "react-router-dom";
// import { formatISO9075 } from "date-fns";

/* This code snippet is defining a React functional component named `Post`. The component takes in
several props including `_id`, `title`, `summary`, `content`, `cover`, `createdAt`, and `author`.
Inside the component, it returns JSX that represents the structure of a post. */
export default function Post({
  _id,
  title,
  summary,
  content,
  cover,
  createdAt,
  author,
}) {
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={cover} />
        </Link>
      </div>
      <div className="texts">
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <a className="author">{author.username}</a>
          {/* <time>{formatISO9075(new Date(createdAt))}</time> */}
          <time>{format(new Date(createdAt), "MMM d, yyyy  HH:mm")}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}
