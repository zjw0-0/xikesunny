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

    /* 4. 新闻列表 */
    var news = document.getElementById('news-container');
    if (news && data.news) {
      news.innerHTML = data.news.map(function (n) {
        var img = n.image ? '<img src="' + n.image + '" alt="' + n.title + '">' : '';
        return '<div class="news-item">' + img +
          '<div><h3>' + n.title + '</h3>' +
          '<div class="date">' + n.date + '</div>' +
          '<p style="color:var(--muted);margin-top:10px;font-size:14px;">' + (n.content || '') + '</p></div></div>';
      }).join('');
    }
  } catch (e) {
    console.error('内容加载失败:', e);
  }
})();
