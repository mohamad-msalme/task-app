import jwt from "jsonwebtoken";
import validator from "validator";
import mongoose, { Model } from "mongoose";
import { comparePassword, hashPassword } from "../utils/hash";

interface IToken {
  _id: mongoose.Types.ObjectId;
  token: string;
}

export interface User {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  age: number;
  password: string;
  tokens: IToken[];
}

interface UserStatics {
  findByCredentionals: (email: string, password: string) => Promise<User>;
}

interface UserMethod {
  generateToken: (id: string) => Promise<string>;
  test: () => void;
}

const tokenSchema = new mongoose.Schema<IToken>({
  token: {
    type: String,
    required: true,
  },
});

export const UserSchema = new mongoose.Schema<
  User,
  Model<User>,
  UserMethod,
  {},
  {},
  UserStatics
>(
  {
    name: {
      trim: true,
      require: true,
      type: "string",
    },
    email: {
      trim: true,
      type: "string",
      required: true,
      unique: true,
      validate: {
        validator: function (val: string) {
          const isValid = validator.isEmail(val);
          if (!isValid) {
            throw new Error();
          }
        },
        message: "Email is Invalid",
      },
    },
    password: {
      required: true,
      type: "string",
      minlength: 6,
      trim: true,
      validate: {
        validator: function (val: string) {
          if (val.toLocaleLowerCase() === "password") {
            throw new Error();
          }
        },
        message: "Password should not be as password",
      },
    },
    age: {
      type: "number",
      min: [18, "Age mut be more than 18"],
    },
    tokens: {
      type: [tokenSchema],
    },
  },
  {
    strict: "throw",
  }
);

UserSchema.pre("save", async function (next) {
  console.log("first");
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await hashPassword(this.password);
    this.password = hashedPassword!;
  } catch (error) {
    if (error instanceof Error) {
      return next(error); // Pass error if it's an instance of Error
    } else {
      return next(new Error("An error occurred")); // Create a new Error if not
    }
  }
  next();
});

UserSchema.statics.findByCredentionals = async function (email, password) {
  if (!email.trim() || !password.trim()) {
    throw new Error("Missing Email or password");
  }
  const user = await UserModel.findOne({
    email: email,
  });

  if (!user) {
    throw new Error("Email not founded");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid Credintional");
  }

  return user;
};

UserSchema.methods.generateToken = async (id) => {
  const token = await jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
  return token;
};

export const UserModel = mongoose.model("User", UserSchema);
