# FIXORA Premium B2B Distribution Website

## 项目概述

这是FIXORA北美渠道型家居五金品牌的升级版B2B分销网站。采用高端现代设计，专业面向分销商、建筑商、承包商和设计师。

## 🎨 设计特点

### 视觉风格
- **字体**：Playfair Display (标题) + Inter (正文) - 高端专业感
- **颜色方案**：黑色 + 橙色 (#FF6B35) - 现代、信任、专业
- **设计灵感**：参考Baldwin Hardware, Rocky Mountain Hardware, TownSteel等高端品牌
- **布局**：极简现代，强调信息层级

### 核心元素
✓ 高对比度Hero区 
✓ 清晰的视觉层级
✓ 专业的品牌呈现
✓ B2B导向的内容架构
✓ 响应式全端设备适配

## 📑 网站结构

### 导航系统
- **顶部导航栏**：清晰的水平菜单 + 多语言选择器
- **产品分类**：直接、易查找
- **技术资料**：Support部分集中
- **销售联系**：Contact清晰可及

### 内容部分

1. **Solutions by Market**（市场导向）
   - Residential Construction
   - Renovation & Remodeling
   - Commercial & Hospitality
   - Institutional
   - Multifamily Housing
   - Specialized Applications

2. **Why Choose FIXORA**（6个核心竞争力）
   - US-Based Strategic Inventory
   - Proven Quality Standards
   - Lifetime Warranty Coverage
   - Channel Protection
   - Curated SKU Selection
   - Expert Professional Support

3. **Product Categories**
   - Door Locks
   - Door Hardware
   - Furniture Hardware
   - Cabinet Hardware

4. **Projects Showcase**（应用案例）
   - 住宅项目
   - 商业项目
   - 豪华项目

5. **Support & Resources**
   - Technical Documentation
   - Sales Support
   - Technical Support

6. **Contact Section**
   - 销售部门联系方式
   - 技术支持联系
   - 办公地址
   - 在线表单

## 🌍 多语言支持

网站完全支持三种语言的无缝切换：
- 🇺🇸 **English** (默认)
- 🇪🇸 **Español** (西班牙语)
- 🇫🇷 **Français** (法语)

所有内容、导航、按钮都支持多语言，用户选择会保存在本地存储中。

## 📁 文件结构

```
website/
├── index.html           # 主页面（多语言数据属性）
├── styles.css           # 高端响应式样式表
├── script.js            # 多语言切换和交互脚本
└── README.md            # 项目文档
```

## 🚀 本地预览

### 方法1：Python服务器
```bash
cd /Users/shujingzhong/ProBuilder/FIXORA/website
python -m http.server 8000
# 访问：http://localhost:8000
```

### 方法2：Live Server (VS Code)
1. 安装Live Server扩展
2. 右键index.html → "Open with Live Server"

## 🎯 技术实现

### 前端技术
- **HTML5** - 语义化标记
- **CSS3** - Grid布局、Flexbox、过渡动画
- **JavaScript** - 多语言切换、平滑滚动、交互动画

### 性能优化
- 响应式设计（移动、平板、桌面）
- 图片懒加载就绪
- 现代浏览器兼容

### 浏览器支持
- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)

## 📱 响应式设计

- **桌面** (1200px+) - 完整布局
- **平板** (768px-1199px) - 优化导航和栅栏布局
- **手机** (480px-767px) - 单列布局，优化触摸
- **小屏幕** (<480px) - 紧凑设计

## 🔧 定制选项

### 修改颜色
编辑 `styles.css` 中的CSS变量：
```css
--primary-orange: #FF6B35;  /* 主要强调色 */
--dark-bg: #0f0f0f;         /* 深色背景 */
```

### 添加新语言
在 `script.js` 中的 `translations` 对象添加新语言，然后在HTML中添加 `data-xx` 属性。

### 修改联系方式
在 `index.html` 中的Contact Section更新电话和邮箱。

## 📊 内容管理

每个内容块都包含多语言数据属性：
```html
<h2 data-en="English Text" data-es="Texto Español" data-fr="Texte Français"></h2>
```

## 🔐 SEO优化

- 语义化HTML标签
- 清晰的页面结构
- Meta标签优化
- 响应式设计支持

## 🎓 最佳实践

- 清晰的信息架构
- B2B导向的用户体验
- 专业的品牌呈现
- 快速的页面加载
- 移动优先设计

## 📝 后续优化建议

- [ ] 添加静态内容中文翻译
- [ ] 集成CMS管理内容
- [ ] 实现产品搜索和过滤
- [ ] 添加分销商查询工具
- [ ] 集成在线报价系统
- [ ] 添加产品PDFs下载
- [ ] 实现客户登录系统
- [ ] 添加案例研究详情页
- [ ] 集成分析追踪
- [ ] 性能监控和优化

## 📞 支持

网站包含以下联系方式：
- **销售**: sales@fixora.com | 1-800-FIXORA-1
- **支持**: support@fixora.com | 1-800-FIXORA-2
- **地址**: FIXORA Distribution Center, 1000 Industrial Way, Los Angeles, CA 90001, USA

---

**FIXORA** - *Engineered for Reliability* ®
