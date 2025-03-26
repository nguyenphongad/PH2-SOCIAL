import React from 'react'
import ClipLoader from "react-spinners/ClipLoader";

const LoadingButton = ({ size }) => {
    return (
        <span className="loading-container">
            <ClipLoader
                color={"#ffffff"}
                size={size}
                aria-label="Loading Spinner"
                data-testid="loader"
                className='loading_icon'
            />
        </span>
    );
};
export default LoadingButton