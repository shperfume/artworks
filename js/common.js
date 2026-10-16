//모든 페이지에서 공통으로 사용하는 Supabase 연결과 로그인 상태 처리
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// HTML 문자를 그대로 출력해 스크립트가 실행되지 않도록 처리합니다.
export function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
}

// 숫자를 한국 원화 표시로 바꿉니다.
export function won(value) { return Number(value || 0).toLocaleString('ko-KR') + '원'; }

//로그인 사용자 정보 확인-로그인하지 않은 경우 null 반환
export async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
}

//로그인 여부에 따라 상단 메뉴 변경
//index.html을 포함한 모든 페이지 공통 적용
export async function updeteNav() {
    const nav = document.querySelector("#account-nav");

    if (!nav) return;

    //현제 로그인 사용자 확인
    const user = await getUser();
    console.log('user', user)

    if (!user) {
        //로그인 전
        nav.innerHTML = '<a href="login.html">로그인/회원가입</a>'
        return;
    }

    //로그인 후
    nav.innerHTML = `
    <button type='button' id='logout-btn' class='text-button'>로그아웃</button>
    `

    // 로그아웃 버튼 클릭 시 실행
    const logoutBtn = document.querySelector('#logout-btn');
    logoutBtn.addEventListener('click', async () => {
        logoutBtn.disabled = true; // 중복 클릭 방지
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert('로그아웃 실패: ' + error.message);
            logoutBtn.disabled = false;
            return;
        }

        // 로그아웃 후 메인 페이지를 다시 열어 메뉴 갱신
        location.href = 'index.html';
    });
}
updeteNav()