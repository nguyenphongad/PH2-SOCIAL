import React from 'react'
import ClipLoader from "react-spinners/ClipLoader";

const LoadingText = ({size, color}) => {
    return (
        <span className="loading_text">
            <ClipLoader
                color={color || "#ffffff"}
                size={size}
                aria-label="Loading Spinner"
                data-testid="loader"
                className='loading_icon_text'
            />
        </span>
    )
}

export default LoadingText