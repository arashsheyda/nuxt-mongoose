import{d,az as x,x as _,H as o,b as f,c as z,ay as I,I as a,l as S}from"./entry.smrWno0O.js";const y=d({__name:"IconCSS",props:{name:{type:String,required:!0},size:{type:String,default:""}},setup(l){var r;x(s=>({"85f54cb8":a(m)}));const e=_();(r=e==null?void 0:e.nuxtIcon)!=null&&r.aliases;const n=l,p=o(()=>{var s;return(((s=e==null?void 0:e.nuxtIcon)==null?void 0:s.aliases)||{})[n.name]||n.name}),m=o(()=>`url('https://api.iconify.design/${p.value.replace(":","/")}.svg')`),c=o(()=>{var t,i,u;if(!n.size&&typeof((t=e.nuxtIcon)==null?void 0:t.size)=="boolean"&&!((i=e.nuxtIcon)!=null&&i.size))return;const s=n.size||((u=e.nuxtIcon)==null?void 0:u.size)||"1em";return String(Number(s))===s?`${s}px`:s});return(s,t)=>(f(),z("span",{style:I({width:a(c),height:a(c)})},null,4))}}),h=S(y,[["__scopeId","data-v-a58be67d"]]);export{h as default};