if (!process.argv.includes('--run-historical-migration')) throw new Error('Historical migration disabled. Edit shopify/theme directly; run build-css.cjs to rebuild styles.');
/* Convert the existing site's presentation into standalone Liquid sections.
 * The source Next.js application is read only. No React runtime ships in the theme.
 */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const cheerio = require('cheerio');
const root = path.resolve(__dirname, '../..');
const theme = path.join(root, 'shopify/theme');
const h = React.createElement;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, value) => { const dest = path.join(theme, file); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, value); };
const json = (file, value) => write(file, JSON.stringify(value, null, 2) + '\n');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const mockImage = ({ src, alt = '', fill, priority, unoptimized, quality, sizes, ...props }) => h('img', { width:1600, height:1200, ...props, src, alt, loading: priority ? 'eager' : (props.loading || 'lazy'), style: { ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : {}), ...props.style } });
const mocks = {
  'next/image': mockImage,
  'next/link': ({ children, prefetch, ...props }) => h('a', props, children),
  'next/navigation': { usePathname: () => '/' },
  '@/context/CartContext': { useCart: () => ({ cart: { itemCount: 0, items: [] }, isCartReady: false }) },
  '@/hooks/useCheckout': { useCheckout: () => ({}) },
  '@/lib/shopify': {},
  '@/lib/api': { formatPriceWithCurrency: amount => `LUMINA_MONEY_${amount}_END` },
};
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (Object.hasOwn(mocks, request)) return mocks[request];
  if (/\/SmartVideo$/.test(request)) return ({src,posterSrc,posterAlt,className}) => h('video', {src, poster:posterSrc, 'aria-label':posterAlt, className:className || 'object-cover w-full h-full', autoPlay:true, muted:true, loop:true, playsInline:true, controls:true, preload:'metadata'});
  if (/\/SaleCountdown$/.test(request)) return () => h('span', {'data-countdown':'', className:'font-mono tabular-nums'}, 'Limited time');
  return originalLoad.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, parent, isMain);
};
for (const ext of ['.ts', '.tsx']) Module._extensions[ext] = (module, filename) => {
  let source = fs.readFileSync(filename, 'utf8');
  if (filename.endsWith('blackout-product.ts')) source += '\nexport { buildAccordionItems };';
  if (filename.endsWith('LuminaFitPromiseModal.tsx')) source += '\nexport { SECTIONS };';
  if (filename.endsWith('ProductInfo.tsx')) source = source.replace('{/* Size */}', '<span data-port-start="options" />').replace('{/* Add To Cart */}', '<span data-port-end="options" />');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop:true }, fileName: filename });
  module._compile(output.outputText, filename);
};
const component = (file, props = {}) => renderToStaticMarkup(h(require(path.join(root, 'src', file)).default, props)).replace(/<link[^>]*rel="preload"[^>]*>/g, '');
const dom = markup => cheerio.load(markup, { decodeEntities: false }, false);
const assetMap = new Map();
function copyAssets(dir) {
  for (const file of fs.readdirSync(path.join(root, 'public', dir), { withFileTypes:true })) {
    const rel = path.posix.join(dir, file.name);
    if (file.isDirectory()) copyAssets(rel);
    else { const name = rel.replaceAll('/', '-'); assetMap.set('/' + rel, name); fs.mkdirSync(path.join(theme,'assets'), {recursive:true}); fs.copyFileSync(path.join(root,'public',rel),path.join(theme,'assets',name)); }
  }
}
copyAssets('');
fs.copyFileSync(path.join(root,'src/app/icon.svg'),path.join(theme,'assets/favicon.svg'));
function liquid(markup) {
  for (const [url, name] of assetMap) markup = markup.replaceAll(url, `{{ '${name}' | asset_url }}`);
  return markup.replaceAll('/products/honeycomb-blackout-blind', "{{ settings.featured_product.url | default: '/products/honeycomb-blackout-blind' }}")
    .replaceAll('href="/account"', 'href="{{ routes.account_url }}"')
    .replaceAll('href="/"', 'href="{{ routes.root_url }}"')
    .replaceAll('href="/#', 'href="{{ routes.root_url }}#')
    .replace(/href="\/(privacy-policy|terms-of-service|shipping-policy|returns-refunds-policy)"/g, 'href="{{ routes.root_url }}?view=$1"');
}
function section(id, title, markup, options = {}) {
  const schema = { name: title, settings: options.settings || [], ...options, presets: [{name:title}] };
  write(`sections/${id}.liquid`, liquid(markup) + '\n{% schema %}\n' + JSON.stringify(schema,null,2) + '\n{% endschema %}\n');
}
const textSetting = (id,label,def) => ({type:'text',id,label,default:def});
const homeSections = [
 ['hero','Hero','Hero'], ['quick-answers','Quick answers','QuickAnswersStrip'], ['value-props','Benefits','ValueProps'],
 ['comparison','Compare Lumina','ComparisonTable'], ['our-story','Our story','OurStory'], ['measuring','Measuring guide','MeasuringGuide'], ['installation','Installation','Installation'],
];
for (const [id,title,file] of homeSections) {
  let markup = component(`components/home/${file}.tsx`);
  let settings = [];
  if (id === 'hero') {
    const $ = dom(markup);
    $('h1').html('{{ section.settings.heading }}');
    $('a').first().text('{{ section.settings.button_label }}');
    markup=$.html();
    settings=[{type:'html',id:'heading',label:'Heading',default:'Sleep in<br><em>total</em><br>darkness.'},textSetting('button_label','Button label','Shop The Blind')];
  } else {
    const $=dom(markup); const headings=new Map();
    $('h2').each((_,el)=>{const value=$(el).html();if(!headings.has(value)){const key='heading_'+headings.size;headings.set(value,key);settings.push({type:'html',id:key,label:'Heading '+headings.size,default:value});}$(el).html('{{ section.settings.'+headings.get(value)+' }}');});
    markup=$.html();
  }
  section('lumina-'+id,title,markup,{settings});
}
for(const [id,title,file] of [['key-features','Key features','ProductKeyFeatures'],['product-features','Blackout benefits','ProductFeatures'],['why-lumina','Why Lumina','ProductWhyLumina']]) section('lumina-'+id,title,component(`components/product/${file}.tsx`));

