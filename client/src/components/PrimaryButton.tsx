interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const PrimaryButton = ({ children, onClick, className = "" }: PrimaryButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 border text-blue-400 rounded hover:bg-blue-500/10 transition font-medium ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
