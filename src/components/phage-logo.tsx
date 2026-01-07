import { cn } from "@/lib/utils";

const PhageLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path
        d="M12 2L8 6.5V11H16V6.5L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M11 11V14.5C11 15.8807 9.88071 17 8.5 17C7.11929 17 6 15.8807 6 14.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M13 11V14.5C13 15.8807 14.1193 17 15.5 17C16.8807 17 18 15.8807 18 14.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M6 14.5L3 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 14.5L21 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
       <path
        d="M12 11V21"
        stroke="currentColor"
        strokeWidth="2"
      />
       <path
        d="M8 21H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default PhageLogo;
