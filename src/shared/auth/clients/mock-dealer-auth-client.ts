import { DealerAuthError } from "@/shared/auth/auth-error";
import type { DealerAuthClient } from "@/shared/auth/clients/dealer-auth-client";
import type {
  DealerAccessState,
  DealerSession,
  DealerSignupPayload,
} from "@/shared/auth/auth-types";

type MockDealerRecord = {
  dealerId: string;
  email: string;
  password: string;
  accessState: DealerAccessState;
};

const mockDealerRecords = new Map<string, MockDealerRecord>();
let mockDealerSequence = 1;

function getDefaultAccessState(email: string): DealerAccessState {
  if (email.includes("signup")) {
    return "incomplete_signup";
  }

  if (email.includes("pending")) {
    return "pending_approval";
  }

  return "active";
}

function buildMockSession(record: MockDealerRecord): DealerSession {
  return {
    backend: "mock",
    dealerId: record.dealerId,
    email: record.email,
    accessState: record.accessState,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
  };
}

function getMockRecord(email: string) {
  return mockDealerRecords.get(email.toLowerCase());
}

function setMockRecord(payload: DealerSignupPayload) {
  const email = payload.email.toLowerCase();
  const record: MockDealerRecord = {
    dealerId: `mock-dealer-${String(mockDealerSequence).padStart(3, "0")}`,
    email,
    password: payload.password,
    accessState: "pending_approval",
  };

  mockDealerSequence += 1;
  mockDealerRecords.set(email, record);
  return record;
}

export const mockDealerAuthClient: DealerAuthClient = {
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase();
    const existingRecord = getMockRecord(normalizedEmail);

    if (existingRecord) {
      if (existingRecord.password !== password) {
        throw new DealerAuthError("비밀번호를 확인해주세요.", 401);
      }

      return buildMockSession(existingRecord);
    }

    return buildMockSession({
      dealerId: "mock-dealer-001",
      email: normalizedEmail,
      password,
      accessState: getDefaultAccessState(normalizedEmail),
    });
  },

  async signup(payload) {
    const normalizedEmail = payload.email.toLowerCase();
    if (getMockRecord(normalizedEmail)) {
      throw new DealerAuthError("이미 가입된 이메일입니다.", 409);
    }

    return buildMockSession(setMockRecord(payload));
  },

  async refreshSession(session) {
    const existingRecord = getMockRecord(session.email);
    if (existingRecord) {
      return buildMockSession(existingRecord);
    }

    return {
      ...session,
      accessState: getDefaultAccessState(session.email),
    };
  },

  async logout() {},
};
