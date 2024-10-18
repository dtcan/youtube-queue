const toastElement = document.getElementById('toast');
const toastText1Element = document.getElementById('toast-text-1');
const toastText2Element = document.getElementById('toast-text-2');
const toastImgElement = document.getElementById('toast-img');
const toasts = [];
let idle = true;

function showToast() {
    toastElement.style.opacity = 1;
    setTimeout(() => { hideToast(); }, 3000);
}

function hideToast() {
    toastElement.style.opacity = 0;
    setTimeout(() => { doNextToast(); }, 1010);
}

function doNextToast() {
    if (toasts.length > 0) {
        idle = false;
        toastImgElement.onload = () => { showToast(); }
        [toastText1Element.innerText, toastText2Element.innerText, toastImgElement.src] = toasts.splice(0, 1)[0];
    } else {
        idle = true;
    }
}

function addToast(text1, text2, img) {
    toasts.push([text1, text2, img]);
    if (idle) {
        doNextToast();
    }
}
