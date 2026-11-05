import { authRequest } from "./api/auth";

/** Start a session-bound step-up challenge after re-checking the password. */
export function requestStepUp(password, actionClass, localeCode = "en") {
  return authRequest("/api/v1/auth/step-up/request", {
    method: "POST",
    body: JSON.stringify({
      password,
      action_class: actionClass,
      locale_code: localeCode,
    }),
  });
}

/** Verify the step-up OTP and return the opaque grant sent with actions. */
export function verifyStepUp(challengeId, code, actionClass) {
  return authRequest("/api/v1/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({
      challenge_id: challengeId,
      purpose: "STEP_UP",
      code,
      action_class: actionClass,
    }),
  });
}
