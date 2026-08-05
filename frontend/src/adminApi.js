import axios from "axios";

const TOKEN_KEY = "admin_token";

export function setAdminToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

const client = axios.create({ baseURL: "/api", timeout: 15000 });

client.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      setAdminToken(null);
    }
    return Promise.reject(error);
  }
);

export async function fetchAdminParts({ search = "", onlyEdited = false, page = 1, pageSize = 50 } = {}) {
  const { data } = await client.get("/admin/parts", {
    params: { search: search || undefined, only_edited: onlyEdited, page, page_size: pageSize },
  });
  return data;
}

export async function fetchAdminPart(id) {
  const { data } = await client.get(`/admin/parts/${id}`);
  return data;
}

export async function updatePartContent(id, payload) {
  const { data } = await client.patch(`/admin/parts/${id}`, payload);
  return data;
}

export async function revertToSync(id) {
  const { data } = await client.post(`/admin/parts/${id}/revert-to-sync`, { confirm: true });
  return data;
}

export async function uploadImage(id, file, setAsPrimary = false) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post(
    `/admin/parts/${id}/images/upload?set_as_primary=${setAsPrimary}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function addImageByUrl(id, url, setAsPrimary = false) {
  const { data } = await client.post(`/admin/parts/${id}/images/by-url`, {
    url, set_as_primary: setAsPrimary,
  });
  return data;
}

export async function deleteImage(id, imageUrl) {
  const { data } = await client.delete(`/admin/parts/${id}/images`, {
    params: { image_url: imageUrl },
  });
  return data;
}

export async function reorderImages(id, images) {
  const { data } = await client.put(`/admin/parts/${id}/images/reorder`, { images });
  return data;
}

export async function fetchAuditLog(id) {
  const { data } = await client.get(`/admin/parts/${id}/audit-log`);
  return data;
}
