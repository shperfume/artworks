import { supabase, won } from './common.js';

const message = document.querySelector('#detail-message');
const content = document.querySelector('#detail-content');
const image = document.querySelector('#art-image');
const imagePlaceholder = document.querySelector('#image-placeholder');

function showError(text) {
    message.textContent = text;
}

async function loadArtwork() {
    const id = new URLSearchParams(location.search).get('id');
    if (!id || !/^[1-9]\d*$/.test(id)) {
        showError('작품 ID가 올바르지 않습니다.');
        return;
    }

    const { data: artwork, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        showError('작품 정보를 불러오지 못했습니다: ' + error.message);
        return;
    }

    if (!artwork) {
        showError('해당 작품을 찾을 수 없습니다.');
        return;
    }

    document.querySelector('#art-title').textContent = artwork.title || '';
    document.querySelector('#art-category').textContent = artwork.category || '';
    document.querySelector('#art-artist').textContent = artwork.artist || '';
    document.querySelector('#art-description').textContent =
        artwork.description || '등록된 설명이 없습니다.';
    document.querySelector('#art-price').textContent = won(artwork.price);
    document.querySelector('#art-rental-price').textContent = won(artwork.rental_price);

    if (artwork.image_url) {
        image.alt = artwork.title || '작품 이미지';
        image.hidden = false;
        imagePlaceholder.hidden = true;
        image.addEventListener('error', () => {
            image.hidden = true;
            imagePlaceholder.hidden = false;
        }, { once: true });
        image.src = artwork.image_url;
    }

    document.title = `${artwork.title || '작품 상세'} || ARTWORKS`;
    message.hidden = true;
    content.hidden = false;
}

loadArtwork();
