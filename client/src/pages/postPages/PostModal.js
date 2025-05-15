import React, { useState } from 'react';
import { Modal, Upload, Button, message, Carousel } from 'antd';
import { PlusOutlined, LoadingOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { FaRegEdit, FaMapMarkerAlt, FaUserTag } from 'react-icons/fa';

const PostModal = ({ visible, onClose, user }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [postText, setPostText] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    
    // Kiểm tra trước khi upload
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Bạn chỉ có thể upload file ảnh!');
        }
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('Kích thước ảnh phải nhỏ hơn 10MB!');
        }
        return isImage && isLt10M;
    };

    // Xử lý thay đổi file uploads
    const handleChange = ({ fileList }) => setFileList(fileList);

    // Preview ảnh
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
    };

    // Chuyển file thành base64 để preview
    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // Xử lý đăng bài
    const handlePost = async () => {
        if (fileList.length === 0 && !postText.trim()) {
            message.warning('Vui lòng thêm ảnh hoặc nội dung cho bài viết!');
            return;
        }

        setUploading(true);
        
        try {
            // TODO: API call để đăng bài
            // const formData = new FormData();
            // fileList.forEach(file => {
            //     formData.append('files', file.originFileObj);
            // });
            // formData.append('content', postText);
            
            // Chờ 1 giây để mô phỏng quá trình đăng bài
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            message.success('Đăng bài viết thành công!');
            setFileList([]);
            setPostText('');
            onClose();
        } catch (error) {
            message.error('Đăng bài thất bại. Vui lòng thử lại!');
        } finally {
            setUploading(false);
        }
    };

    // Component nút mũi tên cho carousel
    const NextArrow = props => {
        const { className, style, onClick } = props;
        return (
            <div
                className={className}
                style={{
                    ...style,
                    color: "white",
                    fontSize: "20px",
                    lineHeight: "1",
                    right: "10px",
                    zIndex: 2
                }}
                onClick={onClick}
            >
                <ArrowRightOutlined />
            </div>
        );
    };

    const PrevArrow = props => {
        const { className, style, onClick } = props;
        return (
            <div
                className={className}
                style={{
                    ...style,
                    color: "white",
                    fontSize: "20px",
                    lineHeight: "1",
                    left: "10px",
                    zIndex: 2
                }}
                onClick={onClick}
            >
                <ArrowLeftOutlined />
            </div>
        );
    };

    const uploadButton = (
        <div>
            {uploading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Thêm ảnh</div>
        </div>
    );

    return (
        <>
            <Modal
                open={visible}
                title="Tạo bài viết mới"
                onCancel={onClose}
                footer={null}
                width="100%"
                style={{ top: 0, maxWidth: '100vw', margin: 0, padding: 0 }}
                bodyStyle={{ padding: 0, height: 'calc(100vh - 56px)' }}
                className="post-creation-modal"
                destroyOnClose
                maskClosable={false}
            >
                <div className="post-modal-content">
                    <div className="post-modal-media-section">
                        {fileList.length > 0 ? (
                            <div className="post-image-carousel-container">
                                <Carousel
                                    arrows
                                    prevArrow={<PrevArrow />}
                                    nextArrow={<NextArrow />}
                                >
                                    {fileList.map(file => (
                                        <div className="carousel-item" key={file.uid}>
                                            <img
                                                src={file.url || URL.createObjectURL(file.originFileObj)}
                                                alt="Post"
                                                className="carousel-image"
                                            />
                                            <div className="tag-overlay">
                                                <span>Nhấp vào ảnh để gắn thẻ mọi người</span>
                                            </div>
                                        </div>
                                    ))}
                                </Carousel>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                    beforeUpload={beforeUpload}
                                    multiple
                                    accept="image/*"
                                >
                                    {fileList.length >= 10 ? null : uploadButton}
                                </Upload>
                                <p>Kéo ảnh vào đây hoặc nhấn để chọn file</p>
                            </div>
                        )}
                    </div>

                    <div className="post-modal-form-section">
                        <div className="user-info">
                            <img src={user.profilePicture} alt={user.name} className="user-avatar" />
                            <div>
                                <strong>{user.name}</strong>
                                <span>@{user.username}</span>
                            </div>
                        </div>

                        <div className="post-textarea-container">
                            <textarea
                                placeholder="Viết gì đó về bài đăng của bạn..."
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                rows={6}
                            />
                        </div>

                        <div className="post-options">
                            <button className="option-btn">
                                <FaMapMarkerAlt /> Thêm vị trí
                            </button>
                            <button className="option-btn">
                                <FaUserTag /> Thêm cộng tác viên
                            </button>
                        </div>

                        <div className="post-actions">
                            <button
                                className="cancel-btn"
                                onClick={onClose}
                                disabled={uploading}
                            >
                                Huỷ
                            </button>
                            <button
                                className="post-btn"
                                onClick={handlePost}
                                disabled={uploading || (fileList.length === 0 && !postText.trim())}
                            >
                                {uploading ? 'Đang đăng...' : 'Chia sẻ'}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                visible={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default PostModal;
