interface UserbackUserData {
  id: string;
  info: {
    name?: string;
    email?: string;
  };
}

interface Userback {
  access_token?: string;
  user_data?: UserbackUserData;
}

interface Window {
  Userback?: Userback;
}
