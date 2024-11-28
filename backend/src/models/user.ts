import mongoose from 'mongoose';

type TToken = {
  token: string;
}

interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: TToken[];
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  tokens: {
    type: [{
      token: {
        type: String,
      },
    }],
  },
});

const userModel = mongoose.model<IUser>('User', userSchema);

export default userModel;
