/**
 * 一森貨運・可愛風貨物追蹤與四周貼圖系統
 */

document.addEventListener('DOMContentLoaded', () => {
  const particleEngine = new ParticleEngine('particle-canvas');
  window.particleEngine = particleEngine;
  initStickers(particleEngine);
});

// 14 款專屬去背貼圖檔名
const STICKER_FILES = [
  '26DE9CB5-26C7-4A0D-9D95-8A1CC92EB0C2.png',
  '2C5E278F-59EF-4479-912B-6065EF08C690.png',
  '33EBD65A-6AD1-4CFD-9AD5-B4AEF856B783.png',
  '38979736-AC34-42F4-B1EE-89779C72E7FB.png',
  '4A4B5A4D-8569-4902-B368-4E1682FAA408.png',
  '4C50EFB3-93F4-44C0-AD5B-B97682B8D1DB.png',
  'A0EF3547-D995-4903-853C-3589534624C6.png',
  'AAD7530C-BD5D-45D8-BCA3-E197F467D7B0.png',
  'AAF8EC29-7C7C-4F88-BF92-60FCD13A01B5.png',
  'BC65C0F2-DD60-4575-84C4-44A497786DFF.png',
  'C3AA6789-DF06-4BD8-A605-6E9AFFE5B1A0.png',
  'C80C4427-839B-40C3-A222-9EE90CF8E10D.png',
  'D4A0E80F-EDDC-40F0-8785-CED19DA2ABBE.png',
  'ECA5E6D6-1A4A-47EB-8871-0A1735FCE6A4.png'
];

// 四周優雅座標比例分佈 (x: 0~100%, y: 0~100%)
// 重新均勻分佈在中央追蹤卡片四周舒適空間
const STICKER_LAYOUT = [
  // 左翼 5 款貼圖（錯落波浪分佈）
  { x: 3,    y: 7,   rot: -7,  size: 120, anim: 'floatA' }, // 左上外角
  { x: 13.5, y: 24,  rot: 5,   size: 115, anim: 'floatB' }, // 左上內側
  { x: 3.5,  y: 44,  rot: -4,  size: 125, anim: 'floatC' }, // 左側正中
  { x: 13,   y: 63,  rot: 6,   size: 115, anim: 'floatA' }, // 左下內側
  { x: 3.5,  y: 80,  rot: -7,  size: 120, anim: 'floatB' }, // 左下外角

  // 右翼 5 款貼圖（錯落波浪分佈）
  { x: 88,   y: 7,   rot: 7,   size: 120, anim: 'floatC' }, // 右上外角
  { x: 77.5, y: 24,  rot: -5,  size: 115, anim: 'floatA' }, // 右上內側
  { x: 87.5, y: 44,  rot: 5,   size: 125, anim: 'floatB' }, // 右側正中
  { x: 78,   y: 63,  rot: -6,  size: 115, anim: 'floatC' }, // 右下內側
  { x: 88,   y: 80,  rot: 8,   size: 120, anim: 'floatA' }, // 右下外角

  // 頂部 2 款貼圖（卡片上方兩側）
  { x: 31,   y: 3,   rot: -4,  size: 110, anim: 'floatB' }, // 頂部偏左
  { x: 61,   y: 3,   rot: 5,   size: 110, anim: 'floatC' }, // 頂部偏右

  // 底部 2 款貼圖（卡片下方兩側）
  { x: 31,   y: 85,  rot: 6,   size: 115, anim: 'floatA' }, // 底部偏左
  { x: 61,   y: 85,  rot: -5,  size: 115, anim: 'floatB' }  // 底部偏右
];

