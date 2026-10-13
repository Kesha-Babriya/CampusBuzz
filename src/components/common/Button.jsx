import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to = null,
  href = null,
  icon: Icon = null,
  iconPosition = 'right',
  className = '',
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyles = "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#070a12]";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5 font-semibold"
  }[size] || "text-sm px-4 py-2.5 gap-2";

  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 hover:shadow-glow-blue border border-blue-400/30 focus:ring-blue-500",
    secondary: "bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700/80 hover:border-slate-600 focus:ring-slate-500",
    cyan: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-glow-cyan border border-cyan-300/40 focus:ring-cyan-400",
    outline: "bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300 focus:ring-cyan-500",
    ghost: "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-600",
    danger: "bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-500/40 shadow-lg shadow-rose-600/20 focus:ring-rose-500"
  }[variant] || "";

  const content = (
    <>
      {Icon && iconPosition === 'left' && (
        <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} transition-transform group-hover:scale-110`} />
      )}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} transition-transform group-hover:translate-x-0.5`} />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
}
