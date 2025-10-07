export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  onboardingStep: string;
  isOnboardingComplete: boolean;
  role: string;
  phoneNumber: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: string;
  accessRole: string;
  timingStatus: string;
  totalTicketsPurchased: string;
  totalBuyers: string;
}

export interface EventsResponse {
  items: Event[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiError {
  message: string;
  cause?: string;
  statusCode?: number;
}

export interface EventSummary {
  totals: {
    sold: number;
    scanned: number;
    unscanned: number;
  };
  byTicket: TicketSummary[];
}

export interface TicketSummary {
  ticketId: string;
  ticketName: string;
  type: string;
  sold: number;
  scanned: number;
  unscanned: number;
}

export interface TicketTypeCardProps {
  title: string;
  scanned: number;
  total: number;
}

export interface ResetPasswordInitiateRequest {
  email: string;
}

export interface ResetPasswordInitiateResponse {
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
}

export interface ResetPasswordSubmitRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordSubmitResponse {
  message: string;
  success?: boolean;
}
