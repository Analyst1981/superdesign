
class CanvasInterface {
            constructor() {
                this.currentView = 'grid';
                this.currentViewport = 'tablet';
                this.zoomLevel = 100;
                this.designs = [];
                this.selectedModel = 'claude-3-sonnet';
                
                this.initializeElements();
                this.bindEvents();
                this.setupMessageListener();
            }
            
            initializeElements() {
                this.canvasContent = document.getElementById('canvasContent');
                this.emptyState = document.getElementById('emptyState');
                this.gridViewBtn = document.getElementById('gridViewBtn');
                this.listViewBtn = document.getElementById('listViewBtn');
                this.mobileBtn = document.getElementById('mobileBtn');
                this.tabletBtn = document.getElementById('tabletBtn');
                this.desktopBtn = document.getElementById('desktopBtn');
                this.zoomInBtn = document.getElementById('zoomInBtn');
                this.zoomOutBtn = document.getElementById('zoomOutBtn');
                this.zoomLevel = document.getElementById('zoomLevel');
            }
            
            bindEvents() {
                this.gridViewBtn.addEventListener('click', () => this.setView('grid'));
                this.listViewBtn.addEventListener('click', () => this.setView('list'));
                
                this.mobileBtn.addEventListener('click', () => this.setViewport('mobile'));
                this.tabletBtn.addEventListener('click', () => this.setViewport('tablet'));
                this.desktopBtn.addEventListener('click', () => this.setViewport('desktop'));
                
                this.zoomInBtn.addEventListener('click', () => this.adjustZoom(10));
                this.zoomOutBtn.addEventListener('click', () => this.adjustZoom(-10));
            }
            
            setView(view) {
                this.currentView = view;
                
                // 更新按钮状态
                this.gridViewBtn.classList.toggle('active', view === 'grid');
                this.listViewBtn.classList.toggle('active', view === 'list');
                
                this.renderDesigns();
            }
            
            setViewport(viewport) {
                this.currentViewport = viewport;
                
                // 更新按钮状态
                this.mobileBtn.classList.toggle('active', viewport === 'mobile');
                this.tabletBtn.classList.toggle('active', viewport === 'tablet');
                this.desktopBtn.classList.toggle('active', viewport === 'desktop');
                
                this.renderDesigns();
            }
            
            adjustZoom(delta) {
                this.zoomLevel = Math.max(50, Math.min(200, this.zoomLevel + delta));
                this.zoomLevel.textContent = `${this.zoomLevel}%`;
                
                // 应用缩放
                const designGrid = this.canvasContent.querySelector('.design-grid');
                if (designGrid) {
                    designGrid.style.transform = `scale(${this.zoomLevel / 100})`;
                }
            }
            
            setupMessageListener() {
                // 监听来自聊天界面的消息
                window.addEventListener('message', (event) => {
                    console.log('画布收到消息:', event.data);
                    
                    if (!event.data || typeof event.data !== 'object') {
                        console.log('忽略无效消息');
                        return;
                    }
                    
                    const { type, data } = event.data;
                    console.log('消息类型:', type, '数据:', data);
                    
                    switch (type) {
                        case 'addDesign':
                            console.log('处理addDesign消息');
                            this.addDesignFromChat(data);
                            break;
                        case 'modelChanged':
                            console.log('处理modelChanged消息');
                            this.selectedModel = data.model;
                            this.updateModelDisplay();
                            break;
                        case 'startDrawing':
                            console.log('处理startDrawing消息');
                            this.showDrawingProgress(data);
                            break;
                        case 'focusDesign':
                            console.log('处理focusDesign消息');
                            this.focusDesign(data.designId);
                            break;
                        case 'editDesign':
                            console.log('处理editDesign消息');
                            this.editDesign(data.designId);
                            break;
                        case 'layoutChanged':
                            console.log('处理layoutChanged消息 - 画布尺寸变化:', data);
                            // 可以在这里处理画布尺寸变化的逻辑
                            this.handleLayoutChange(data);
                            break;
                        default:
                            console.log('未知消息类型:', type);
                    }
                });
            }
            
