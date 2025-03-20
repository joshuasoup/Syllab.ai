interface UserSilhouetteProps {
  className?: string;
}

export const UserSilhouette = ({ className }: UserSilhouetteProps) => {
  return (
    <svg
      width="400"
      height="400"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M200 20C145 20 100 65 100 120C100 175 145 220 200 220C255 220 300 175 300 120C300 65 255 20 200 20ZM200 240C110 240 50 280 50 350V360C50 370 60 380 70 380H330C340 380 350 370 350 360V350C350 280 290 240 200 240Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="15"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}; 