// Header and footer keep the original layout, with native routes and accessible menu state.
{
 const $=dom(component('components/layout/Header.tsx'));
 $('button[aria-label="Toggle menu"]').attr('data-menu-toggle','').attr('aria-controls','LuminaMobileMenu');
 const menu=$('header > div > div').last();
 menu.attr('id','LuminaMobileMenu').attr('hidden','').removeClass('opacity-0 -translate-y-2 pointer-events-none').addClass('opacity-100');
 menu.find('a').removeClass('opacity-0 translate-y-1');
 $('button[aria-label="Open cart"]').attr('data-cart-open','').append('<span class="lumina-cart-count" data-cart-count>{{ cart.item_count }}</span>');
 section('lumina-header','Header',$.html(),{class:'lumina-header-section'});
 section('lumina-footer','Footer',component('components/layout/Footer.tsx'));
 const top=dom(component('components/layout/TopBar.tsx'));
 top('button').attr('data-copy-code','{{ section.settings.code | escape }}');
 top('[data-countdown]').attr('data-ends-at','{{ section.settings.ends_at | escape }}');
 let markup=top.html().replaceAll('Our Biggest Sale | Up to 60% Off + Extra 15% with Code FINAL15 | Ends in','{{ section.settings.message | escape }}').replaceAll('FINAL15','{{ section.settings.code | escape }}');
 section('lumina-announcement','Announcement',markup,{settings:[textSetting('message','Message','Our Biggest Sale | Up to 60% Off + Extra 15% with Code FINAL15'),textSetting('code','Discount code','FINAL15'),{type:'text',id:'ends_at',label:'Offer end (ISO date and time)',info:'Leave blank to hide the timer. Example: 2026-12-31T23:59:59-06:00'}]});
}
// FAQ content is copied verbatim into editable section blocks.
{
 const source=ts.createSourceFile('faq.tsx',read('src/components/home/Faq.tsx'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let faqs; function visit(node) { if(ts.isVariableDeclaration(node)&&node.name.getText(source)==='faqs') faqs=Function('return '+node.initializer.getText(source))(); ts.forEachChild(node,visit); } visit(source);
 const blocks=faqs.map(f=>({type:'question',settings:{question:f.question,answer:'<p>'+escape(f.answer)+'</p>'}}));
 const markup=`<section id="faq" class="bg-[#eaedf0] py-16 md:py-24 px-6 w-full"><div class="max-w-[768px] mx-auto"><div class="text-center mb-12"><p class="text-[#4051b5] text-xs uppercase tracking-widest mb-4">FAQ</p><h2 class="font-playfair text-4xl md:text-[48px]">Questions &amp;<br><em>answers</em></h2></div><div class="lumina-faq-list">{% for block in section.blocks %}<details class="lumina-accordion" {% if forloop.index > 5 %}data-extra-faq hidden{% endif %} {{ block.shopify_attributes }}><summary>{{ block.settings.question | escape }}<span aria-hidden="true">+</span></summary><div class="lumina-richtext">{{ block.settings.answer }}</div></details>{% endfor %}</div><div class="text-center mt-6"><button class="lumina-outline-button" type="button" data-faq-more>View more</button></div><div class="bg-[#f9fafb] text-center p-8 rounded-2xl mt-10"><h3 class="font-playfair text-xl mb-2">Still have questions?</h3><p class="text-sm text-[#657186] mb-6">Our team replies within a few hours, Monday to Friday.</p><a class="lumina-button" href="mailto:info@luminablackoutblinds.com">info@luminablackoutblinds.com</a></div></div></section>`;
 section('lumina-faq','FAQ',markup,{blocks:[{type:'question',name:'Question',settings:[textSetting('question','Question','Your question'),{type:'richtext',id:'answer',label:'Answer',default:'<p>Your answer</p>'}]}]});
 global.faqBlocks=Object.fromEntries(blocks.map((b,i)=>['question'+i,b]));
}
// Newsletter uses Shopify's customer form, with no dependency on the Next.js API.
{
 const $=dom(component('components/home/SubscribeOffer.tsx'));
 $('input[type="email"]').attr('name','contact[email]').removeAttr('value');
 const form=$('form'); const inner=form.html();
 form.replaceWith(`{% form 'customer', id: 'LuminaNewsletter', class: 'flex flex-col gap-4' %}<input type="hidden" name="contact[tags]" value="newsletter">${inner}{% if form.posted_successfully? %}<p role="status" class="text-white">Thanks for subscribing.</p>{% endif %}{{ form.errors | default_errors }}{% endform %}`);
 section('lumina-newsletter','Newsletter',$.html().replaceAll('Subscribe for 15% off.','{{ section.settings.heading | escape }}').replaceAll('Product updates, measuring guidance, and a 15% code for your first order.','{{ section.settings.description | escape }}'),{settings:[textSetting('heading','Heading','Subscribe for 15% off.'),textSetting('description','Description','Product updates, measuring guidance, and a 15% code for your first order.')]});
}
const { buildAccordionItems }=require(path.join(root,'src/lib/blackout-product.ts'));
const { SECTIONS:promiseSections }=require(path.join(root,'src/components/product/LuminaFitPromiseModal.tsx'));
write('snippets/lumina-fit-promise-content.liquid',liquid(promiseSections.map(item=>`<details class="lumina-accordion"><summary>${escape(item.title)}<span aria-hidden="true">+</span></summary><div class="lumina-richtext">${renderToStaticMarkup(item.content)}</div></details>`).join('\n')));
const product={id:'preview',name:'LUMINA_PRODUCT_TITLE',slug:'honeycomb-blackout-blind',price:199,currency:'USD',descriptionHtml:'LUMINA_PRODUCT_DESCRIPTION',rating:4.8,reviewCount:750,features:{hasBlindColor:true,hasFrameColor:true,hasOpeningDirection:true},images:Array.from({length:10},(_,i)=>`/product/gallery-${i+1}.webp`),imageAlts:[],reviews:[],accordionItems:buildAccordionItems()};
// Product controls retain the current design. LPO blocks replace the visual-only controls.
{
 const $=dom(component('components/product/ProductInfo.tsx',{product}));
 const start=$('[data-port-start]'),end=$('[data-port-end]');
 const controls=start.nextUntil(end); controls.wrapAll('<div class="lumina-design-options" data-design-options></div>');
 start.remove();end.remove();
 const options=$('[data-design-options]');
 options.find('button').each((_,el)=>{
   const btn=$(el); const label=btn.attr('aria-label')||''; const text=btn.text().trim();
   if(label.startsWith('Select ')) btn.attr('data-swatch',label.slice(7)).attr('aria-pressed','false');
   else if(['Inches','Centimeters'].includes(text)) btn.attr('data-unit',text==='Inches'?'in':'cm').attr('aria-pressed',text==='Inches'?'true':'false');
   else if(/Left to Right|Right to Left|Top Down|Split/.test(text)) btn.attr('data-direction',text.replace(/ \(.*/, '')).attr('aria-pressed','false');
   else if(label.includes('opening direction')) btn.attr('data-dialog-open','LuminaDirection');
 });
 options.find('input').removeAttr('value').each((_,el)=>$(el).prev('span').attr('data-dimension-unit',''));
 options.before('{% if section.blocks.size == 0 %}'); options.after('{% else %}<div class="lumina-app-options">{% for block in section.blocks %}{% render block %}{% endfor %}</div>{% endif %}');
 $('button').each((_,el)=>{ const btn=$(el),text=btn.text().trim();btn.attr('type','button');if(text==='Add to Cart')btn.attr('data-add-to-cart','');if(text==='Buy Now')btn.attr('data-buy-now','');if(text.includes('Lumina Fit Promise'))btn.attr('data-dialog-open','LuminaFitPromise');if(btn.attr('aria-label')==='Copy code FINAL15')btn.attr('data-copy-code','FINAL15'); });
 // Replace inaccessible React accordions with native details.
 $('#product-details').html(product.accordionItems.map(item=>`<details class="lumina-accordion"><summary>${escape(item.title)}<span aria-hidden="true">+</span></summary><div class="lumina-richtext">${item.contentHtml||escape(item.content)}</div></details>`).join(''));
 $('[aria-hidden="true"]').filter((_,el)=>($(el).attr('class')||'').includes('fixed bottom-0')).remove();
 $('button[data-add-to-cart],button[data-buy-now]').removeAttr('disabled');
 $('button[data-add-to-cart]').attr('type','submit').attr('name','add');
 $('button[data-buy-now]').attr('type','submit').attr('name','add');
 $('span').filter((_,el)=>$(el).text().startsWith('You save ')).closest('div.flex.items-center.justify-between').attr('data-savings-row','');
 $('[data-savings-row]').before('{% if product.compare_at_price > product.price %}').after('{% endif %}');
 let info=$.html().replaceAll('&gt;', '>').replaceAll('LUMINA_PRODUCT_TITLE','{{ product.title | escape }}').replaceAll('LUMINA_PRODUCT_DESCRIPTION','{{ product.description }}')
 .replaceAll('LUMINA_MONEY_497.5_END','{{ product.compare_at_price | money }}').replaceAll('LUMINA_MONEY_299_END','{{ product.compare_at_price | minus: product.price | money }}').replaceAll('LUMINA_MONEY_199_END','{{ product.price | money }}').replaceAll('LUMINA_MONEY_75_END','{{ 7500 | money }}')
 .replace(/Delivered by [^<]+/g,'Delivered in 7–11 business days')
 .replace(/(<button[^>]*data-(?:add-to-cart|buy-now)="")/g,'$1 {% unless settings.enable_purchasing and product.available and section.blocks.size > 0 %}disabled{% endunless %}');
 // Use actual compare-at pricing instead of carrying the old calculated discount to Shopify.
 info=info.replaceAll('60% off','{{ discount_percent }}% off').replaceAll('60% OFF','{{ discount_percent }}% OFF');
 info=info.replace(/(<span[^>]*class="[^"]*line-through[^>]*>)([\s\S]*?)(<\/span>)/g,'{% if product.compare_at_price > product.price %}$1$2$3{% endif %}');
 info=info.replace(/<span([^>]*)>{{ discount_percent }}% (off|OFF)<\/span>/g,'{% if product.compare_at_price > product.price %}<span$1>{{ discount_percent }}% $2</span>{% endif %}');
 info=info.replace(/<div class="flex items-center justify-between gap-4 bg-\[#131720\] px-4 py-3">([\s\S]*?)<!--offer-end-->/g,'$&');
 const gallery=component('components/product/ProductGallery.tsx',{product});const g=dom(gallery);
 g('img').first().attr('data-gallery-main','');g('button[aria-label="Previous image"]').attr('data-gallery-step','-1');g('button[aria-label="Next image"]').attr('data-gallery-step','1');g('button[aria-label="Enlarge product image"]').attr('data-dialog-open','LuminaGallery');
 g('button').has('img').each((i,el)=>g(el).attr('data-gallery-index',i).attr('aria-label',`Show image ${i+1}`).attr('aria-pressed',i===0?'true':'false'));
 g('[data-gallery-index="4"]').attr('data-dialog-open','LuminaGallery');
 g('[data-gallery-index="0"]').removeClass('ring-2 ring-offset-2 ring-[#131720]');
 g('div').filter((_,el)=>(g(el).attr('class')||'').includes('absolute bottom-4')).children().each((i,el)=>g(el).attr('data-gallery-dot',i));
 g.root().append(`<script type="application/json" data-gallery-images>${JSON.stringify(product.images)}</script>`);
 const markup=`{% liquid
 assign product = product | default: settings.featured_product
 if product == blank
   assign product = all_products['honeycomb-blackout-blind']
 endif
 assign discount_percent = 0
 if product.compare_at_price > product.price
   assign discount_percent = product.compare_at_price | minus: product.price | times: 100.0 | divided_by: product.compare_at_price | round
 endif
%}<section class="w-full bg-white pt-10 md:pt-15 pb-12 md:pb-20" data-lumina-product><div class="max-w-[1248px] mx-auto px-4 md:px-8 xl:px-0 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[64px]"><div class="relative w-full self-start lg:sticky lg:top-24" data-gallery>${g.html()}</div><div class="w-full pt-2">{% if product != blank %}{% form 'product', product, id: 'LuminaProductForm' %}<input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}"><input type="hidden" name="quantity" value="1">${info}<p data-product-message role="status" class="text-sm text-[#657186]"></p>{% endform %}{% else %}<h1 class="font-playfair text-4xl">Blackout Blind</h1><p>Select the featured product in Theme settings to preview its details.</p>{% endif %}</div></div></section>`;
 section('lumina-product','Product',markup,{blocks:[{type:'@app'}]});
}
// Review presentation from the source site's explicitly labelled demo data.
{
 const {DEMO_PRODUCT_REVIEWS,getReviewSummary}=require(path.join(root,'src/data/reviews.ts'));
 const $=dom(component('components/product/ProductReviews.tsx',{product,sectionId:'reviews',showWriteReview:false,initialReviewsData:{reviews:DEMO_PRODUCT_REVIEWS, ...getReviewSummary(DEMO_PRODUCT_REVIEWS),source:'demo',syncEnabled:false}}));
 $('img').attr('width','800').attr('height','800');
 $('button').each((_,el)=>{const btn=$(el); if(btn.text().includes('Load')||btn.text().includes('more reviews'))btn.remove();else if(btn.find('img').length)btn.attr('type','button').attr('data-review-image',btn.find('img').attr('src'));});
 section('lumina-reviews','Reviews',`{% if section.blocks.size > 0 %}<section id="reviews" class="lumina-container py-16">{% for block in section.blocks %}{% render block %}{% endfor %}</section>{% elsif section.settings.show_preview_reviews %}<div class="bg-white"><p class="lumina-container pt-8 text-sm text-[#657186]">Design preview — sample reviews. Connect your review app before launch.</p>${$.html()}</div>{% endif %}`,{settings:[{type:'checkbox',id:'show_preview_reviews',label:'Show sample reviews in design preview',default:true}],blocks:[{type:'@app'}]});
}
// Policy content is stored in theme-only alternate home templates: no shared pages are created.
for(const id of ['privacy-policy','terms-of-service','shipping-policy','returns-refunds-policy']) {
 section('lumina-'+id,id.replaceAll('-',' ').replace(/\b\w/g,s=>s.toUpperCase()),component(`app/${id}/page.tsx`));
 json(`templates/index.${id}.json`,{sections:{main:{type:'lumina-'+id,settings:{}}},order:['main']});
}
const homeOrder=[...homeSections.map(x=>'lumina-'+x[0]),'lumina-reviews','lumina-newsletter','lumina-faq'];
json('templates/index.json',{sections:Object.fromEntries(homeOrder.map((id,i)=>['section'+i,{type:id,settings:{},...(id==='lumina-faq'?{blocks:global.faqBlocks,block_order:Object.keys(global.faqBlocks)}:{})}])),order:homeOrder.map((_,i)=>'section'+i)});
json('templates/product.json',{sections:{main:{type:'lumina-product',settings:{}},features:{type:'lumina-key-features',settings:{}},benefits:{type:'lumina-product-features',settings:{}},why:{type:'lumina-why-lumina',settings:{}},reviews:{type:'lumina-reviews',settings:{}}},order:['main','features','benefits','why','reviews']});
json('templates/index.product-preview.json',{sections:{main:{type:'lumina-product',settings:{}},features:{type:'lumina-key-features',settings:{}},benefits:{type:'lumina-product-features',settings:{}},why:{type:'lumina-why-lumina',settings:{}},reviews:{type:'lumina-reviews',settings:{}}},order:['main','features','benefits','why','reviews']});
json('config/settings_schema.json',[
 {name:'theme_info',theme_name:'Lumina Design Preview',theme_version:'1.0.0',theme_author:'Lumina',theme_documentation_url:'https://shopify.dev/docs/storefronts/themes',theme_support_url:'https://www.luminablackoutblinds.com'},
 {name:'Storefront',settings:[{type:'product',id:'featured_product',label:'Featured blind'},{type:'checkbox',id:'enable_purchasing',label:'Enable purchasing after LPO configuration',default:false,info:'Keep off during design review. Product section also requires an app block.'},{type:'checkbox',id:'enable_newsletter_popup',label:'Show newsletter popup',default:false},{type:'header',content:'Design preview'},{type:'paragraph',content:'This theme is separate from the existing site. Product options shown without an app block are visual examples only. Configure LPO and review pricing before enabling purchasing.'}]}
]);
json('config/settings_data.json',{current:{featured_product:'honeycomb-blackout-blind',enable_purchasing:false,enable_newsletter_popup:false}});
json('locales/en.default.json',{general:{accessibility:{skip_to_content:'Skip to content'},search:{search:'Search'}},products:{product:{add_to_cart:'Add to cart',sold_out:'Sold out'}}});
json('sections/header-group.json',{type:'header',name:'Header',sections:{announcement:{type:'lumina-announcement',settings:{}},header:{type:'lumina-header',settings:{}}},order:['announcement','header']});
json('sections/footer-group.json',{type:'footer',name:'Footer',sections:{footer:{type:'lumina-footer',settings:{}}},order:['footer']});
// Build Tailwind from all original source classes and all native theme templates.
async function compileStyles(){
 const {compile}=require('@tailwindcss/node');const {Scanner}=require('@tailwindcss/oxide');
 const css=await compile('@import "tailwindcss";\n@theme { --font-sans: "Manrope", sans-serif; --font-playfair: "Lora", Georgia, serif; }',{base:root,onDependency:()=>{}});
 const scanner=new Scanner({sources:[{base:path.join(root,'src'),pattern:'**/*.{tsx,ts}',negated:false},{base:theme,pattern:'**/*.liquid',negated:false}]});
 write('assets/lumina-utilities.css',css.build(scanner.scan()));
}
compileStyles().then(()=>console.log('Built native theme sections and copied original assets.')).catch(error=>{console.error(error);process.exitCode=1;});
