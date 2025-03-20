export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: {
    url: string;
  };
  createdAt: string;
  updatedAt: string;
} 