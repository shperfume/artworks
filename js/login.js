import { supabase } from "./common.js";

//html 요소
const form = document.querySelector("#auth-form");
const message = document.querySelector("#message");

//submit: 폼의 확인 버튼을 누르면 실행되는 이벤트
//async: 이 함수 안에서 await(서버 응답 기다리기)를 사용
form.addEventListener('submit', async (event) => {
    //기본동작 (폼 전송 후 페이지 이동/새로고침)을 막아줌
    event.preventDefault();

    //.value는 사용자가 입력한 값. trim() 앞뒤공백 제거
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    //input[name='mode']:checked =>로그인/회원가입 중 선택된 라디오 버튼
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const button = form.querySelector('button');

    button.disabled = true; //요청 중 여러번 클릭 못하게 함
    message.textContent = '처리 중입니다....';

    //let -> 조건에 따라서 다른 결과를 저장하기 때문에.
    let result;

    if (mode === 'signup') {
        result = await supabase.auth.signUp({ email, password });
        //회원가입:{email,password}는 {email:email, password:password}의 줄인말
    } else {
        //로그인: 이미 가입한 이메일과 비밀번호를 확인
        result = await supabase.auth.signInWithPassword({ email, password });
    }
    button.disabled = false; //서버 응답이 다시 활성화

    //오류가 있으면 오류 메세지 표시하고 함수 종료
    if (result.error) {
        message.textContent = result.error.message;
        return;
    }
    location.href = 'index.html'

})