function initStickers(particleEngine) {
  const container = document.getElementById('stickers-container');
  if (!container) return;

  const isMobile = window.innerWidth < 768;
  const stickerElements = [];

  STICKER_FILES.forEach((fileName, index) => {
    const layout = STICKER_LAYOUT[index] || { x: 50, y: 50, rot: 0, size: 120, anim: 'floatA' };
    
    // 手機版自動微縮尺寸，確保不遮擋
    const baseSize = isMobile ? Math.min(layout.size * 0.65, 85) : layout.size;

    const el = document.createElement('div');
    el.className = 'sticker-item';
    el.dataset.index = index;

    // 計算初始像素位置並進行安全邊界防溢出
    const posX = (window.innerWidth * layout.x) / 100;
    const posY = (window.innerHeight * layout.y) / 100;
    const maxPosX = Math.max(10, window.innerWidth - baseSize - 12);
    const maxPosY = Math.max(10, window.innerHeight - baseSize - 12);
    const clampedX = Math.min(maxPosX, Math.max(10, posX));
    const clampedY = Math.min(maxPosY, Math.max(10, posY));

    el.style.width = `${baseSize}px`;
    el.style.height = `${baseSize}px`;
    el.style.left = `${clampedX}px`;
    el.style.top = `${clampedY}px`;

    // 隨機動畫參數，讓呼吸浮動錯落有致
    const duration = 4.2 + (index % 4) * 0.8;
    const delay = -((index * 0.7) % 3);
    el.style.animation = `${layout.anim} ${duration}s ease-in-out ${delay}s infinite`;

    const img = document.createElement('img');
    img.src = `assets/stickers/${fileName}`;
    img.alt = `可愛貼圖 ${index + 1}`;
    img.draggable = false;

    el.appendChild(img);
    container.appendChild(el);
    stickerElements.push(el);

    // 互動事件綁定：拖曳 + 點擊愛心爆發
    bindStickerInteractions(el, particleEngine);
  });

  // 視窗縮放時適配
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const mobile = window.innerWidth < 768;
      stickerElements.forEach((el, index) => {
        const layout = STICKER_LAYOUT[index];
        const baseSize = mobile ? Math.min(layout.size * 0.65, 85) : layout.size;
        const posX = (window.innerWidth * layout.x) / 100;
        const posY = (window.innerHeight * layout.y) / 100;
        const maxPosX = Math.max(10, window.innerWidth - baseSize - 12);
        const maxPosY = Math.max(10, window.innerHeight - baseSize - 12);
        const clampedX = Math.min(maxPosX, Math.max(10, posX));
        const clampedY = Math.min(maxPosY, Math.max(10, posY));

        el.style.left = `${clampedX}px`;
        el.style.top = `${clampedY}px`;
        el.style.width = `${baseSize}px`;
        el.style.height = `${baseSize}px`;
      });
    }, 150);
  });
}

/**
 * 貼圖拖曳 (Pointer Events) 與點擊愛心粒子特效
 */
function bindStickerInteractions(element, particleEngine) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let hasMoved = false;

  element.addEventListener('pointerdown', (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;

    const rect = element.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    // 暫停浮動動畫以流暢拖曳
    element.style.animationPlayState = 'paused';
    element.style.zIndex = '100';
    element.setPointerCapture(e.pointerId);
  });

  element.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMoved = true;
    }

    element.style.left = `${initialLeft + dx}px`;
    element.style.top = `${initialTop + dy}px`;
  });

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    element.releasePointerCapture(e.pointerId);
    element.style.animationPlayState = 'running';
    element.style.zIndex = '15';

    // 如果沒有大幅移動，視為點擊 -> 噴發愛心粒子 + 彈跳
    if (!hasMoved) {
      triggerStickerClick(element, e.clientX, e.clientY, particleEngine);
    }
  };

  element.addEventListener('pointerup', handlePointerUp);
  element.addEventListener('pointercancel', handlePointerUp);
}

function triggerStickerClick(element, x, y, particleEngine) {
  // 粒子噴射
  particleEngine.burst(x, y, 20);

  // 彈跳動畫
  element.classList.remove('popping');
  // 強制重繪以重啟動畫
  void element.offsetWidth;
  element.classList.add('popping');

  setTimeout(() => {
    element.classList.remove('popping');
  }, 450);
}
