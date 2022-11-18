import mongoose from 'mongoose';
import { trackSourceSchema } from './TrackSource';

export const trackSchema = mongoose.Schema({
  label: { type: String, required: true },
  sources: [trackSourceSchema],
});

export default mongoose.model('Track', trackSchema);
