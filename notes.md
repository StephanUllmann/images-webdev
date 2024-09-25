# Dealing with images

Images might be more of a designer's topic than a web developer's. Yet, images are of crucial concern for us: they often make up the largest share of a modern website's load, and as web developers, we need to know at least a few things about them to optimize our pages accordingly.

## TL;DR

- Use WebP as the standard image format (AVIF might be the go-to in the future).
- Lazy load images that are not initially in view.
- Use optimized image components and CDNs.
- If that's not possible, add sizes and srcset to your img tags to let the Browser choose.

## CSS

We'll cover CSS recommendations only briefly here. Below, you see a reset that you can use in your CSS file. You may see some variations on this. Sometimes people prefer turning `img` elements into block elements; here, we're leaving them as inline. The first line has the most probable and visible effect: it restricts the image from growing beyond its parent's width.

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
- AVIFs are a very modern format, now supported in all modern browsers. They offer even better compression than WebP but require longer decoding times. They also support transparency and are animatable. (In my tests, I never achieved better compression rates than with WebP, but that might be due to my stupidity.)
- There are many more formats; look into them if you like. Maybe someday we'll get JPEG XL as a successor, maybe not. Might be worthwhile remembering.

Also, make sure to tailor the sizes of your images to your use case. A 4000x2000 JPEG might look awesome, but your hero section is rarely bigger than ~1900x800.

### I've Got This JPG...

You need to re-format and re-size an image? Go googling. Use programs like [XnConvert](https://www.xnview.com/en/xnconvert/), or write a little Node.js script utilizing [sharp](https://sharp.pixelplumbing.com/).

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
Don't worry about making this pixel perfect, the browser needs them for the aspect-ratio, not for painting the actual size. CSS styles will still apply later.
[Read more about it here](https://web.dev/learn/images/performance-issues#cumulative_layout_shift)

### Let the Browser Choose

Using the right format and lazy loading takes us far in improving image performance, but there's one more critical thing we can do: It's unnecessary to load a 2000px-wide image on a mobile phone. Even on high-resolution displays, it's more efficient to load a more fitting version of the image. HTML to the rescue!

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

The `sizes` attribute works like a media query, but it runs before any CSS is applied, before the layout is known to the browser. Here you can tell the browser upfront how large the image is expected to be. You typically use `vw` as the unit, indicating the image will take up a specific portion of the viewport width.In the case of the hero image, it will always take up the full screen—100vw.
Other images will take up different amounts of space depending on the device size. If the screen width is below 600px, the image will need 100vw; between 600px and 1000px, it will occupy half the screen; and on larger displays, it will take up 33vw.

Combining this with the `srcset` attribute allows the browser to choose the best image source based on factors like screen size, pixel density, and even network conditions. For instance, `assets/sun-setting-320.webp 320w` loads the 320px-wide version of the image when the available space is approximately 320px. The `320w` refers to the intrinsic width of the image.

The key point here is that we let the browser decide which image fits best. We hand over control, giving the browser a selection of images to choose from, and let it optimize the loading experience based on the user's context. We're giving it a buffet of images to choose from, and let it deal with the data diet.

As a fallback we provide the usual `src` attribute as well for older browsers, who know nothing about `srcset`.

## My Grandma Can't See My Picture...

You wanted to show your fancy, modern portfolio to your Grandma, but her IE6 messes up everything? Maybe your Grandma can only be helped with a [hack like the one described here](https://web.dev/learn/images/prescriptive#the_type_attribute). But if you want or need more control over what the browser chooses, or want to provide better fallbacks for 'freak image formats' like WebP, you can make use of the `picture` element.

```html
<picture>
  <source
    type="image/webp"
    sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
    srcset="assets/beachy-rock-320.webp 320w, assets/beachy-rock-640.webp 640w, assets/beachy-rock-1280.webp 1280w"
  />
  <img src="assets/beachy-rock-1280.jpeg" alt="A beachy rock at the sea." loading="lazy" width="700" height="450" />
</picture>
```

In it, you use an `img` element just as you normally would. It serves as fallback when no specified `source` matches or if the browser doesn't know how to deal with `picture`. You also add your `alt` text and attributes like `loading`, `width`, `height` and so on.
Within one or more `source` elements you define `sizes` and `src` or `srcset`. And you add a condition here. That's either the `type` of your image or a media query in the `media` attribute. In our case we define the `type` to be `image/webp`.
Another use case for the `picture` element is called _Art Direction_. If you want to provide different images on different media queries, you can do it like this:

```html
<picture>
  <source
    media="(orientation: landscape)"
    sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
    srcset="assets/beachy-rock-320.webp 320w, assets/beachy-rock-640.webp 640w, assets/beachy-rock-1280.webp 1280w"
  />
  <source
    media="(orientation: portrait)"
    sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
    srcset="assets/deer-320.webp 320w, assets/deer-640.webp 640w, assets/deer-1280.webp 1280w"
  />
  <img src="assets/beachy-rock-1280.jpeg" alt="A beachy rock at the sea." loading="lazy" width="700" height="450" />
</picture>
```

In the `media` attribute you specify a media query. In this case here we show the rocky beach on wide screens, the deer on tall ones. Note that in a real-world scenario, the images should usually depict the same content, but be tailored for different devices or layouts. That's why there is only one `alt` attribute on the `img`.

Using `sizes` and `srcset` on `img` elements provides a more descriptive approach, where the browser decides the best image based on the conditions provided. On the other hand, the `picture` element offers a prescriptive approach, giving you more control over which image formats are used and when. If you want or need more control over the final outcome, use the `picture` element.

### What's `decoding` doing?

Another tweak to image elements is the `decoding` attribute. When a browser reaches out to get a peculiar pic, it needs to decode the data mess it receives into awesome imagery. This can be done synchronously on the main thread, or asynchronously. Different browsers have different defaults here. And usually it barely makes any difference ([for more details, read this aweawesomely nerdy article](https://www.tunetheweb.com/blog/what-does-the-image-decoding-attribute-actually-do/)). Since synchronous decoding is blocking, adding many new images via JavaScript, "can lead to a slightly clunky user experience. So you might want to add `decoding="async"` when you are using React and adding many images at once.

### Final Advice

All this confusing code to save some kb? The great thing about these modern standards is, they can be written for us. I don't mean you should use some LLM to generate your `img` elements. You should use an image service, a CDN to serve your image. These services often come with JavaScript SDKs (Software Development Kits) that let you programmatically query the image format and size needed in the current situation. They integrate with frontend frameworks and often provide easy to use image components.
Modern full stack frameworks like Next.js or Astro also come with Image components that generate `srcset`s for you, making image optimization easier.

## Resources

[Choosing image format](https://dodonut.com/blog/best-image-formats-for-the-web/)
[The image decoding attribute](https://www.tunetheweb.com/blog/what-does-the-image-decoding-attribute-actually-do/)
[Syntax Highlighting Font](https://blog.glyphdrawing.club/font-with-built-in-syntax-highlighting/)

## Attributions

Olga Schraven - A deer with antlers standing in a field
Steve Gribble - A night sky with a star filled sky
Iain Kennedy - A view of a beach with rocks and water
Liana S - The sun is setting over a field of tall grass
Jonathan Bean - Northern Lights
