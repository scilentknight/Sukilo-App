import { apiRequest } from "@/lib/api/api";

export async function listServices() {
  return apiRequest("/services");
}
