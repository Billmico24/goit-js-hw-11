export const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '41083144-606141e6a0dcd32f20e7b428c';

export const options = {
  params: {
    key: API_KEY,
    q: '',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: 1,
    per_page: 40,
  },
};