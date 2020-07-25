export interface SapphireDbErrorResponse {
  type: string;
  message: string;
  id: string;
  data: { [key: string]: any };
}
