/*
 * Twine API interface
 */
import _axios, { create } from 'axios';
import { pathOr, equals, evolve, map, filter } from 'ramda';
import qs from 'qs';
import { BirthYear } from '../shared/constants';

const baseURL = process.env.REACT_APP_API_HOST_DOMAIN ?
  `${process.env.REACT_APP_API_HOST_DOMAIN}/v1`
  : '/v1';

export const axios = create({
  baseURL,
  withCredentials: true,
  paramsSerializer: params => qs.stringify(params, { encode: false }),
  transformRequest: [evolve({ birthYear: BirthYear.fromDisplay })]
    .concat(_axios.defaults.transformRequest),
  transformResponse: _axios.defaults.transformResponse.concat(data =>
    data.result === null //eslint-disable-line
      ? data
      : Array.isArray(data.result)
        ? evolve({ result: map(evolve({ birthYear: BirthYear.toDisplay })) }, data)
        : evolve({ result: evolve({ birthYear: BirthYear.toDisplay }) }, data)),
});

export const Activities = {
  categories: () => axios.get('/visit_activity_categories'),

  get: params => axios.get('/community-businesses/me/visit-activities', { params }),

  create: ({ name, category } = {}) =>
    axios.post('/community-businesses/me/visit-activities', { name, category }),

  update: ({ id, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = {}) =>
    axios.put(`/community-businesses/me/visit-activities/${id}`, {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    }),

  delete: ({ id } = {}) =>
    axios.delete(`/community-businesses/me/visit-activities/${id}`),
};

export const Visitors = {
  genders: () => axios.get('/genders'),

  ethnicities: () => axios.get('/ethnicities'),

  disabilities: () => axios.get('/disabilities'),

  get: (opts, params) =>
    axios.get(`/community-businesses/me/visitors${opts && opts.id ? `/${opts.id}` : ''}`, { params }),

  search: ({ qrCode }) =>
    axios.post('/users/visitors/search', { qrCode }),

  create: (
    { name, gender, birthYear, email, phoneNumber, emailConsent, smsConsent, organisationId } = {},
  ) =>
    axios.post(
      '/users/register/visitors',
      filter(Boolean, {
        name,
        gender,
        birthYear,
        email,
        phoneNumber,
        emailConsent,
        smsConsent,
        organisationId,
      }),
    ),

  update: ({
    id,
    name,
    gender,
    birthYear,
    email,
    phoneNumber,
    isEmailConsentGranted,
    isSMSConsentGranted,
  } = {}) =>
    axios.put(
      `/community-businesses/me/visitors/${id}`,
      {
        name,
        gender,
        email,
        phoneNumber,
        birthYear,
        isEmailConsentGranted,
        isSMSConsentGranted,
      },
    ),

  sendQrCode: ({ id } = {}) =>
    axios.post(`/community-businesses/me/visitors/${id}/emails`, { type: 'qrcode' }),

  createVisit: ({ visitorId, activityId } = {}) =>
    axios.post(
      '/community-businesses/me/visit-logs',
      {
        userId: visitorId,
        visitActivityId: activityId,
      },
    ),
  addRole: ({ userId, organisationId, role, token } = {}) =>
    axios.post('/users/register/confirm', { userId, organisationId, role, token }),
};

export const CbAdmin = {
  get: params =>
    axios.get('/users/me', { params }),

  update: ({ email } = {}) =>
    axios.put('/users/me', { email }),

  login: ({ email, password } = {}) =>
    axios.post('/users/login', { email, password, type: 'cookie', restrict: 'CB_ADMIN' }),

  logout: () =>
    axios.get('/users/logout'),

  forgotPassword: ({ email } = {}) =>
    axios.post('/users/password/forgot', { email, redirect: 'VISITOR_APP' }),

  resetPassword: ({ email, password, passwordConfirm, token } = {}) =>
    axios.post('/users/password/reset', { email, password, passwordConfirm, token }),

};

export const CommunityBusiness = {
  sectors: () => axios.get('/sectors'),

  regions: () => axios.get('/regions'),

  get: params => axios.get('/community-businesses/me', { params }),

  getVisits: params => axios.get('/community-businesses/me/visit-logs', { params }),

  getVisitAggregates: params => axios.get('/community-businesses/me/visit-logs/aggregates', { params }),

  getActivities: () => axios.get('/visit-activity-categories'),

  update: async ({ name, sector, region, logoUrl } = {}) =>
    axios.put('/community-businesses/me', { name, sector, region, logoUrl }),

  getFeedback: (since, until) =>
    axios.get('/community-businesses/me/feedback/aggregates', {
      params: {
        since: since ? since.toISOString() : undefined,
        until: until ? until.toISOString() : undefined,
      },
    }),

  postFeedback: score =>
    axios.post(
      '/community-businesses/me/feedback',
      { feedbackScore: score },
    ),
};

export const Roles = {
  get: () => axios.get('/users/me/roles'),
};

export const Cloudinary = {
  UPLOAD_URL: 'https://api.cloudinary.com/v1_1/dqzxe8mav/upload',
  UPLOAD_PRESET: 'cklrrn9k',

  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', Cloudinary.UPLOAD_PRESET);

    return _axios.post(Cloudinary.UPLOAD_URL, form);
  },
};

export const ErrorUtils = {
  getErrorStatus: pathOr(null, ['response', 'status']),
  getValidationErrors: pathOr({ general: ['Unknown error'] }, ['response', 'data', 'error', 'validation']),
  getErrorMessage: pathOr({ general: ['Unknown error'] }, ['response', 'data', 'error', 'message']),
  errorStatusEquals: (error, status) => equals(ErrorUtils.getErrorStatus(error), status),
};

export const ResponseUtils = {
  getResponse: (obj, maybeArray = []) => pathOr(null, ['data', 'result', ...maybeArray], obj),
};
