import mongoose from 'mongoose';

export const trackSourceSchema = mongoose.Schema({
  type: { type: String, required: true },
  mode: { type: String, required: true },
  label: { type: String, required: true },
  uri: { type: String, required: true },
});

export default mongoose.model('TrackSource', trackSourceSchema);
