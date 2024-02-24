import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { BASE_URL, options } from './api.js';

const gallery = document.querySelector('.gallery');
const searchInput = document.querySelector('input[name="searchQuery"]');
const searchForm = document.getElementById('search-form');

const lightbox = new SimpleLightbox('.lightbox', {
  captionsData: 'alt',
  captionDelay: 250,
});

let totalHits = 0;
let reachedEnd = false;

function createGallery(hits) {
  const markup = hits.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
    return `
      <a href="${largeImageURL}" class="lightbox">
        <div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy">
          <div class="info">
            <p class="info-item"><b>Likes</b> ${likes}</p>
            <p class="info-item"><b>Views</b> ${views}</p>
            <p class="info-item"><b>Comments</b> ${comments}</p>
            <p class="info-item"><b>Downloads</b> ${downloads}</p>
          </div>
        </div>
      </a>`;
  }).join('');

  gallery.insertAdjacentHTML('beforeend', markup);

  if (options.params.page * options.params.per_page >= totalHits) {
    if (!reachedEnd) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      reachedEnd = true;
    }
  }

  lightbox.refresh();
}

async function handleSubmit(e) {
  e.preventDefault();
  options.params.q = searchInput.value.trim();

  if (options.params.q === '') {
    return;
  }

  options.params.page = 1;
  gallery.innerHTML = '';
  reachedEnd = false;

  try {
    const response = await axios.get(BASE_URL, options);
    totalHits = response.data.totalHits;
    const { hits } = response.data;

    if (hits.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    } else {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      createGallery(hits);
    }

    searchInput.value = '';
  } catch (error) {
    Notify.failure(error);
  }
}

async function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight) {
    options.params.page += 1;

    try {
      const response = await axios.get(BASE_URL, options);
      const hits = response.data.hits;
      createGallery(hits);
    } catch (error) {
      Notify.failure(error);
    }
  }
}

searchForm.addEventListener('submit', handleSubmit);
window.addEventListener('scroll', handleScroll);
