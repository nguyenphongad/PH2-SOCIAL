const UserModel = require('../model/UserModel');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")




const loginUser = async (req, res)=>{
    const {username, password} = req.body;
    try {
        const checkUser = await UserModel.findOne({username: username})

        if(checkUser){
            const vad = await bcrypt.compare(password, checkUser.password);

            if(!vad){
                res.status(400).json({message:"PASSWORD KHÔNG CHÍNH XÁC"});
                return;
            }else{
                const token  = jwt.sign(
                    { username : checkUser.username, id:checkUser._id },
                    process.env.JWTKEY,
                    {expiresIn: "1h"}
                );
                res.status(200).json({ checkUser, token});
            }
        }else{
            res.status(400).json({message:"USER KHÔNG TỒN TẠI"});
        }

    } catch (error) {
            console.log("lỗi")
        res.status(500).json(error);
    }

}