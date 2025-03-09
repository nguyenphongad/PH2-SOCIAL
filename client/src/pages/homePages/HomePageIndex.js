import React from 'react'

const HomePageIndex = () => {


    const PostItem = ()=>{
        return (
            <div className='post_item'>
                post
            </div>
        )
    }


    return (
        <div className='container_post'>
            <div className='box_post'>
                <PostItem/>
                <PostItem/>
                <PostItem/>
                <PostItem/>
                <PostItem/>
            </div>
            <div className='box_ads'>
                ads
            </div>
        </div>
    )
}

export default HomePageIndex