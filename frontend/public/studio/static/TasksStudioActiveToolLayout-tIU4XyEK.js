import"./rolldown-runtime-CNC7AqOf.js";import{n as e,t}from"./react-K5XiZLH2.js";import{t as n}from"./compiler-runtime-BbCBI_et.js";import{F as r,S as i,ai as a,ht as o,ii as s,k as c,wt as l}from"./dist-Ci2zSUp9.js";import{Ci as u,Di as d,Ei as f,Oi as p,Qr as m,Si as h,Ti as g,Ut as _,Zr as v,_i as y,bi as b,bo as x,ca as S,gi as C,hi as w,mi as T}from"./sanity-CnPAYygU.js";var E=e(),D=n();t(),x(),f(),g(),b(),u(),y(),d(),p(),h(),S(),C(),w(),T();var O=1,k=3,A=a(c).withConfig({displayName:`RootFlex`,componentId:`sc-1y8zfkj-0`})(({theme:e})=>s`
    min-height: 100%;

    @media (max-width: ${e.sanity.media[k]}px) {
      position: relative;
    }
  `),j=a(r).withConfig({displayName:`SidebarMotionLayer`,componentId:`sc-1y8zfkj-1`})(({theme:e})=>{let t=e.sanity.media;return s`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 360px;
    border-left: 1px solid var(--card-border-color);
    box-sizing: border-box;
    overflow: hidden;

    box-shadow:
      0px 6px 8px -4px var(--card-shadow-umbra-color),
      0px 12px 17px -1px var(--card-shadow-penumbra-color);

    @media (max-width: ${t[k]}px) {
      bottom: 0;
      position: absolute;
      right: 0;
      top: 0;
    }

    @media (max-width: ${t[O]}px) {
      border-left: 0;
      min-width: 100%;
      left: 0;
    }
  `});function M(e){let t=(0,D.c)(12),n=o(),{state:r}=m(),{isOpen:a}=r,s=n<=O&&a?`hidden`:`auto`,c;t[0]===e?c=t[1]:(c=e.renderDefault(e),t[0]=e,t[1]=c);let u;t[2]!==s||t[3]!==c?(u=(0,E.jsx)(i,{flex:1,height:`fill`,overflow:s,children:c}),t[2]=s,t[3]=c,t[4]=u):u=t[4];let d;t[5]===a?d=t[6]:(d=a&&(0,E.jsx)(j,{zOffset:100,height:`fill`,children:(0,E.jsx)(_,{})}),t[5]=a,t[6]=d);let f;t[7]===d?f=t[8]:(f=(0,E.jsx)(l,{initial:!1,children:d}),t[7]=d,t[8]=f);let p;return t[9]!==u||t[10]!==f?(p=(0,E.jsxs)(A,{sizing:`border`,height:`fill`,children:[u,f]}),t[9]=u,t[10]=f,t[11]=p):p=t[11],p}function N(e){let t=(0,D.c)(4),{enabled:n}=v();if(!n){let n;return t[0]===e?n=t[1]:(n=e.renderDefault(e),t[0]=e,t[1]=n),n}let r;return t[2]===e?r=t[3]:(r=(0,E.jsx)(M,{...e}),t[2]=e,t[3]=r),r}export{N as TasksStudioActiveToolLayout};