import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
  score: number;
  reviewCount?: number;
  onClick?: () => void;
}

const StarRating = ({ score, reviewCount, onClick }: StarRatingProps) => {
  if (isNaN(score)) score = 0;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (score >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (score >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400" />);
    }
  }

  return (
    <div
      className={`flex items-center gap-2 mt-1 ${
        onClick ? "cursor-pointer hover:opacity-80 transition" : ""
      }`}
      onClick={onClick}
      title={onClick ? "Apasă pentru a vedea toate recenziile" : undefined}
    >
      <div className="flex space-x-1">{stars}</div>
      <span className="text-sm text-gray-300">
        {score.toFixed(1)}/5.0
        {reviewCount !== undefined ? ` (${reviewCount} recenzii)` : ""}
      </span>
    </div>
  );
};

export default StarRating;
