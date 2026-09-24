/* 网站内容渲染脚本 —— 从 content/content.json 读取并填充页面 */
/* 内置轻量 markdown 渲染，不依赖外部库 */

function mdToHtml(md) {
  if (!md) return '';
  var t = String(md);
  t = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  t = t.replace(/^######\s*(.+)$/gm, '<h6>$1</h6>');
  t = t.replace(/^#####\s*(.+)$/gm, '<h5>$1</h5>');
  t = t.replace(/^####\s*(.+)$/gm, '<h4>$1</h4>');
  t = t.replace(/^###\s*(.+)$/gm, '<h3>$1</h3>');
  t = t.replace(/^##\s*(.+)$/gm, '<h2>$1</h2>');
  t = t.replace(/^#\s*(.+)$/gm, '<h1>$1</h1>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  t = t.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
  t = t.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  t = t.replace(/\n\n+/g, '</p><p>');
  t = t.replace(/\n/g, '<br>');
  return '<p>' + t + '</p>';
}

function renderGallery(imgs) {
  if (!imgs || !imgs.length) return '';
  return '<div class="g-detail">' + imgs.map(function (g) { return '<figure><img src="' + g + '" alt=""></figure>'; }).join('') + '</div>';
}
function renderBadges(badges) {
  if (!badges || !badges.length) return '';
  return '<div class="badges">' + badges.map(function (b) { return '<span>' + b + '</span>'; }).join('') + '</div>';
}
function stripMd(s) {
  return String(s || '').replace(/[#*`>_\-]/g, '').replace(/\n/g, ' ');
}

function $(id) { return document.getElementById(id); }

async function main() {
  var data;
  try {
    var res = await fetch('content/content.json', { cache: 'no-store' });
    if (!res.ok) { console.error('fetch 失败', res.status); return; }
    data = await res.json();
  } catch (e) {
    console.error('加载 content.json 失败', e);
    return;
  }

  /* 1. 联系方式 */
  try {
    document.querySelectorAll('[data-field]').forEach(function (el) {
      var key = el.getAttribute('data-field');
      if (data.contact && data.contact[key] !== undefined) el.textContent = data.contact[key];
    });
    document.querySelectorAll('[data-tel]').forEach(function (el) {
      var key = el.getAttribute('data-tel');
      if (data.contact && data.contact[key]) el.setAttribute('href', 'tel:' + data.contact[key].replace(/[^0-9]/g, ''));
    });
  } catch (e) { console.error('联系方式渲染失败', e); }

  var q = new URLSearchParams(window.location.search);
  var idParam = q.get('id');
  var id = idParam === null ? -1 : parseInt(idParam, 10);

  /* 2. 产品 */
  try {
    var pList = $('products-list-container');
    var pDetail = $('products-detail-container');
    if (data.products && data.products.length) {
      if (pDetail && id >= 0 && data.products[id]) {
        var p = data.products[id];
        pDetail.innerHTML =
          '<a class="back-link" href="cpzs.html">← 返回产品列表</a>' +
          '<div class="detail-head">' +
          '<div class="detail-img"><img src="' + p.image + '" alt="' + p.name + '"></div>' +
          '<div class="detail-info"><h2>' + p.name + '</h2>' + renderBadges(p.badges) +
          '<a class="btn" href="/lxwm">咨询采购</a></div></div>' +
          '<div class="detail-content">' + mdToHtml(p.detail || p.desc) + '</div>' +
          renderGallery(p.gallery);
        pDetail.style.display = 'block';
        if (pList) pList.style.display = 'none';
      } else if (pList) {
        var btnText = pList.getAttribute('data-btn-text') || '查看详情';
        pList.innerHTML = data.products.map(function (p, i) {
          var tag = p.tag ? '<span class="tag">' + p.tag + '</span>' : '';
          return '<div class="product">' +
            '<div class="p-img">' + tag + '<img src="' + p.image + '" alt="' + p.name + '"></div>' +
            '<div class="p-body"><h3>' + p.name + '</h3>' + renderBadges(p.badges) +
            '<p>' + p.desc + '</p>' +
            '<a class="btn" href="cpzs.html?id=' + i + '">' + btnText + '</a></div></div>';
        }).join('');
        if (pDetail) pDetail.style.display = 'none';
      }
    }
  } catch (e) { console.error('产品渲染失败', e); }

  /* 3. 新闻 */
  try {
    var nList = $('news-list-container');
    var nDetail = $('news-detail-container');
    if (data.news && data.news.length) {
      if (nDetail && id >= 0 && data.news[id]) {
        var n = data.news[id];
        nDetail.innerHTML =
          '<a class="back-link" href="xwdt.html">← 返回新闻列表</a>' +
          '<div class="detail-head">' +
          (n.image ? '<div class="detail-img"><img src="' + n.image + '" alt="' + n.title + '"></div>' : '') +
          '<div class="detail-info"><h2>' + n.title + '</h2><div class="date">' + n.date + '</div></div></div>' +
          '<div class="detail-content">' + mdToHtml(n.content) + '</div>' +
          renderGallery(n.gallery);
        nDetail.style.display = 'block';
        if (nList) nList.style.display = 'none';
      } else if (nList) {
        nList.innerHTML = data.news.map(function (n, i) {
          var img = n.image ? '<img src="' + n.image + '" alt="' + n.title + '">' : '';
          var brief = stripMd(n.content).slice(0, 80);
          return '<a class="news-item news-link" href="xwdt.html?id=' + i + '">' + img +
            '<div><h3>' + n.title + '</h3><div class="date">' + n.date + '</div>' +
            '<p style="color:var(--muted);margin-top:10px;font-size:14px;">' + brief + (brief.length >= 80 ? '…' : '') + '</p></div></a>';
        }).join('');
        if (nDetail) nDetail.style.display = 'none';
      }
    }
  } catch (e) { console.error('新闻渲染失败', e); }

  /* 4. 案例 */
  try {
    var cList = $('cases-list-container');
    var cDetail = $('cases-detail-container');
    if (data.cases && data.cases.length) {
      if (cDetail && id >= 0 && data.cases[id]) {
        var c = data.cases[id];
        cDetail.innerHTML =
          '<a class="back-link" href="syal.html">← 返回案例列表</a>' +
          '<div class="detail-head">' +
          '<div class="detail-img"><img src="' + c.image + '" alt="' + c.title + '"></div>' +
          '<div class="detail-info"><h2>' + c.title + '</h2></div></div>' +
          '<div class="detail-content">' + mdToHtml(c.content) + '</div>' +
          renderGallery(c.gallery);
        cDetail.style.display = 'block';
        if (cList) cList.style.display = 'none';
      } else if (cList) {
        cList.innerHTML = data.cases.map(function (c, i) {
          return '<a class="case-card" href="syal.html?id=' + i + '">' +
            '<img src="' + c.image + '" alt="' + c.title + '">' +
            '<div class="case-card-body"><h3>' + c.title + '</h3></div></a>';
        }).join('');
        if (cDetail) cDetail.style.display = 'none';
      }
    }
  } catch (e) { console.error('案例渲染失败', e); }
}

main();
