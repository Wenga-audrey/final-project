import { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, className = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        // Remove non-numeric characters for calculation
        const end = parseInt(value.replace(/\D/g, ''), 10);

        // If value is not a number, display as is
        if (isNaN(end)) {
            setCount(value);
            return;
        }

        // Check if value has special formatting
        const hasPlus = value.includes('+');
        const hasPercent = value.includes('%');

        // Duration of animation in milliseconds
        const duration = 2000;
        // Number of steps
        const steps = 60;
        // Time per step
        const increment = end / steps;
        // Interval time
        const stepTime = duration / steps;

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                clearInterval(timer);
                // Format the final value
                let finalValue = end.toLocaleString();
                if (hasPlus) finalValue += '+';
                if (hasPercent) finalValue += '%';
                setCount(finalValue);
            } else {
                // Format the current value
                let currentValue = Math.floor(start).toLocaleString();
                if (hasPlus) currentValue += '+';
                if (hasPercent) currentValue += '%';
                setCount(currentValue);
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [value]);

    return <span className={className}>{count}</span>;
};

export default AnimatedCounter;