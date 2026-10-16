import { supabase, escapeHTML, won } from './common.js';

const list = document.querySelector("#art-list");
const category = document.querySelector("#category");
const search = document.querySelector("#search");

/* 검색된 작품 개수를 출력 */
const resultCount = document.querySelector("#result-count");

let artworks = []; //조회한 작품을 보관할 배열

//화면에 작품 카드 출력
function showGallery() {
    const keyword = search.value.trim().toLowerCase(); //검색어의 빈 문자열을 제거(trim)/입력된 텍스트를 소문자로 변환(toLowerCase())
    const selected = category.value; //선택한 카테고리
    list.innerHTML = ''; //기존 카드 지우기
    let found = 0; //검색된 작품 수

    artworks.forEach((art) => {
        //'전체'가 아니면서 카테고리가 다르면 건너뜀
        if (selected !== '전체' && art.category !== selected) return;

        //제목이나 작가명에 검색어가 없으면 건너뜀
        const title = String(art.title || '').toLowerCase();
        const artist = String(art.artist || '').toLowerCase();
        if (!title.includes(keyword) && !artist.includes(keyword)) return;

        found += 1;
        let image = '<div class="no-image">ART WORKS</div>';
        if (art.image_url) {
            image = `
            <img src="${escapeHTML(art.image_url)}"
                alt="${escapeHTML(art.title)}">            
            `;
        }

        list.innerHTML += `
            <a class="art-card" href="detail.html?id=${art.id}">
            ${image}
            <div class="art-info">
                <span class="muted">${escapeHTML(art.category)}</span>
                <h3>${escapeHTML(art.title)}</h3>
                <p>${escapeHTML(art.artist)}</p>
                <strong>구매 ${won(art.price)}</strong>
                <small>월 대여 ${won(art.rental_price)}</small>
            </div>
        </a>`;
    })

    //검색 조건에 맞는 작품 개수를 화면에 출력
    resultCount.textContent = `검색 결과: ${found}개`;

    if (found === 0) {
        list.textContent = '검색 결과가 없습니다.'
    }
}

//supabase에서 작품 목록 조회
async function loadGallery() {
    const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        list.textContent = '조회오류: ' + error.message;
        return;
    }
    artworks = data; //결과배열 보관
    showGallery(); //첫 화면 출력
}
//입력이 바뀌면 목록 다시 출력
category.addEventListener('change', showGallery)
search.addEventListener('input', showGallery)
loadGallery(); //처음 한번 조회