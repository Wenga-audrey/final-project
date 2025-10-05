import React from "react";

export const Button = React.forwardRef(function Button({ variant = "primary", children, asChild, ...props }, ref) {
  const base =
    "px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 transition-colors";
  const variants = {
    primary: "bg-mindboost-green text-white hover:bg-green-700 focus:ring-green-400",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
  };

  if (asChild) {
    // When asChild is true, we render the child element directly with the button styles
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      className: `${base} ${variants[variant]} ${child.props.className || ''}`.trim(),
      ...props,
      ...child.props,
      ref,
    });
  }

  return (
    <button ref={ref} className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
});