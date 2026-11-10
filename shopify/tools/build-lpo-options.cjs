// Generates an LPO draft payload; does not change the store or subscription.
const fs = require('node:fs');
const path = require('node:path');
const data = require('../../src/data/pricing/pricing-data.json');
const dir = path.resolve(__dirname, '../.local/lpo');
const widths = [...data.widthBands].sort((a,b)=>a.widthInches-b.widthInches);
const heights = [...data.heightBands].sort((a,b)=>a.heightInches-b.heightInches);
const matrix = widths.map(w=>heights.map(h=>{
  const cell = data.priceCells.find(c=>c.widthBandId===w.id && c.heightBandId===h.id && c.priceBandId===data.priceBands[0].id);
  if (!cell) throw new Error('Missing pricing cell');
  return Number(cell.price);
}));
function formula(unit) {
  return `var w=x${unit==='cm'?'/2.54':''},h=y${unit==='cm'?'/2.54':''};if(!w||!h)return 0;var widths=${JSON.stringify(widths.map(w=>w.widthInches))},heights=${JSON.stringify(heights.map(h=>h.heightInches))},prices=${JSON.stringify(matrix)};var wi=widths.findIndex(function(v){return v>=Math.ceil(w-1e-9)}),hi=heights.findIndex(function(v){return v>=Math.ceil(h-1e-9)});if(wi<0||hi<0)return 0;return prices[wi][hi];`;
}
const options = [
  {name:'units',type:'button-swatch',label:'Measure your window',required:true,value:'in',values:[{value:'in',text:'Inches'},{value:'cm',text:'Centimeters'}],params:{size:'small',shape:'rect',toggle:false}},
  ...['in','cm'].map(unit=>({name:`size_${unit}`,type:'dimension',label:'Enter your measurements',required:true,conditions:[{data:'options',field:'units',operator:'equals',value:unit}],conditionMode:2,params:{labelX:'Width',labelY:'Height',addonX:unit==='in'?'Inches':'Centimeters',addonY:unit==='in'?'Inches':'Centimeters',minX:unit==='in'?10:25.4,minY:unit==='in'?10:25.4,maxX:unit==='in'?138:350.52,maxY:unit==='in'?79:200.66,valueTemplate:`{x} x {y} ${unit}`,help:unit==='in'?'Width 10–138 in · Height 10–79 in. Enter fractions as decimals (e.g. 24.5).':'Width 25.4–350.52 cm · Height 25.4–200.66 cm.',priceFormula:formula(unit),priceFormulaDeductVP:false,labelPriceText:false,valuePriceText:false}})),
  {name:'fabric_color',type:'color-swatch',label:'Blind Color',required:true,value:'white',values:[{value:'white',text:'White',color:'#ffffff'},{value:'cream',text:'Cream',color:'#E6E5DE'},{value:'graphite',text:'Graphite',color:'#53565b'},{value:'blue',text:'Blue',color:'#4a90d9'}],params:{shape:'circle',size:'medium',labelValueText:true,toggle:false}},
  {name:'frame_color',type:'color-swatch',label:'Frame Color',required:true,value:'white',values:[{value:'white',text:'White',color:'#ffffff'},{value:'graphite',text:'Graphite',color:'#53565b'}],params:{shape:'circle',size:'medium',labelValueText:true,toggle:false}},
  {name:'opening_direction',type:'button-swatch',label:'Opening Direction',required:true,value:'left-right',values:[{value:'left-right',text:'Left to Right'},{value:'right-left',text:'Right to Left'},{value:'top-down',text:'Top Down'},{value:'split',text:'Split',price:75}],params:{shape:'rect',size:'medium',items:4,grow:false,toggle:false,valuePriceText:true,labelValueText:true}}
];
let checks=0;
for (let wi=0;wi<widths.length;wi++) for(let hi=0;hi<heights.length;hi++) {
  for(const unit of ['in','cm']) {
    const scale=unit==='cm'?2.54:1;
    const calculate=new Function('x','y','area',formula(unit));
    for(const [w,h] of [[widths[wi].widthInches,heights[hi].heightInches],[wi?widths[wi-1].widthInches+.125:10,hi?heights[hi-1].heightInches+.125:10]]) {
      if(calculate(w*scale,h*scale,0)!==matrix[wi][hi])throw new Error(`Price mismatch ${unit} ${w}x${h}`);
      checks++;
    }
  }
}
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'lumina-options.json'),JSON.stringify(options,null,2));
fs.writeFileSync(path.join(dir,'prepare-args.json'),JSON.stringify({...JSON.parse(fs.readFileSync(path.join(dir,'session-args.json'))),optionsJson:JSON.stringify(options)}));
console.log(`Generated ${options.length} controls; ${checks} matrix and fractional boundary checks passed.`);
