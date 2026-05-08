export type UserRole = 'user' | 'artist' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  favoriteGenres: string[];
  role: UserRole;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: any;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
}

export interface ArtistDetails {
  userId: string;
  bannerURL?: string;
  biography?: string;
  monthlyListeners: number;
  ministryLinks: string[];
  donationLink?: string;
  featuredSongId?: string;
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  audioURL: string;
  coverURL?: string;
  duration?: number;
  genre: string;
  likesCount: number;
  playCount: number;
  createdAt: any;
  tags: string[];
}

export interface Short {
  id: string;
  videoURL: string;
  creatorId: string;
  creatorUsername: string;
  caption?: string;
  likesCount: number;
  commentsCount: number;
  hashtags: string[];
  thumbnailURL?: string;
  createdAt: any;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  mediaURL?: string;
  mediaType: 'image' | 'video' | 'none';
  bibleVerse?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
}

export interface Confession {
  id: string;
  content: string;
  type: 'confession' | 'prayer_request' | 'testimony';
  visibility: 'public' | 'private' | 'anonymous';
  prayersCount: number;
  supportsCount: number;
  isModerated: boolean;
  createdAt: any;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  coverURL?: string;
  creatorId: string;
  membersCount: number;
  category: string;
  createdAt: any;
}

export interface Message {
  id: string;
  communityId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  mediaURL?: string;
  type: 'text' | 'image' | 'audio';
  createdAt: any;
}

export interface Report {
  id: string;
  reporterId: string;
  contentId: string;
  contentType: 'post' | 'track' | 'short' | 'confession' | 'comment';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: any;
}

export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  type: 'donation' | 'subscription';
  status: 'completed' | 'pending';
  createdAt: any;
}
