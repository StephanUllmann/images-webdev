# Dealing with images

Images might be more of a designer's topic than a web developer's. Yet, images are of crucial concern for us: they often make up the largest share of a modern website's load, and as web developers, we need to know at least a few things about them to optimize our pages accordingly.

## TL;DR

- Use WebP as the standard image format (AVIF might be the go-to in the future).
- Lazy load images that are not initially in view.
- Use optimized image components and CDNs.
- If that's not possible, add sizes and srcset to your img tags to let the Browser choose.

## CSS

We'll cover CSS recommendations only briefly here. Below, you see a reset that you can use in your CSS file. You may see some variations on this. Sometimes people prefer turning `img` elements into block elements; here, we're leaving them as inline. The first line has the most probable and visible effect: it restricts the image from growing beyond its parent's width.h.

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

Most performance optimizations concerning images are done outside our programming context or within good old HTML.

### Choose the Right Format

[Choosing image format](https://dodonut.com/blog/best-image-formats-for-the-web/)
There are many image formats to choose from, and modern browsers support quite a few of them.
The most prominent are PNG, JPG, SVG, WebP, and AVIF.

- PNGs (Portable Network Graphics) aren't as portable as the name suggests. They usually have high-quality plain graphics, support transparent layers, and offer lossless compression. However, they are still large compared to other formats and not suitable for high-quality photos.
- JPGs (Joint Photographic Experts Group) is the oldest format on this list, having been published in 1992. It's also the second most widespread format on the web, after PNGs. Use them when you need to ensure compatibility with older browsers, as nearly everything can display JPGs. They offer high-quality images but lack transparency and tend to have relatively large file sizes.
- SVGs (Scalable Vector Graphics) are written in HTML-like code and describe how shapes and lines should be drawn by the browser. They are ideal for icons and illustrations, as they are animatable, lightweight, and can be embedded directly into your HTML. However, they are not suitable for photos.
- WebPs are the modern successor to JPGs, replacing them as the standard format for the web. They compress very effectively, support transparency, and can be animated like GIFs. WebP should be your go-to image format.
- AVIFs are a very modern format, now supported in all modern browsers. They offer even better compression than WebP but require longer decoding times. They also support transparency and are animatable. (In my tests, I never achieved better compression rates than with WebP, but that might be my stupidity.)
- There are many more formats; look into them if you like. Maybe someday we'll get JPEG XL as a successor, maybe not. Might be worthwhile remembering.

### I've Got This JPG...

You need to re-format an image? Go googling. Use programs like [XnConvert](https://www.xnview.com/en/xnconvert/), or write a little Node.js script utilizing [sharp](https://sharp.pixelplumbing.com/).

### The Best Image Optimization

...is to not load the image at all.
If you know that an image won't be in view when the user first enters your webpage, it's best to let the browser load it lazily. Lazy loading allows the browser to prioritize critical tasks, such as rendering HTML, applying CSS, running essential JavaScript, and loading more important assets. Once these tasks are completed, and as the user scrolls closer to the lazily loaded image (increasing the likelihood of it being seen), the browser will fetch and decode the image. A superpower needing 100 lines of code? No, just a simple HTML attribute (superpower, same thing):`loading='lazy'`

```html
<img
  src="assets/sun-setting-1000.webp"
  alt="The sun is setting over a field of tall grass."
  loading="lazy"
  width="1000"
  height="550"
/>
```

It's best practice to include `width` and `height` attributes as well. These prevent elements from shifting around when the image finally loads (called _Cumulative Layout Shift_, which impacts your page's scoring badly).
Don't worry about making this pixel perfect, the browser needs them for the aspect-ratio mainly. CSS styles will still apply later.

### Let the Browser Choose

Using the right format and lazy loading takes us far in improving image performance, but there's one more critical thing we can do. It's unnecessary to load a 2000px wide image on a mobile phone. Even on high-resolution displays, it's more efficient to load a more fitting version of the image. HTML to the rescue!

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

The `sizes` attribute works like a media query, but it runs before any CSS is applied, before the layout is known to the browser. That's why you can tell the browser how big the expected image will be. You usually use `vw` as the unit, indicating the image will take up a specific portion of the viewport width. In the case of our hero image, that will always be the full screen—100vw.
The other images will take up a different amount of space according to the device's size. If the screen is below 600px, the image will need 100vw; under 1000px, it’ll take up half the width; and on larger screens, it'll occupy 33vw.

Combining this with the `srcset` attribute lets the browser choose the best image source to load, depending on various factors like screen size, pixel density, and even network conditions. You provide a list of sources and intrinsic sizes. For instance, `assets/sun-setting-320.webp 320w` loads the 320px-wide version of our image when the used space is approximately 320px. The `320w` indicates the intrinsic width of the image.

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
