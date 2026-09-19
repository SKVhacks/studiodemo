import React from 'react';
import { useNavigate } from 'react-router-dom';

const Button = ({ 
    link = null, 
    modal = null, 
    onClick = null,        // ← add this
    logo, 
    text, 
    bg, 
    textColor = 'text-white', 
    hoverBg, 
    tip = "", 
    disabled = null,
    hidden = false         // ← optional, for cleaner hiding
}) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        if (onClick) {
            onClick(e);            // ← runs your custom handler (with stopPropagation)
        } else if (link) {
            navigate(link);
        } else if (modal) {
            modal();
        }
    };

    if (hidden) return null;       // ← clean conditional render

    return (
        <button
            data-tip={tip}
            onClick={handleClick}
            disabled={disabled}
            //  inline-flex items-center gap-2 ${bg} ${textColor} ${hoverBg} px-3 py-2 text-sm sm:text-base md:text-md rounded-xl font-medium active:scale-95 hover:scale-105 transition-all duration-200 ease-in-out shadow-md cursor-pointer
            className={`
                flex items-center justify-center
                ${bg} ${textColor} ${hoverBg} ${hidden ? "hidden" : ""}
                px-2 py-2 lg:py-1.5
                rounded-xl
                ${logo ? "font-normal" : "font-medium"}
                 ${logo ? "text-sm sm:text-base md:text-lg" :"text-base"}
                shadow-md
                transition-all duration-200 ease-in-out
                active:scale-95 hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer
                `}
        >
            {logo && <span className="mr-1 text-lg sm:text-xl md:text-2xl">{logo}</span>}
            <span className='text-center'>{text}</span>
        </button>
    );
};

export default Button;