            addDesignFromChat(designData) {
                // 从聊天界面添加新设计
                console.log('从聊天界面添加设计:', designData);
                
                // 如果有AI响应，生成实际的设计文件
                if (designData.aiResponse) {
                    this.generateDesignFile(designData);
                }
                
                this.addDesign(designData);
                this.renderDesigns();
                
                // 自动聚焦到新设计
                setTimeout(() => {
                    this.focusDesign(designData.id);
                }, 500);
            }
            
            handleLayoutChange(data) {
                // 处理画布布局变化
                console.log('画布布局变化:', data);
                
                // 可以在这里添加响应式布局调整逻辑
                if (data.width && data.height) {
                    // 根据新的尺寸调整画布显示
                    this.adjustCanvasLayout(data.width, data.height);
                }
            }
            
            adjustCanvasLayout(width, height) {
                // 调整画布布局以适应新尺寸
                console.log(`调整画布布局: ${width}x${height}`);
                
                // 这里可以添加具体的布局调整逻辑
                // 比如调整设计网格的列数、卡片大小等
            }
            
            async generateDesignFile(designData) {
                try {
                    console.log('生成设计文件:', designData.title);
                    
                    // 基于设计类型和AI响应生成HTML内容
                    const htmlContent = this.createDesignHTML(designData);
                    
                    // 发送到服务器保存文件
                    const response = await fetch('/api/save-design', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            designId: designData.id,
                            title: designData.title,
                            htmlContent: htmlContent,
                            designData: designData
                        })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            // 更新设计数据，添加文件路径
                            designData.filePath = result.filePath;
                            designData.hasFile = true;
                            console.log('设计文件已保存:', result.filePath);
                        }
                    }
                } catch (error) {
                    console.error('生成设计文件失败:', error);
                }
            }
            
            createDesignHTML(designData) {
                const { title, type, colors, elements, aiResponse } = designData;
                
                // 智能检测设计类型
                const detectedType = this.detectDesignType(title, aiResponse);
                const finalType = type || detectedType;
                
                console.log(`设计类型检测: 原始=${type}, 检测=${detectedType}, 最终=${finalType}`);
                
                // 根据设计类型生成不同的HTML模板
                switch (finalType) {
                    case 'calculator':
                        return this.createCalculatorHTML(designData);
                    case 'web':
                        return this.createWebPageHTML(designData);
                    case 'mobile':
                        return this.createMobileAppHTML(designData);
                    case 'poster':
                        return this.createPosterHTML(designData);
                    case 'icon':
                        return this.createIconHTML(designData);
                    default:
                        return this.createGeneralHTML(designData);
                }
            }
            
            detectDesignType(title, aiResponse) {
                const text = (title + ' ' + (aiResponse || '')).toLowerCase();
                
                // 计算器相关关键词
                if (text.includes('计算器') || text.includes('calculator') || 
                    text.includes('计算') || text.includes('数字') || text.includes('运算')) {
                    return 'calculator';
                }
                
                // 网页相关关键词
                if (text.includes('网页') || text.includes('网站') || text.includes('主页') || 
                    text.includes('landing') || text.includes('homepage')) {
                    return 'web';
                }
                
                // 移动应用相关关键词
                if (text.includes('app') || text.includes('应用') || text.includes('手机') || 
                    text.includes('移动端') || text.includes('mobile')) {
                    return 'mobile';
                }
                
                // 海报相关关键词
                if (text.includes('海报') || text.includes('poster') || text.includes('宣传') || 
                    text.includes('广告')) {
                    return 'poster';
                }
                
                // 图标相关关键词
                if (text.includes('图标') || text.includes('icon') || text.includes('logo')) {
                    return 'icon';
                }
                
                return 'general';
            }
            
            createCalculatorHTML(designData) {
                const { title } = designData;
                
                return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .calculator {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 350px;
            width: 100%;
        }
        
        .display {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            text-align: right;
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
        
        .display-text {
            color: white;
            font-size: 2.5rem;
            font-weight: 300;
            word-break: break-all;
        }
        
        .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }
        
        .btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 15px;
            padding: 20px;
            font-size: 1.5rem;
            font-weight: 500;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        .btn.operator {
            background: rgba(255, 107, 107, 0.8);
        }
        
        .btn.operator:hover {
            background: rgba(255, 107, 107, 1);
        }
        
        .btn.clear {
            background: rgba(255, 193, 7, 0.8);
        }
        
        .btn.clear:hover {
            background: rgba(255, 193, 7, 1);
        }
        
        .btn.equals {
            background: rgba(40, 167, 69, 0.8);
            grid-column: span 2;
        }
        
        .btn.equals:hover {
            background: rgba(40, 167, 69, 1);
        }
        
        .btn.zero {
            grid-column: span 2;
        }
        
        .title {
            text-align: center;
            color: white;
            margin-bottom: 20px;
            font-size: 1.5rem;
            font-weight: 300;
        }
    </style>
</head>
<body>
    <div class="calculator">
        <h1 class="title">计算器</h1>
        <div class="display">
            <div class="display-text" id="display">0</div>
        </div>
        <div class="buttons">
            <button class="btn clear" onclick="clearDisplay()">C</button>
            <button class="btn clear" onclick="clearEntry()">CE</button>
            <button class="btn operator" onclick="appendToDisplay('/')">/</button>
            <button class="btn operator" onclick="appendToDisplay('*')">×</button>
            
            <button class="btn" onclick="appendToDisplay('7')">7</button>
            <button class="btn" onclick="appendToDisplay('8')">8</button>
            <button class="btn" onclick="appendToDisplay('9')">9</button>
            <button class="btn operator" onclick="appendToDisplay('-')">-</button>
            
            <button class="btn" onclick="appendToDisplay('4')">4</button>
            <button class="btn" onclick="appendToDisplay('5')">5</button>
            <button class="btn" onclick="appendToDisplay('6')">6</button>
            <button class="btn operator" onclick="appendToDisplay('+')">+</button>
            
            <button class="btn" onclick="appendToDisplay('1')">1</button>
            <button class="btn" onclick="appendToDisplay('2')">2</button>
            <button class="btn" onclick="appendToDisplay('3')">3</button>
            <button class="btn equals" onclick="calculate()" rowspan="2">=</button>
            
            <button class="btn zero" onclick="appendToDisplay('0')">0</button>
            <button class="btn" onclick="appendToDisplay('.')">.</button>
        </div>
    </div>

    <script>
        let display = document.getElementById('display');
        let currentInput = '';
        let operator = '';
        let previousInput = '';

        function appendToDisplay(value) {
            if (display.value === '0' && value !== '.') {
                display.value = value;
            } else {
                display.value += value;
            }
        }

        function clearDisplay() {
            display.value = '0';
            currentInput = '';
            operator = '';
            previousInput = '';
        }

        function deleteLast() {
            if (display.value.length > 1) {
                display.value = display.value.slice(0, -1);
            } else {
                display.value = '0';
            }
        }

        function setOperator(op) {
            if (currentInput === '') {
                currentInput = display.value;
                operator = op;
                display.value = '0';
            }
        }

        function calculate() {
            if (currentInput !== '' && operator !== '') {
                const prev = parseFloat(currentInput);
                const current = parseFloat(display.value);
                let result = 0;

                switch (operator) {
                    case '+':
                        result = prev + current;
                        break;
                    case '-':
                        result = prev - current;
                        break;
                    case '*':
                        result = prev * current;
                        break;
                    case '/':
                        result = current !== 0 ? prev / current : 0;
                        break;
                }

                display.value = result.toString();
                currentInput = '';
                operator = '';
            }
        }
    