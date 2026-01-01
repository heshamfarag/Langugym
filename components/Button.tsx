import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  // Base styles: rounded-2xl for friendly vibe, font-bold for clarity
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-2xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    // Action Green (Duolingo-ish)
    primary: "bg-green-500 hover:bg-green-400 text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-1",
    success: "bg-green-500 hover:bg-green-400 text-white border-b-4 border-green-700 active:border-b-0 active:translate-y-1",
    // Focus Blue (Quizlet-ish)
    secondary: "bg-sky-500 hover:bg-sky-400 text-white border-b-4 border-sky-700 active:border-b-0 active:translate-y-1",
    // Error/Danger
    danger: "bg-red-500 hover:bg-red-400 text-white border-b-4 border-red-700 active:border-b-0 active:translate-y-1",
    // Outline (Neutral)
    outline: "bg-white text-slate-500 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
    // Ghost (Minimal)
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};