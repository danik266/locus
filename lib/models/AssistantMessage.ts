import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IAssistantMessage extends Document {
  userId: Types.ObjectId;
  programId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

const AssistantMessageSchema = new Schema<IAssistantMessage>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  programId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, maxlength: 3000 },
}, { timestamps: true });

AssistantMessageSchema.index({ userId: 1, programId: 1, createdAt: -1 });

export const AssistantMessage: Model<IAssistantMessage> =
  mongoose.models.AssistantMessage || mongoose.model<IAssistantMessage>('AssistantMessage', AssistantMessageSchema);
