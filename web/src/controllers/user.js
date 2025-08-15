import { api } from "@/controllers/config";

export default {
  async get(page, limit, textToMatch, sortBy, sort) {
    return await api
      .get(`users`, {
        crossdomain: true,
        params: {
          page,
          limit,
          textToMatch,
          sortBy,
          sort
        }
      })
      .then(res => {
        return res.data;
      })
      .catch(error => {
        // handle error
        console.error(error);
      });
  },
  async putAccess(userID, data) {
    return await api
      .put(`users/access/${userID}`, data)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        // handle error
        console.error(error);
      });
  },
  async getAccess(userID) {
    return await api
      .get(`users/access/${userID}`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        // handle error
        console.error(error);
      });
  },
  async getSections() {
    return await api
      .get(`users/access/sections`)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        // handle error
        console.error(error);
      });
  }
};
