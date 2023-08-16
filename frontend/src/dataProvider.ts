import { DataProvider, HttpError } from "react-admin";
import { get, post } from "./transport";

export const dataProvider: DataProvider = {
  getList: async (entity, options) => {
    const { filter, pagination } = options;
    const params: [string, string][] = [];
    if (filter.q) {
      params.push(["name", filter.q]);
    }
    if (pagination) {
      params.push(["limit", pagination.perPage.toString()]);
      params.push([
        "offset",
        (pagination.perPage * (pagination.page - 1)).toString(),
      ]);
    }
    const resp = await get(entity, localStorage.getItem("auth"), params);
    const { success, error, data } = await resp.json();
    if (!success) {
      throw new HttpError(error.message, error.code, {
        message: error.message,
      });
    }
    return { data: data[entity], total: data.count };
  },
  getOne: async (entity, { id }) => {
    const r = await get(`${entity}/${id}`, localStorage.getItem("auth"));
    const { success, error, data } = await r.json();
    if (!success) {
      throw new HttpError(error.message, error.code, {
        message: error.message,
      });
    }
    return { data };
  },

  getMany: () => Promise.reject("Not implemented"),
  getManyReference: () => Promise.reject("Not implemented"),

  create: async (entity, { data }) => {
    const r = await post(
      entity,
      localStorage.getItem("auth"),
      JSON.stringify(data),
    );
    const { success, error, data: responseData } = await r.json();
    if (!success) {
      throw new HttpError(error.message, error.code, {
        message: error.message,
      });
    }
    return { data: responseData };
  },

  update: () => Promise.reject("Not implemented"),
  updateMany: () => Promise.reject("Not implemented"),

  delete: () => Promise.reject("Not implemented"),
  deleteMany: () => Promise.reject("Not implemented"),
};
