// --- 1. 导航切换逻辑 ---
/**
 * 导航跳转函数：实现页面内板块切换、导航高亮与页面置顶
 * @param {string} pageId - 目标板块的ID（对应HTML中section的id属性）
 */
function navTo(pageId) {
    // 隐藏所有页面板块：移除所有.page-section类元素的active类（active类控制板块显示/隐藏）
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    // 移除所有导航项的高亮状态：移除.nav-links下所有li元素的active类
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    
    // 显示目标板块：为对应ID的板块添加active类，使其可见
    document.getElementById(pageId).classList.add('active');
    
    // 导航高亮逻辑 (简单匹配)
    // 备注：此处为演示简化写法，直接给点击事件目标添加高亮，实际项目可通过dataset属性精准匹配
    event.target.classList.add('active');
    
    // 页面滚动到顶部：切换板块后自动回到视口最上方，提升用户体验
    window.scrollTo(0, 0);
}

// --- 2. Canvas 动画：靛蓝花瓣飘落 ---
// 获取Canvas DOM元素：用于绘制靛蓝花瓣飘落的动态背景
const canvas = document.getElementById('bgCanvas');
// 获取Canvas 2D绘图上下文：所有画布绘制操作的核心对象
const ctx = canvas.getContext('2d');

/**
 * 调整Canvas尺寸函数：使Canvas适配窗口视口大小
 * 保证画布宽高始终与浏览器窗口一致，避免出现空白或裁剪
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;  // 设置Canvas宽度为窗口可视宽度
    canvas.height = window.innerHeight; // 设置Canvas高度为窗口可视高度
}
// 监听窗口大小变化事件：窗口缩放时重新调整Canvas尺寸
window.addEventListener('resize', resizeCanvas);
// 页面初始化时执行一次：确保加载完成后Canvas尺寸正确
resizeCanvas();

// 花瓣粒子数组：用于存储所有花瓣实例，统一管理和渲染
const particles = [];

/**
 * 花瓣类（Petal）：定义单个花瓣的属性和行为
 * 包含花瓣的位置、大小、移动速度、旋转状态等属性，以及更新和绘制方法
 */
class Petal {
    // 构造函数：初始化单个花瓣的所有属性
    constructor() {
        this.x = Math.random() * canvas.width; // 初始化x坐标：随机分布在Canvas宽度范围内
        this.y = Math.random() * canvas.height - canvas.height; // 初始化y坐标：从Canvas上方外部开始（实现从顶部飘落效果）
        this.size = Math.random() * 4 + 2; // 初始化花瓣大小：随机2~6像素
        this.speedY = Math.random() * 1.5 + 0.5; // 初始化垂直下落速度：随机0.5~2像素/帧
        this.speedX = Math.random() * 2 - 1; // 初始化水平移动速度：随机-1~1像素/帧（实现左右浮动效果）
        this.rotation = Math.random() * 360; // 初始化旋转角度：随机0~360度（初始角度随机）
        this.rotationSpeed = Math.random() * 2 - 1; // 初始化旋转速度：随机-1~1度/帧（旋转方向随机）
    }

    // 花瓣状态更新方法：每一帧更新花瓣的位置和旋转角度
    update() {
        this.y += this.speedY; // 垂直方向下落：累加y轴速度
        // 水平方向移动：结合正弦函数实现波浪形移动，叠加基础水平速度，模拟自然飘落
        this.x += Math.sin(this.y * 0.01) + this.speedX * 0.2;
        this.rotation += this.rotationSpeed; // 更新旋转角度：累加旋转速度

        // 花瓣超出Canvas底部时重置位置：实现循环飘落效果，避免粒子耗尽
        if (this.y > canvas.height) {
            this.y = -10; // 重置y坐标到Canvas上方外部
            this.x = Math.random() * canvas.width; // 重新随机分配x坐标
        }
    }

