import MarkdownPreview from "@uiw/react-markdown-preview";
import Loader from "./Loader";

const Review = ({
  isGenerating,
  review,
}: {
  isGenerating: boolean;
  review: string;
}) => {
  return (
    <div className="relative h-full w-6/12 overflow-scroll">
      {isGenerating ? (
        <Loader />
      ) : (
        <MarkdownPreview
          source={review}
          style={{ padding: "16px", fontSize: "20px", minHeight: "100vh" }}
        />
      )}
    </div>
  );
};

export default Review;
