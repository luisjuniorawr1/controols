export type ExtraTool = { slug: string; category: string };

const add = (category:string, slugs:string[]):ExtraTool[] => slugs.map(slug=>({slug,category}));

export const pineToolExtras: ExtraTool[] = [
  ...add('calculator', [
    'calculator','area-calculator','single-rule-of-three-direct','single-rule-of-three-inverse','trigonometric-functions','radians-degrees-converter',
    'generate-list-of-numbers','filter-numbers','sort-numbers','minimum-maximum-list','average-list','number-base-converter','binary-converter','hexadecimal-converter','roman-numerals-converter'
  ]),
  ...add('design', [
    'lighten-color','darken-color','change-color-saturation','greyscale-color','invert-color','blend-colors','shift-color-hue','split-complementary-colors','monochromatic-colors','square-color-scheme'
  ]),
  ...add('text', [
    'reverse-list','list-randomizer','sort-list','add-text-to-each-line','convert-tabs-to-spaces','convert-spaces-to-tabs','remove-empty-lines','filter-lines','repeat-text','case-converter','count-lines','count-words','count-letters'
  ]),
  ...add('date', [
    'date-time-difference','add-to-a-date','subtract-from-a-date','timer','stopwatch','unix-timestamp-to-date-time','date-time-to-unix-timestamp'
  ]),
  ...add('security', [
    'random-number-generator','coin-flipper','dice-roller','gaussian-random-number-generator','password-generator','random-string-generator'
  ]),
  ...add('file', [
    'split-files','join-files','base64-encode-file','base64-decode-file','random-file-generator','corrupt-file-generator','corrupt-file'
  ]),
  ...add('developer', ['syntax-highlighter','css-inliner']),
  ...add('qr', ['pix-qr-code-generator']),
  ...add('video', ['screen-recorder']),
  ...add('image', [
    'darken-image','lighten-image','change-vibrance','change-exposure','adjust-gamma','clip-image','add-noise','adjust-hue','special-filters','adjust-channels','vignette-effect','colorize-image','merge-images','get-colors-from-image','tilt-shift-effect','emboss-effect','color-emboss-effect','threshold-black-white','posterize-effect','solarize-effect','edge-detection','edge-enhancement','round-corners-image','rotate-image','remove-noise','brightness-contrast','glow-effect','equalize-image','adjust-hsl','rgb-channels','image-histogram','censor-photo','overlay-images','random-bitmap-generator','duotone-effect','split-image','equalize-image-area','image-gradient-generator','image-radial-gradient-generator','svg-converter-viewer','blurred-frame-image-generator','take-screenshot','remove-background',
    'bulk-add-noise','bulk-blur-image','bulk-blurred-frame-image-generator','bulk-change-brightness','bulk-brightness-contrast','bulk-adjust-channels','bulk-clip-image','bulk-color-emboss-effect','bulk-colorize-image','bulk-change-contrast','bulk-crop-image','bulk-darken-image','bulk-edge-detection','bulk-edge-enhancement','bulk-emboss-effect','bulk-equalize-image','bulk-change-exposure','bulk-special-filters','bulk-flip-image','bulk-adjust-gamma','bulk-get-colors-from-image','bulk-glow-effect','bulk-grayscale-image','bulk-image-histogram','bulk-adjust-hsl','bulk-adjust-hue','bulk-invert-colors','bulk-lighten-image','bulk-merge-images','bulk-pixelate-effect','bulk-posterize-effect','bulk-random-bitmap-generator','bulk-remove-noise','bulk-resize-image','bulk-rgb-channels','bulk-rotate-image','bulk-round-corners-image','bulk-change-saturation','bulk-sepia-effect','bulk-sharpen-image','bulk-solarize-effect','bulk-split-image','bulk-duotone-effect','bulk-svg-converter-viewer','bulk-threshold-black-white','bulk-tilt-shift-effect','bulk-change-vibrance','bulk-vignette-effect'
  ])
];

export const pineImageExtraSlugs = new Set(pineToolExtras.filter(x=>x.category==='image').map(x=>x.slug));
export const pineFileExtraSlugs = new Set(pineToolExtras.filter(x=>x.category==='file').map(x=>x.slug));