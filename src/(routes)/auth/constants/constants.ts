import { env } from "../../../util/env";

export const DO_NOT_USE_OR_YOU_WILL_BE_FIRED_JWT_SECRET = {
  secret: env.JWT_SECRET,
};
