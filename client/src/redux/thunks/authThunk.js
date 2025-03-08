import { createAsyncThunk} from "@reduxjs/toolkit";
import { post } from "../../services/api.service";
import ENDPOINT from "../../constants/endpoint";

export const loginUser = createAsyncThunk(
    "auth-login/user",
    async (credentials, {rejectWithValue})=>{
        try {
            const res = await post(ENDPOINT.LOGIN_USER, credentials);
            console.log(res.data)
            if(!res.data?.token){
                throw new Error("token khong hop le")
            }
            return res.data;
        } catch (error) {
            return rejectWithValue(error.errors);
        }
    }
)