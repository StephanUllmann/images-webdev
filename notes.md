# Dealing with images

Images might be more of a Designer's topic that a Web Developer's one. Yet images are at least of one crucial concern for us: often they make up the top share of a modern website's load, and we as Web Developers need to know at least a few things about them to optimize our pages accordingly.

## TL;DR

- use webp as standard image format (avif might be the goto in the future)
- lazy load images, that are not in view initially
- use optimized Image components and CDNs
- if that's not possible, add sizes and srcset to your img tags to let the browser choose

## CSS

We'll cover CSS recommendations only briefly here. Below you see a reset, that you can use in your CSS file. You may see some variations on that. Sometimes people prefer turning imgs into block elements, here, we're leaving them as inline. The first line has the mist probable and vsible effect: it restricts the image to grow beyond it's parents width.

```css
/* A more effective CSS Image Reset: https://gist.github.com/palashmon/35bda7887eb4bc45459d71eca3dda7a5 */
img {
  max-width: 100%; /* don't exeed container's width */
  height: auto;
  vertical-align: middle; /* aligns image with text - mind it's an inline element */
  font-style: italic; /* makes alt text stand out */
  background-repeat: no-repeat; /* don't repeat yourself */
  background-size: cover; /* fill container without repeating */
  shape-margin: 1rem; /* add spacing around image */
}
```

## Performance Optimizations

Most performance optimizations concerning images are done outside of our programming context or inside good old HTML.

### Choose the right format

[Choosing image format](https://dodonut.com/blog/best-image-formats-for-the-web/)
There are many image formats to choose from and modern browsers support quite a lot of them.
The most prominent are PNG, JPG, SVG, WEBP and AVIF.

- PNGs (Portable Network Graphics) aren't that portable, as their name suggests. They usually have high quality plain graphics, support transparent layers and offers lossless compression. But they are still huge compared to other formats, and not suitable for high quality photos.
- JPGs (Joint Photographic Experts Group) is the oldes format in this list, being published in 1992. It's also the second most widespread format in the Web, after PNGs. Use them, when you need to ensure compatibility with older browsers, since everything can display JPG. They also offer high quality images, but without transparency and relatively high file sizes.
- SVGs are vector graphics. They are written in HTML-like code and describe how shapes and lines need to be drawn by the browser. They are ideal for icons and illustrations. They are animateable, leightweight, can be embedded directly into your HTML. They are not suitable for photos, though.
- WEBPs are the modern successor of JPGs, replacing them as the standard format for the Web. They can be compressed very effecively, come with a transparency layer and can be animated like GIFs. Choose WEBP as your goto image format.
- AVIFs are a very modern format, now supported in all modern Browsers. They offer even better compression that WEBP, for a longer decoding time. They also come with transparency and are animateable. (In my tests with different formats I never reached better compression rates that with WEBP. But that might be my fault.)
- There are many more formats, look into them, if you like. Maybe someday we'll get JPEG XL as a successor, maybe not. Might be worthwile remembering.

### I've got this JPG...

You need to re-format an image? Go googling. Use programms like [XnConvert](https://www.xnview.com/en/xnconvert/), or write a little Node.js script utilizing [sharp](https://sharp.pixelplumbing.com/).

### The best image optimization

...is to not load the image at all.
If you know that your image won't be in view when the user enters your webpage, then it's best that you let the browser load it lazily. Loading lazy means that the Browser can do critical work first, render HTML, apply CSS, load and run critical JavaScript, load more important images... Only when these more important tasks are done, and when the user scrolls closer to the lazily loaded image - and the probability increases that they will actually see this image - then the Browser reaches out to fetch and decode your image. A superpower you need 100 lines of code? No, a simple HTML attribute (superpower, same thing). `loading='lazy'`

```html
<img
  src="assets/sun-setting-1000.webp"
  alt="The sun is setting over a field of tall grass."
  loading="lazy"
  width="1000"
  height="550"
/>
```

It's best practice to include width and height attributes as well. They prevent your elements from shifting around when the image is finally there. (Called Layout Shift. It impacts the scoring of your page very badly.)
Don't worry to make this pixel perfect. Stylings will still apply.

### Let the browser choose

The right format and lazy loading is moving us far in improving image performance. Yet there is one more critical thing we can do. It's unnecessary to load a 2000px wide image on a mobile phone. Even on high resolution displays it's more efficient to load a more fitting version of that image. HTML to the rescue!

```html
<section class="hero">
  <img
    sizes="100vw"
    srcset="
      assets/northern-lights-320.webp   320w,
      assets/northern-lights-640.webp   640w,
      assets/northern-lights-1280.webp 1280w,
      assets/northern-lights-1920.webp 1920w
    "
    src="assets/northern-lights-1920.webp"
    alt="Northern Lights by Jonathan Bean"
    loading="eager"
  />
  <h2>Images are <span>awesome</span></h2>
</section>
<section>
  <div class="flex">
    <img
      sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
      srcset="assets/sun-setting-320.webp 320w, assets/sun-setting-640.webp 640w, assets/sun-setting-1280.webp 1280w"
      src="assets/sun-setting-1280.webp"
      alt="The sun is setting over a field of tall grass."
      loading="lazy"
      width="700"
      height="450"
    />
  </div>
</section>
```

The `sizes` attribute works like a media query. But it is running way before any CSS, before any layout is known to the Browser. That's why you can tell it here, how big the expected image will be. You usually use `vw` as unit here, teling the Browser, this image will take us that much from the viewport width. In case of our hero image that will always be the full screen - 100vw.
The other images will take up a different amount of space according to the device's size. If the screen is below 600px, the image will need 100vw, under 1000px it'll take up half the width, and on all other 33vw.

Combining this with the `srcset` attribute lets the Browser choose the best source to load the image from - depending on various factors, like screen size, screen pixel density and even network conditions. You provide a list of sources and intrinsic sizes. `assets/sun-setting-320.webp 320w` for instance loads the 320 version of our image when the used space is approximately 320px. `320w` is the intrinsic width of our image on the screen.

The point here is, that we let the Browser decide, which image would fit best. We hand over control to it, giving it a buffet of images to choose from, and let it deal with the data diet.

## Resources

[Choosing image format](https://dodonut.com/blog/best-image-formats-for-the-web/)
[The image decoding attribute](https://www.tunetheweb.com/blog/what-does-the-image-decoding-attribute-actually-do/)

## Attributions

Olga Schraven - a-deer-with-antlers-standing-in-a-field
Steve Gribble - a-night-sky-with-a-star-filled-sky
Iain Kennedy - a-view-of-a-beach-with-rocks-and-water
Liana S - the-sun-is-setting-over-a-field-of-tall-grass
Jonathan Bean - Northern Lights
