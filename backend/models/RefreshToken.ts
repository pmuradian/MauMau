import mongoose, { Schema, Types } from 'mongoose';

export interface IRefreshToken extends mongoose.Document {
  tokenHash: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// TTL index: MongoDB automatically deletes documents when expiresAt is reached
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
