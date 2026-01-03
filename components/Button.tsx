import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  
  const baseStyles = "font-extrabold uppercase tracking-wide py-3 px-6 rounded-2xl transition-all active:translate-y-1 active:shadow-none border-b-4";
  
  const variants = {
    primary: "bg-brand-sky border-blue-600 text-white hover:bg-blue-400 shadow-blue-200",
    secondary: "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-gray-200",
    success: "bg-brand-green border-green-600 text-white hover:bg-green-400 shadow-green-200",
    danger: "bg-brand-red border-red-600 text-white hover:bg-red-400 shadow-red-200",
    outline: "bg-transparent border-2 border-brand-blue text-brand-blue border-b-2 hover:bg-brand-blue/10"
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