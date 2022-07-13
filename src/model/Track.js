import mongoose from 'mongoose';

export const trackSchema = mongoose.Schema({
  type: { type: String, required: true },
  mode: { type: String, required: true },
  label: { type: String, required: true },
  option: [Number],
  uri: { type: [String], required: true },
});

export default mongoose.model('Track', trackSchema);
