import mongoose from 'mongoose';

export const linkedSongSchema = mongoose.Schema({
  name: { type: String, required: true },
  uri: { type: String, required: true },
  before: { type: String },
  after: { type: String },
});

export default mongoose.model('LinkedSong', linkedSongSchema);
