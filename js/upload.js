// [수업 목표] 이미지 미리보기 -> Storage 업로드 -> 작품 정보 DB 저장
import { supabase, getUser } from './common.js';

const form = document.querySelector('#upload-form');
const message = document.querySelector('#upload-message');
const fileInput = document.querySelector('#image');
const preview = document.querySelector('#preview');
let previewURL = ''; // 선택한 파일을 미리 보여줄 임시 주소

// 1. 파일 선택이 바뀌면(change) 이미지를 미리 보여줍니다.
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]; // files는 선택 파일 목록, [0]은 첫 번째 파일

    // 이전에 만든 임시 주소를 정리하여 불필요한 메모리 사용을 줄입니다.
    if (previewURL) URL.revokeObjectURL(previewURL);

    if (!file) { // 파일 선택을 취소했다면 미리보기를 숨깁니다.
        preview.hidden = true;
        previewURL = '';
        return;
    }

    previewURL = URL.createObjectURL(file); // 파일을 화면에 보여줄 임시 URL
    preview.src = previewURL; // img의 src에 주소 넣기
    preview.hidden = false; // hidden=false: 이미지 보이기
});

// 2. 작품 등록 버튼을 눌렀을 때 실행합니다.
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // 기본 폼 제출/새로고침 막기

    const user = await getUser(); // 현재 로그인한 회원 확인
    if (!user) {
        alert('로그인 후 등록할 수 있습니다.');
        location.href = 'login.html';
        return; // 이후 업로드 코드를 실행하지 않습니다.
    }

    const file = fileInput.files[0];
    if (!file) {
        message.textContent = '사진을 선택하세요.';
        return;
    }

    // includes(): 배열 안에 파일 형식이 포함되어 있는지 검사합니다.
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        message.textContent = 'JPG, PNG, WEBP 파일만 가능합니다.';
        return;
    }

    // file.size는 바이트(byte) 단위입니다.
    // 1KB = 1024바이트, 1MB = 1024×1024바이트
    // 3MB = 3×1024×1024 = 3,145,728바이트
    if (file.size > 3 * 1024 * 1024) {
        message.textContent = '3MB 이하의 이미지를 선택하세요.';
        return;
    }

    const button = form.querySelector('button');
    button.disabled = true; // 중복 업로드 방지
    message.textContent = '이미지를 업로드하는 중...';

    // 이미지 확장자 정하기: 기본 jpg, PNG/WEBP면 바꿉니다.
    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    if (file.type === 'image/webp') ext = 'webp';

    // user.id: 로그인한 회원의 고유 ID
    // crypto.randomUUID(): 서로 겹칠 가능성이 매우 낮은 임의 파일명 생성
    // 예: 회원ID/랜덤파일명.png
    const path = user.id + '/' + crypto.randomUUID() + '.' + ext;

    // Supabase Storage의 art-images 버킷에 실제 이미지 파일을 올립니다.
    const { error: uploadError } = await supabase.storage
        .from('artworks-images')
        .upload(path, file);

    if (uploadError) {
        console.error('Storage 업로드 오류:', uploadError);
        console.log('오류 메시지:', uploadError.message);
        console.log('상태 코드:', uploadError.statusCode);

        message.textContent =
            '이미지 업로드 실패: ' + uploadError.message;

        button.disabled = false;
        return;
    }

    // Public 버킷에 저장한 파일의 공개 URL을 만듭니다.
    // 주의: getPublicUrl은 파일이 실제로 보이는지 확인하는 함수는 아닙니다.
    const { data: urlData } = supabase.storage
        .from('artworks-images')
        .getPublicUrl(path);

    // artwork = 작품 1개를 표현하는 객체({ 키: 값, ... })
    const artwork = {
        user_id: user.id, // 작품 등록 회원 ID
        title: document.querySelector('#title').value.trim(),
        artist: document.querySelector('#artist').value.trim(),
        category: document.querySelector('#category').value,
        description: document.querySelector('#description').value.trim(),
        // input.value는 문자이므로 Number()로 숫자로 변환합니다.
        // 예: '15000' -> 15000
        price: Number(document.querySelector('#price').value),
        rental_price: Number(document.querySelector('#rental-price').value),
        image_url: urlData.publicUrl // Storage에 저장된 이미지 주소
    };

    // DB의 art_space 테이블에 작품 정보 한 행을 추가합니다.
    message.textContent = '작품 정보를 저장하는 중...';
    const { data, error: saveError } = await supabase
        .from('artworks')
        .insert(artwork);

    console.log('저장 데이터:', artwork);
    console.log('DB 저장 결과:', data);
    console.log('DB 저장 오류:', saveError);
    button.disabled = false;

    if (saveError) {
        // DB 저장에 실패했다면 Storage에 올라간 파일을 삭제 시도합니다.
        const { error: removeError } = await supabase.storage
            .from('artworks_image').remove([path]);
        message.textContent = '작품 등록 실패: ' + saveError.message;
        if (removeError) console.log('이미지 정리 실패:', removeError.message);
        return;
    }

    alert('작품 등록 완료!');
    location.href = 'gallery.html';
});
