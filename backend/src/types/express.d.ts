import { JwtPayload, ListQuery } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      listQuery?: ListQuery;
    }
  }
}
