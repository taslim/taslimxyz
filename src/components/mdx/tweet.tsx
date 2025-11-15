import { Tweet as ReactTweet } from "react-tweet";

interface TweetProps {
  id: string;
}

export function Tweet({ id }: TweetProps) {
  return (
    <div className="not-prose my-6">
      <ReactTweet id={id} />
    </div>
  );
}
