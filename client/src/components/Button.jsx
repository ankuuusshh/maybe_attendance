import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`custom-btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="btn-spinner animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="btn-icon" />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="btn-icon" />}
        </>
      )}
    </button>
  );
};

export default Button;
