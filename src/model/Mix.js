import mongoose from 'mongoose';

import { trackSchema } from './Track';

const mixSchema = mongoose.Schema({
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  tracks: [trackSchema],
});

export default mongoose.model('Mix', mixSchema);