    // 花瓣绘制方法：在Canvas上绘制当前状态的花瓣
    draw() {
        ctx.save(); // 保存当前绘图状态（平移、旋转前的原始状态）
        ctx.translate(this.x, this.y); // 将绘图原点平移到花瓣的当前坐标
        ctx.rotate(this.rotation * Math.PI / 180); // 将画布旋转对应角度（角度值转换为弧度值）

        // 绘制花瓣形状：使用贝塞尔曲线绘制对称的花瓣路径
        ctx.beginPath();
        ctx.moveTo(0, 0); // 路径起始点
        ctx.bezierCurveTo(5, -5, 10, 0, 0, 10); // 绘制右侧花瓣轮廓
        ctx.bezierCurveTo(-10, 0, -5, -5, 0, 0); // 绘制左侧花瓣轮廓，闭合路径
        ctx.fillStyle = "rgba(100, 149, 237, 0.6)"; // 设置花瓣填充颜色：浅靛蓝色（半透明）
        ctx.fill(); // 填充路径，绘制出花瓣实体
        ctx.restore(); // 恢复之前保存的绘图状态，避免影响其他花瓣绘制
    }
}

// 初始化花瓣粒子：创建40个花瓣实例并添加到粒子数组中
for(let i=0; i<40; i++) particles.push(new Petal());

/**
 * 动画循环函数：实现花瓣飘落的连续流畅动画
 * 使用requestAnimationFrame实现浏览器原生优化的帧动画
 */
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空整个Canvas画布，准备绘制下一帧
    // 遍历所有花瓣粒子，依次执行状态更新和绘制
    particles.forEach(p => {
        p.update(); // 更新花瓣的位置和旋转状态
        p.draw();   // 在新位置绘制花瓣
    });
    requestAnimationFrame(animate); // 请求浏览器绘制下一帧，形成无限动画循环
}
animate(); // 启动花瓣飘落动画

// --- 3. Lightbox 交互 ---
/**
 * 打开图片放大预览（Lightbox）
 * @param {string} src - 目标图片的路径（src属性值）
 */
function openLightbox(src) {
    document.getElementById('lb-img').src = src; // 设置预览图片的路径
    document.getElementById('lightbox').style.display = 'flex'; // 显示Lightbox遮罩（flex布局实现图片居中）
}

/**
 * 关闭图片放大预览（Lightbox）
 */
function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none'; // 隐藏Lightbox遮罩
}

// --- 4. Accordion 手风琴交互 ---
/**
 * 手风琴面板切换函数：控制面板的展开与折叠
 * @param {HTMLElement} header - 被点击的手风琴头部元素
 */
function toggleAcc(header) {
    header.classList.toggle('active'); // 切换头部的active类，标记当前展开/折叠状态
    let body = header.nextElementSibling; // 获取头部对应的面板内容体元素

    // 判断当前面板是否处于展开状态
    if (body.style.maxHeight) {
        body.style.maxHeight = null; // 折叠面板：移除maxHeight限制，隐藏内容
        header.querySelector('span').innerText = '+'; // 切换头部右侧符号为“+”（表示可展开）
    } else {
        // 展开面板：设置maxHeight为内容体的滚动高度，实现完整显示
        body.style.maxHeight = body.scrollHeight + "px";
        header.querySelector('span').innerText = '-'; // 切换头部右侧符号为“-”（表示可折叠）
    }
}

// --- 5. Scroll Reveal 滚动监听特效 ---
/**
 * 创建交叉观察器（IntersectionObserver）
 * 用于监听元素是否进入浏览器视口，实现滚动显示动画
 * @param {Array} entries - 被观察元素的状态数组
 * @param {Object} options - 观察器配置：threshold为0.1表示元素可见比例达到10%时触发回调
 */
const observer = new IntersectionObserver((entries) => {
    // 遍历所有被观察的元素
    entries.forEach(entry => {
        // 判断元素是否进入视口（isIntersecting为true表示进入视口）
        if (entry.isIntersecting) {
            entry.target.classList.add('show'); // 为元素添加show类，触发滚动显示动画
        }
    });
}, { threshold: 0.1 });

// 定时器确保在页面切换后也能获取到元素
// 每500毫秒执行一次，重新获取所有时间轴项并添加观察，适配页面导航切换后的元素状态
setInterval(() => {
    document.querySelectorAll('.tl-item').forEach(el => observer.observe(el)); // 为每个时间轴项添加交叉观察
}, 500);