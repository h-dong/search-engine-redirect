# Hao's Search

This is a fork of [unduck.link](https://unduck.link) with customizations that fits my use case better.

----

DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables all of DuckDuckGo's bangs to work, but much faster.

```txt
https://search.hao.dev?q=%s
```

If you would like to override the default bang, you can do so by adding the `d` parameter. For example, to use Google as the default bang, you can do:

```txt
https://hao.dev/search?d=g&q=%s
```

## How is it that much faster?

DuckDuckGo does their redirects server side. Their DNS is...not always great. Result is that it often takes ages.

This is a client side solution. Once you've went to the site once, the JS is all cache'd and will never need to be downloaded again. Your device does the redirects going forward.
