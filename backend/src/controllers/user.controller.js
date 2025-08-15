import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefereshTokens = async (userId) =>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});

        return {accessToken , refreshToken};
    } catch(error){
        throw new ApiError(500,"Error while generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists in the database
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    const user = await User.create({
        username,
        email,
        password
    })

    const UserResponse = await User.findById(user._id).select("-password -refreshToken");
    if (!UserResponse) {
        throw new ApiError(500, "Error in creating user");
    }
    return res.status(201).json(
        new ApiResponse(200, UserResponse, "User registered Successfully")
    )
});

const loginUser = asyncHandler(async (req, res) => {
    const { username ,email , password } = req.body;
    if ((!username && !email) || !password) {
        throw new ApiError(400, "Username or Email and Password are required");
    }
    const user = await User.findOne({
        $or: [{ username } , { email }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordMatched = await user.isPasswordCorrect(password);
    if (!isPasswordMatched) {
        throw new ApiError(401, "Password is incorrect");
    }

    const {accessToken , refreshToken} = await generateAccessAndRefereshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true,
        sameSite: "None"
    }

    return res.status(200).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    );
});


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id , 
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true,
    }

    return res.status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(200, {} , "User logged out successfully")
    )
})

const getCurrentUser = async (req , res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "current User fetched succesfully"
        )
    )
}

export { registerUser , loginUser, logoutUser , generateAccessAndRefereshTokens , getCurrentUser };