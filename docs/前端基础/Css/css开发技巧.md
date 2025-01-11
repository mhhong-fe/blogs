# 文本超出省略

单行文本

```css
.ellipsis {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
```

多行文本

```css
.multiline-ellipsis {
    display: -webkit-box; /* 必须，使用 WebKit 的盒子模型 */
    -webkit-box-orient: vertical; /* 必须，设置盒子垂直排列 */
    overflow: hidden; /* 必须，隐藏超出内容 */
    text-overflow: ellipsis; /* 显示省略号 */
    -webkit-line-clamp: 3; /* 显示的行数，例如3行 */
    line-height: 1.5; /* 行高，可根据需求调整 */
    max-height: 4.5em; /* 行数 x 行高，例如3行 x 1.5em */
}
```



