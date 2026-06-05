import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    partnerId?: string;
    partnerCode?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      partnerId?: string;
      partnerCode?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    partnerId?: string;
    partnerCode?: string;
  }
}
