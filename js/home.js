//메인 페이지: 작품 10개를 먼저 조회하고, 더보기 클릭 시 다음 10개를 조회
import { supabase, escapeHTML, won } from "./common.js";

//html 요소를 변수에 저장
const list = document.querySelector("#featured");
const moreBtn = document.querySelector("#more-btn");
const PAGE_SIZE = 9; //한번에 가져올 작품 수
let nextStart = 0; //다음 조회가 시작되는 위치

//supabase에서 작품을 10개씩 가져오는 함수
async function loadFeatured() {
    //데이터가 불러오는 진행중에 보여지는 버튼 상태
    moreBtn.hidden = false; //데이터가 불러올 때는 버튼이 보여져야하기 때문에 hidden속성은 false
    moreBtn.disabled = true; //중복 클릭 방지
    moreBtn.textContent = '불러오는 중'

    //처음에는 0~9 / 다음은 10~ 19 - 데이터를 10개씩 불러오기
    const { data, error, count } = await supabase
        .from('artworks') //본인이 만든 테이블명
        .select('*', { count: 'exact' }) //exact-문법, 조건에 맞는 전체 작품 개수확인
        .order('id', { ascending: true })//ascending - 작은수에서 큰수로 정렬
        .range(nextStart, nextStart + PAGE_SIZE - 1);

    /* 
    range({시작위치},{마지막위치})
    .range(0,(0+9-1)8) -> 인덱스 0~8번까지 카드 로드
    */

    // 아래 3줄 추가
    console.log("데이터:", data);
    console.log("에러:", error);
    console.log("전체 개수:", count);

    if (error) {
        if (nextStart === 0) list.textContent = '작품을 불러오지 못했습니다.';
        else alert('추가작품 조회 실패: ' + error.message);
        moreBtn.hidden = false; //첫 조회 실패 시 다시 시도
        moreBtn.disabled = false;
        moreBtn.textContent = '다시 시도'
        return;
    }

    //처음 조회했는데 데이터가 없을 경우
    if (nextStart === 0) list.innerHTML = ''
    if (data.length === 0 && nextStart === 0) {
        list.textContent = '등록된 작품이 없습니다.';
        moreBtn.hidden = true;
        return
    }

    // 조회한 작품을 기존 카드 아래에 추가합니다.
    data.forEach((art) => {
        list.innerHTML +=
            `<a class="art-card" 
            href="detail.html?id=${encodeURIComponent(art.id)}">
            ${art.image_url ?
                `<img src="${escapeHTML(art.image_url)}" alt="${escapeHTML(art.title)}">`
                : '<div class="no-image">ART SPACE</div>'
            }
            <div class="art-info">
                <h3>${escapeHTML(art.title)}</h3>
                <p>${escapeHTML(art.artist)}</p>
                <strong>${won(art.price)}</strong>
            </div>
        </a>`;
    });

    //다음에는 이번에 가져온 개수만큼 뒤에서 시작
    //처음 nextStart가 0이고 작품을 9개 가져옴
    nextStart += data.length;
    //nextStart = nextStart + data.length
    //   9      = 0  + 9

    //모든 작품을 불러왔다면
    if (nextStart >= count || data.length === 0) {
        moreBtn.hidden = true; //더보기 버튼 숨김
    } else {
        moreBtn.hidden = false; //더보기 버튼 표시
        moreBtn.disabled = false;
        moreBtn.textContent = '더보기';
    }
}

//버튼을 누르면 다음 10개 조회
moreBtn.addEventListener('click', loadFeatured);
loadFeatured();

