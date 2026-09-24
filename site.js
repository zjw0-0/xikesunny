/* 网站内容渲染脚本 —— 从 content/content.json 读取并填充页面 */
(async function () {
  try {
    var res = await fetch('content/content.json', { cache: 'no-store' });
    if (!res.ok) return;
    var data = await res.json();

    /* 1. 文本填充：<span data-field="phone"> 等 */
    document.querySelectorAll('[data-field]').forEach(function (el) {
      var key = el.getAttribute('data-field');
      if (data.contact && data.contact[key] !== undefined) {
        el.textContent = data.contact[key];
      }
    });

    /* 2. 电话链接：<a data-tel="phone"> 只设置 href，不改文字 */
    document.querySelectorAll('[data-tel]').forEach(function (el) {
      var key = el.getAttribute('data-tel');
      if (data.contact && data.contact[key]) {
        el.setAttribute('href', 'tel:' + data.contact[key].replace(/[^0-9]/g, ''));
      }
    });

    /* 3. 产品列表 */
    var prod = document.getElementById('products-container');
    if (prod && data.products) {
      var btnText = prod.getAttribute('data-btn-text') || '咨询采购';
      var btnHref = prod.getAttribute('data-btn-href') || '/lxwm';
      prod.innerHTML = data.products.map(function (p) {
        var tag = p.tag ? '<span class="tag">' + p.tag + '</span>' : '';
        var badges = (p.badges && p.badges.length)
          ? '<div class="badges">' + p.badges.map(function (b) { return '<span>' + b + '</span>'; }).join('') + '</div>'
          : '';
        return '<div class="product">' +
          '<div class="p-img">' + tag + '<img src="' + p.image + '" alt="' + p.name + '"></div>' +
          '<div class="p-body">' +
          '<h3>' + p.name + '</h3>' + badges +
          '<p>' + p.desc + '</p>' +
          '<a class="btn" href="' + btnHref + '">' + btnText + '</a>' +
          '</div></div>';
      }).join('');
    }

    /* 4. 新闻：列表 + 详情 */
    var listBox = document.getElementById('news-list-container');
    var detailBox = document.getElementById('news-detail-container');
    if (data.news) {
      var q = new URLSearchParams(window.location.search);
      var idParam = q.get('id');
      var id = idParam === null ? -1 : parseInt(idParam, 10);

      if (detailBox && id >= 0 && data.news[id]) {
        // 详情模式
        var n = data.news[id];
        detailBox.innerHTML =
          '<a class="news-back" href="xwdt.html">← 返回新闻列表</a>' +
          '<div class="news-item news-single">' +
          (n.image ? '<img src="' + n.image + '" alt="' + n.title + '">' : '') +
          '<div><h3>' + n.title + '</h3>' +
          '<div class="date">' + n.date + '</div>' +
          '<div class="news-content">' + (n.content || '').replace(/\n/g, '<br>') + '</div></div></div>';
        detailBox.style.display = 'block';
        if (listBox) listBox.style.display = 'none';
      } else if (listBox) {
        // 列表模式
        listBox.innerHTML = data.news.map(function (n, i) {
          var img = n.image ? '<img src="' + n.image + '" alt="' + n.title + '">' : '';
          var brief = (n.content || '').replace(/\n/g, ' ').slice(0, 80);
          return '<a class="news-item news-link" href="xwdt.html?id=' + i + '">' + img +
            '<div><h3>' + n.title + '</h3>' +
            '<div class="date">' + n.date + '</div>' +
            '<p style="color:var(--muted);margin-top:10px;font-size:14px;">' + brief + (brief.length >= 80 ? '…' : '') + '</p></div></a>';
        }).join('');
        if (detailBox) detailBox.style.display = 'none';
      }
    }
  } catch (e) {
    console.error('内容加载失败:', e);
  }
})();
