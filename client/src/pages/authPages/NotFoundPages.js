import React from 'react'
import image_404 from "../../assets/404.png"


const NotFoundPages = () => {
    return (
        <div style={{ width: "100%",height:"70vh", display:"flex", justifyContent:"center",alignItems:"center" }}>
            <div style={{textAlign:"center"}}>

                <img src={image_404} alt="not found 404" />
                <h2>Liên kết bạn theo dõi có thể bị hỏng hoặc trang này có thể đã bị gỡ.</h2>
            </div>
        </div>
    )
}

export default NotFoundPages