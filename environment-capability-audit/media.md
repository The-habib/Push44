# Media & Security Processing Capabilities
- **FFmpeg 6.1.2**: Transcodes MP4, WebM, and animated GIFs.
- **ImageMagick 7.1.2**: Version: ImageMagick 7.1.2-7 Q16-HDRI x86_64 e3e6b54ad:20251014 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP(4.5) 
Delegates (built-in): bzlib cairo djvu fftw fontconfig freetype heic jng jp2 jpeg jxl lcms lqr lzma openexr pangocairo png raqm raw rsvg tiff webp x xml zlib zstd
Compiler: gcc (14.3)
Usage: magick tool [ {option} | {image} ... ] {output_image}
Usage: magick [ {option} | {image} ... ] {output_image}
       magick [ {option} | {image} ... ] -script {filename} [ {script_args} ...]

Image Settings:
  -adjoin              join images into a single multi-image file
  -affine matrix       affine transform matrix
  -alpha option        activate, deactivate, reset, or set the alpha channel
  -antialias           remove pixel-aliasing
  -authenticate password
                       decipher image with this password
  -attenuate value     lessen (or intensify) when adding noise to an image
  -background color    background color
  -bias value          add bias when convolving an image
  -black-point-compensation
                       use black point compensation
  -blue-primary point  chromaticity blue primary point
  -bordercolor color   border color
  -caption string      assign a caption to an image
  -clip                clip along the first path from the 8BIM profile
  -clip-mask filename  associate a clip mask with the image
  -clip-path id        clip along a named path from the 8BIM profile
  -colorspace type     alternate image colorspace
  -comment string      annotate image with comment
  -compose operator    set image composite operator
  -compress type       type of pixel compression when writing the image
  -define format:option
                       define one or more image format options
  -delay value         display the next image after pausing
  -density geometry    horizontal and vertical density of the image
  -depth value         image depth
  -direction type      render text right-to-left or left-to-right
  -display server      get image or font from this X server
  -dispose method      layer disposal method
  -dither method       apply error diffusion to image
  -encoding type       text encoding type
  -endian type         endianness (MSB or LSB) of the image
  -family name         render text with this font family
  -features distance   analyze image features (e.g. contrast, correlation)
  -fill color          color to use when filling a graphic primitive
  -filter type         use this filter when resizing an image
  -font name           render text with this font
  -format "string"     output formatted image characteristics
  -fuzz distance       colors within this distance are considered equal
  -gravity type        horizontal and vertical text placement
  -green-primary point chromaticity green primary point
  -illuminant type     reference illuminant
  -intensity method    method to generate an intensity value from a pixel
  -intent type         type of rendering intent when managing the image color
  -interlace type      type of image interlacing scheme
  -interline-spacing value
                       set the space between two text lines
  -interpolate method  pixel color interpolation method
  -interword-spacing value
                       set the space between two words
  -kerning value       set the space between two letters
  -label string        assign a label to an image
  -limit type value    pixel cache resource limit
  -loop iterations     add Netscape loop extension to your GIF animation
  -matte               store matte channel if the image has one
  -mattecolor color    frame color
  -moments             report image moments
  -monitor             monitor progress
  -orient type         image orientation
  -page geometry       size and location of an image canvas (setting)
  -ping                efficiently determine image attributes
  -pointsize value     font point size
  -precision value     maximum number of significant digits to print
  -preview type        image preview type
  -quality value       JPEG/MIFF/PNG compression level
  -quiet               suppress all warning messages
  -read-mask filename  associate a read mask with the image
  -red-primary point   chromaticity red primary point
  -regard-warnings     pay attention to warning messages
  -remap filename      transform image colors to match this set of colors
  -repage geometry     size and location of an image canvas
  -respect-parentheses settings remain in effect until parenthesis boundary
  -sampling-factor geometry
                       horizontal and vertical sampling factor
  -scene value         image scene number
  -seed value          seed a new sequence of pseudo-random numbers
  -size geometry       width and height of image
  -stretch type        render text with this font stretch
  -stroke color        graphic primitive stroke color
  -strokewidth value   graphic primitive stroke width
  -style type          render text with this font style
  -support factor      resize support: > 1.0 is blurry, < 1.0 is sharp
  -synchronize         synchronize image to storage device
  -taint               declare the image as modified
  -texture filename    name of texture to tile onto the image background
  -tile-offset geometry
                       tile offset
  -treedepth value     color tree depth
  -transparent-color color
                       transparent color
  -undercolor color    annotation bounding box color
  -units type          the units of image resolution
  -verbose             print detailed information about the image
  -view                FlashPix viewing transforms
  -virtual-pixel method
                       virtual pixel access method
  -weight type         render text with this font weight
  -white-point point   chromaticity white point
  -write-mask filename associate a write mask with the image  -word-break type     sets whether line breaks appear wherever the text would otherwise overflow

Image Operators:
  -adaptive-blur geometry
                       adaptively blur pixels; decrease effect near edges
  -adaptive-resize geometry
                       adaptively resize image using 'mesh' interpolation
  -adaptive-sharpen geometry
                       adaptively sharpen pixels; increase effect near edges
  -alpha option        on, activate, off, deactivate, set, opaque, copy
                       transparent, extract, background, or shape
  -annotate geometry text
                       annotate the image with text
  -auto-gamma          automagically adjust gamma level of image
  -auto-level          automagically adjust color levels of image
  -auto-orient         automagically orient (rotate) image
  -auto-threshold method
                       automatically perform image thresholding
  -bench iterations    measure performance
  -bilateral-blur geometry
                       non-linear, edge-preserving, and noise-reducing smoothing filter
  -black-threshold value
                       force all pixels below the threshold into black
  -blue-shift factor   simulate a scene at nighttime in the moonlight
  -blur geometry       reduce image noise and reduce detail levels
  -border geometry     surround image with a border of color
  -bordercolor color   border color
  -brightness-contrast geometry
                       improve brightness / contrast of the image
  -canny geometry      detect edges in the image
  -cdl filename        color correct with a color decision list
  -channel mask        set the image channel mask
  -charcoal radius     simulate a charcoal drawing
  -chop geometry       remove pixels from the image interior
  -clahe geometry      contrast limited adaptive histogram equalization
  -clamp               keep pixel values in range (0-QuantumRange)
  -colorize value      colorize the image with the fill color
  -color-matrix matrix apply color correction to the image
  -colors value        preferred number of colors in the image
  -connected-components connectivity
                       connected-components uniquely labeled
  -contrast            enhance or reduce the image contrast
  -contrast-stretch geometry
                       improve contrast by 'stretching' the intensity range
  -convolve coefficients
                       apply a convolution kernel to the image
  -cycle amount        cycle the image colormap
  -decipher filename   convert cipher pixels to plain pixels
  -deskew threshold    straighten an image
  -despeckle           reduce the speckles within an image
  -distort method args
                       distort images according to given method and args
  -draw string         annotate the image with a graphic primitive
  -edge radius         apply a filter to detect edges in the image
  -encipher filename   convert plain pixels to cipher pixels
  -emboss radius       emboss an image
  -enhance             apply a digital filter to enhance a noisy image
  -equalize            perform histogram equalization to an image
  -evaluate operator value
                       evaluate an arithmetic, relational, or logical expression
  -extent geometry     set the image size
  -extract geometry    extract area from image
  -fft                 implements the discrete Fourier transform (DFT)
  -flip                flip image vertically
  -floodfill geometry color
                       floodfill the image with color
  -flop                flop image horizontally
  -frame geometry      surround image with an ornamental border
  -function name parameters
                       apply function over image values
  -gamma value         level of gamma correction
  -gaussian-blur geometry
                       reduce image noise and reduce detail levels
  -geometry geometry   preferred size or location of the image
  -grayscale method    convert image to grayscale
  -hough-lines geometry
                       identify lines in the image
  -identify            identify the format and characteristics of the image
  -ift                 implements the inverse discrete Fourier transform (DFT)
  -implode amount      implode image pixels about the center
  -integral            calculate the sum of values (pixel values) in the image
  -interpolative-resize geometry
                       resize image using interpolation
  -kmeans geometry     K means color reduction
  -kuwahara geometry   edge preserving noise reduction filter
  -lat geometry        local adaptive thresholding
  -level value         adjust the level of image contrast
  -level-colors color,color
                       level image with the given colors
  -linear-stretch geometry
                       improve contrast by 'stretching with saturation'
  -liquid-rescale geometry
                       rescale image with seam-carving
  -local-contrast geometry
                       enhance local contrast
  -mean-shift geometry delineate arbitrarily shaped clusters in the image
  -median geometry     apply a median filter to the image
  -mode geometry       make each pixel the 'predominant color' of the
                       neighborhood
  -modulate value      vary the brightness, saturation, and hue
  -monochrome          transform image to black and white
  -morphology method kernel
                       apply a morphology method to the image
  -motion-blur geometry
                       simulate motion blur
  -negate              replace every pixel with its complementary color 
  -noise geometry      add or reduce noise in an image
  -normalize           transform image to span the full range of colors
  -opaque color        change this color to the fill color
  -ordered-dither NxN
                       add a noise pattern to the image with specific
                       amplitudes
  -paint radius        simulate an oil painting
  -perceptible epsilon
                       pixel value less than |epsilon| become epsilon or
                       -epsilon
  -polaroid angle      simulate a Polaroid picture
  -posterize levels    reduce the image to a limited number of color levels
  -profile filename    add, delete, or apply an image profile
  -quantize colorspace reduce colors in this colorspace
  -raise value         lighten/darken image edges to create a 3-D effect
  -random-threshold low,high
                       random threshold the image
  -range-threshold values
                       perform either hard or soft thresholding within some range of values in an image
  -region geometry     apply options to a portion of the image
  -render              render vector graphics
  -resample geometry   change the resolution of an image
  -reshape geometry    reshape the image
  -resize geometry     resize the image
  -roll geometry       roll an image vertically or horizontally
  -rotate degrees      apply Paeth rotation to the image
  -rotational-blur angle
                       rotational blur the image
  -sample geometry     scale image with pixel sampling
  -scale geometry      scale the image
  -segment values      segment an image
  -selective-blur geometry
                       selectively blur pixels within a contrast threshold
  -sepia-tone threshold
                       simulate a sepia-toned photo
  -set property value  set an image property
  -shade degrees       shade the image using a distant light source
  -shadow geometry     simulate an image shadow
  -sharpen geometry    sharpen the image
  -shave geometry      shave pixels from the image edges
  -shear geometry      slide one edge of the image along the X or Y axis
  -sigmoidal-contrast geometry
                       increase the contrast without saturating highlights or
                       shadows
  -sketch geometry     simulate a pencil sketch
  -solarize threshold  negate all pixels above the threshold level
  -sort-pixels         sort each scanline in ascending order of intensity
  -sparse-color method args
                       fill in a image based on a few color points
  -splice geometry     splice the background color into the image
  -spread radius       displace image pixels by a random amount
  -statistic type geometry
                       replace each pixel with corresponding statistic from the
                       neighborhood
  -strip               strip image of all profiles and comments
  -swirl degrees       swirl image pixels about the center
  -threshold value     threshold the image
  -thumbnail geometry  create a thumbnail of the image
  -tile filename       tile image when filling a graphic primitive
  -tint value          tint the image with the fill color
  -transform           affine transform image
  -transparent color   make this color transparent within the image
  -transpose           flip image vertically and rotate 90 degrees
  -transverse          flop image horizontally and rotate 270 degrees
  -trim                trim image edges
  -type type           image type
  -unique-colors       discard all but one of any pixel color
  -unsharp geometry    sharpen the image
  -vignette geometry   soften the edges of the image in vignette style
  -wave geometry       alter an image along a sine wave
  -wavelet-denoise threshold
                       removes noise from the image using a wavelet transform
  -white-balance       automagically adjust white balance of image
  -white-threshold value
                       force all pixels above the threshold into white

Image Channel Operators:
  -channel-fx expression
                       exchange, extract, or transfer one or more image channels
  -separate            separate an image channel into a grayscale image

Image Sequence Operators:
  -append              append an image sequence
  -clut                apply a color lookup table to the image
  -coalesce            merge a sequence of images
  -combine             combine a sequence of images
  -compare             mathematically and visually annotate the difference between an image and its reconstruction
  -complex operator    perform complex mathematics on an image sequence
  -composite           composite image
  -copy geometry offset
                       copy pixels from one area of an image to another
  -crop geometry       cut out a rectangular region of the image
  -deconstruct         break down an image sequence into constituent parts
  -evaluate-sequence operator
                       evaluate an arithmetic, relational, or logical expression
  -flatten             flatten a sequence of images
  -fx expression       apply mathematical expression to an image channel(s)
  -hald-clut           apply a Hald color lookup table to the image
  -layers method       optimize, merge, or compare image layers
  -morph value         morph an image sequence
  -mosaic              create a mosaic from an image sequence
  -poly terms          build a polynomial from the image sequence and the corresponding
                       terms (coefficients and degree pairs).
  -print string        interpret string and print to console
  -process arguments   process the image with a custom image filter
  -smush geometry      smush an image sequence together
  -write filename      write images to this file

Image Stack Operators:
  -clone indexes       clone an image
  -delete indexes      delete the image from the image sequence
  -duplicate count,indexes
                       duplicate an image one or more times
  -insert index        insert last image into the image sequence
  -reverse             reverse image sequence
  -swap indexes        swap two images in the image sequence

Miscellaneous Options:
  -debug events        display copious debugging information
  -distribute-cache port
                       distributed pixel cache spanning one or more servers
  -help                print program options
  -list type           print a list of supported option arguments
  -log format          format of debugging information
  -usage               print program usage
  -version             print version information

By default, the image format of 'file' is determined by its magic
number.  To specify a particular image format, precede the filename
with an image format name and a colon (i.e. ps:image) or specify the
image type as the filename suffix (i.e. image.ps).  Specify 'file' as
'-' for standard input or output., Version: ImageMagick 7.1.2-7 Q16-HDRI x86_64 e3e6b54ad:20251014 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP(4.5) 
Delegates (built-in): bzlib cairo djvu fftw fontconfig freetype heic jng jp2 jpeg jxl lcms lqr lzma openexr pangocairo png raqm raw rsvg tiff webp x xml zlib zstd
Compiler: gcc (14.3)
Usage: convert [options ...] file [ [options ...] file ...] [options ...] file

Image Settings:
  -adjoin              join images into a single multi-image file
  -affine matrix       affine transform matrix
  -alpha option        activate, deactivate, reset, or set the alpha channel
  -antialias           remove pixel-aliasing
  -authenticate password
                       decipher image with this password
  -attenuate value     lessen (or intensify) when adding noise to an image
  -background color    background color
  -bias value          add bias when convolving an image
  -black-point-compensation
                       use black point compensation
  -blue-primary point  chromaticity blue primary point
  -bordercolor color   border color
  -caption string      assign a caption to an image
  -clip                clip along the first path from the 8BIM profile
  -clip-mask filename  associate a clip mask with the image
  -clip-path id        clip along a named path from the 8BIM profile
  -colorspace type     alternate image colorspace
  -comment string      annotate image with comment
  -compose operator    set image composite operator
  -compress type       type of pixel compression when writing the image
  -define format:option
                       define one or more image format options
  -delay value         display the next image after pausing
  -density geometry    horizontal and vertical density of the image
  -depth value         image depth
  -direction type      render text right-to-left or left-to-right
  -display server      get image or font from this X server
  -dispose method      layer disposal method
  -dither method       apply error diffusion to image
  -encoding type       text encoding type
  -endian type         endianness (MSB or LSB) of the image
  -family name         render text with this font family
  -features distance   analyze image features (e.g. contrast, correlation)
  -fill color          color to use when filling a graphic primitive
  -filter type         use this filter when resizing an image
  -font name           render text with this font
  -format "string"     output formatted image characteristics
  -fuzz distance       colors within this distance are considered equal
  -gravity type        horizontal and vertical text placement
  -green-primary point chromaticity green primary point
  -illuminant type     reference illuminant
  -intensity method    method to generate an intensity value from a pixel
  -intent type         type of rendering intent when managing the image color
  -interlace type      type of image interlacing scheme
  -interline-spacing value
                       set the space between two text lines
  -interpolate method  pixel color interpolation method
  -interword-spacing value
                       set the space between two words
  -kerning value       set the space between two letters
  -label string        assign a label to an image
  -limit type value    pixel cache resource limit
  -loop iterations     add Netscape loop extension to your GIF animation
  -matte               store matte channel if the image has one
  -mattecolor color    frame color
  -moments             report image moments
  -monitor             monitor progress
  -orient type         image orientation
  -page geometry       size and location of an image canvas (setting)
  -ping                efficiently determine image attributes
  -pointsize value     font point size
  -precision value     maximum number of significant digits to print
  -preview type        image preview type
  -quality value       JPEG/MIFF/PNG compression level
  -quiet               suppress all warning messages
  -read-mask filename  associate a read mask with the image
  -red-primary point   chromaticity red primary point
  -regard-warnings     pay attention to warning messages
  -remap filename      transform image colors to match this set of colors
  -repage geometry     size and location of an image canvas
  -respect-parentheses settings remain in effect until parenthesis boundary
  -sampling-factor geometry
                       horizontal and vertical sampling factor
  -scene value         image scene number
  -seed value          seed a new sequence of pseudo-random numbers
  -size geometry       width and height of image
  -stretch type        render text with this font stretch
  -stroke color        graphic primitive stroke color
  -strokewidth value   graphic primitive stroke width
  -style type          render text with this font style
  -support factor      resize support: > 1.0 is blurry, < 1.0 is sharp
  -synchronize         synchronize image to storage device
  -taint               declare the image as modified
  -texture filename    name of texture to tile onto the image background
  -tile-offset geometry
                       tile offset
  -treedepth value     color tree depth
  -transparent-color color
                       transparent color
  -undercolor color    annotation bounding box color
  -units type          the units of image resolution
  -verbose             print detailed information about the image
  -view                FlashPix viewing transforms
  -virtual-pixel method
                       virtual pixel access method
  -weight type         render text with this font weight
  -white-point point   chromaticity white point
  -write-mask filename associate a write mask with the image  -word-break type     sets whether line breaks appear wherever the text would otherwise overflow

Image Operators:
  -adaptive-blur geometry
                       adaptively blur pixels; decrease effect near edges
  -adaptive-resize geometry
                       adaptively resize image using 'mesh' interpolation
  -adaptive-sharpen geometry
                       adaptively sharpen pixels; increase effect near edges
  -alpha option        on, activate, off, deactivate, set, opaque, copy
                       transparent, extract, background, or shape
  -annotate geometry text
                       annotate the image with text
  -auto-gamma          automagically adjust gamma level of image
  -auto-level          automagically adjust color levels of image
  -auto-orient         automagically orient (rotate) image
  -auto-threshold method
                       automatically perform image thresholding
  -bench iterations    measure performance
  -bilateral-blur geometry
                       non-linear, edge-preserving, and noise-reducing smoothing filter
  -black-threshold value
                       force all pixels below the threshold into black
  -blue-shift factor   simulate a scene at nighttime in the moonlight
  -blur geometry       reduce image noise and reduce detail levels
  -border geometry     surround image with a border of color
  -bordercolor color   border color
  -brightness-contrast geometry
                       improve brightness / contrast of the image
  -canny geometry      detect edges in the image
  -cdl filename        color correct with a color decision list
  -channel mask        set the image channel mask
  -charcoal radius     simulate a charcoal drawing
  -chop geometry       remove pixels from the image interior
  -clahe geometry      contrast limited adaptive histogram equalization
  -clamp               keep pixel values in range (0-QuantumRange)
  -colorize value      colorize the image with the fill color
  -color-matrix matrix apply color correction to the image
  -colors value        preferred number of colors in the image
  -connected-components connectivity
                       connected-components uniquely labeled
  -contrast            enhance or reduce the image contrast
  -contrast-stretch geometry
                       improve contrast by 'stretching' the intensity range
  -convolve coefficients
                       apply a convolution kernel to the image
  -cycle amount        cycle the image colormap
  -decipher filename   convert cipher pixels to plain pixels
  -deskew threshold    straighten an image
  -despeckle           reduce the speckles within an image
  -distort method args
                       distort images according to given method and args
  -draw string         annotate the image with a graphic primitive
  -edge radius         apply a filter to detect edges in the image
  -encipher filename   convert plain pixels to cipher pixels
  -emboss radius       emboss an image
  -enhance             apply a digital filter to enhance a noisy image
  -equalize            perform histogram equalization to an image
  -evaluate operator value
                       evaluate an arithmetic, relational, or logical expression
  -extent geometry     set the image size
  -extract geometry    extract area from image
  -fft                 implements the discrete Fourier transform (DFT)
  -flip                flip image vertically
  -floodfill geometry color
                       floodfill the image with color
  -flop                flop image horizontally
  -frame geometry      surround image with an ornamental border
  -function name parameters
                       apply function over image values
  -gamma value         level of gamma correction
  -gaussian-blur geometry
                       reduce image noise and reduce detail levels
  -geometry geometry   preferred size or location of the image
  -grayscale method    convert image to grayscale
  -hough-lines geometry
                       identify lines in the image
  -identify            identify the format and characteristics of the image
  -ift                 implements the inverse discrete Fourier transform (DFT)
  -implode amount      implode image pixels about the center
  -integral            calculate the sum of values (pixel values) in the image
  -interpolative-resize geometry
                       resize image using interpolation
  -kmeans geometry     K means color reduction
  -kuwahara geometry   edge preserving noise reduction filter
  -lat geometry        local adaptive thresholding
  -level value         adjust the level of image contrast
  -level-colors color,color
                       level image with the given colors
  -linear-stretch geometry
                       improve contrast by 'stretching with saturation'
  -liquid-rescale geometry
                       rescale image with seam-carving
  -local-contrast geometry
                       enhance local contrast
  -mean-shift geometry delineate arbitrarily shaped clusters in the image
  -median geometry     apply a median filter to the image
  -mode geometry       make each pixel the 'predominant color' of the
                       neighborhood
  -modulate value      vary the brightness, saturation, and hue
  -monochrome          transform image to black and white
  -morphology method kernel
                       apply a morphology method to the image
  -motion-blur geometry
                       simulate motion blur
  -negate              replace every pixel with its complementary color 
  -noise geometry      add or reduce noise in an image
  -normalize           transform image to span the full range of colors
  -opaque color        change this color to the fill color
  -ordered-dither NxN
                       add a noise pattern to the image with specific
                       amplitudes
  -paint radius        simulate an oil painting
  -perceptible epsilon
                       pixel value less than |epsilon| become epsilon or
                       -epsilon
  -polaroid angle      simulate a Polaroid picture
  -posterize levels    reduce the image to a limited number of color levels
  -profile filename    add, delete, or apply an image profile
  -quantize colorspace reduce colors in this colorspace
  -raise value         lighten/darken image edges to create a 3-D effect
  -random-threshold low,high
                       random threshold the image
  -range-threshold values
                       perform either hard or soft thresholding within some range of values in an image
  -region geometry     apply options to a portion of the image
  -render              render vector graphics
  -resample geometry   change the resolution of an image
  -reshape geometry    reshape the image
  -resize geometry     resize the image
  -roll geometry       roll an image vertically or horizontally
  -rotate degrees      apply Paeth rotation to the image
  -rotational-blur angle
                       rotational blur the image
  -sample geometry     scale image with pixel sampling
  -scale geometry      scale the image
  -segment values      segment an image
  -selective-blur geometry
                       selectively blur pixels within a contrast threshold
  -sepia-tone threshold
                       simulate a sepia-toned photo
  -set property value  set an image property
  -shade degrees       shade the image using a distant light source
  -shadow geometry     simulate an image shadow
  -sharpen geometry    sharpen the image
  -shave geometry      shave pixels from the image edges
  -shear geometry      slide one edge of the image along the X or Y axis
  -sigmoidal-contrast geometry
                       increase the contrast without saturating highlights or
                       shadows
  -sketch geometry     simulate a pencil sketch
  -solarize threshold  negate all pixels above the threshold level
  -sort-pixels         sort each scanline in ascending order of intensity
  -sparse-color method args
                       fill in a image based on a few color points
  -splice geometry     splice the background color into the image
  -spread radius       displace image pixels by a random amount
  -statistic type geometry
                       replace each pixel with corresponding statistic from the
                       neighborhood
  -strip               strip image of all profiles and comments
  -swirl degrees       swirl image pixels about the center
  -threshold value     threshold the image
  -thumbnail geometry  create a thumbnail of the image
  -tile filename       tile image when filling a graphic primitive
  -tint value          tint the image with the fill color
  -transform           affine transform image
  -transparent color   make this color transparent within the image
  -transpose           flip image vertically and rotate 90 degrees
  -transverse          flop image horizontally and rotate 270 degrees
  -trim                trim image edges
  -type type           image type
  -unique-colors       discard all but one of any pixel color
  -unsharp geometry    sharpen the image
  -vignette geometry   soften the edges of the image in vignette style
  -wave geometry       alter an image along a sine wave
  -wavelet-denoise threshold
                       removes noise from the image using a wavelet transform
  -white-balance       automagically adjust white balance of image
  -white-threshold value
                       force all pixels above the threshold into white

Image Channel Operators:
  -channel-fx expression
                       exchange, extract, or transfer one or more image channels
  -separate            separate an image channel into a grayscale image

Image Sequence Operators:
  -append              append an image sequence
  -clut                apply a color lookup table to the image
  -coalesce            merge a sequence of images
  -combine             combine a sequence of images
  -compare             mathematically and visually annotate the difference between an image and its reconstruction
  -complex operator    perform complex mathematics on an image sequence
  -composite           composite image
  -copy geometry offset
                       copy pixels from one area of an image to another
  -crop geometry       cut out a rectangular region of the image
  -deconstruct         break down an image sequence into constituent parts
  -evaluate-sequence operator
                       evaluate an arithmetic, relational, or logical expression
  -flatten             flatten a sequence of images
  -fx expression       apply mathematical expression to an image channel(s)
  -hald-clut           apply a Hald color lookup table to the image
  -layers method       optimize, merge, or compare image layers
  -morph value         morph an image sequence
  -mosaic              create a mosaic from an image sequence
  -poly terms          build a polynomial from the image sequence and the corresponding
                       terms (coefficients and degree pairs).
  -print string        interpret string and print to console
  -process arguments   process the image with a custom image filter
  -smush geometry      smush an image sequence together
  -write filename      write images to this file

Image Stack Operators:
  -clone indexes       clone an image
  -delete indexes      delete the image from the image sequence
  -duplicate count,indexes
                       duplicate an image one or more times
  -insert index        insert last image into the image sequence
  -reverse             reverse image sequence
  -swap indexes        swap two images in the image sequence

Miscellaneous Options:
  -debug events        display copious debugging information
  -distribute-cache port
                       distributed pixel cache spanning one or more servers
  -help                print program options
  -list type           print a list of supported option arguments
  -log format          format of debugging information
  -version             print version information

By default, the image format of 'file' is determined by its magic
number.  To specify a particular image format, precede the filename
with an image format name and a colon (i.e. ps:image) or specify the
image type as the filename suffix (i.e. image.ps).  Specify 'file' as
'-' for standard input or output., Version: ImageMagick 7.1.2-7 Q16-HDRI x86_64 e3e6b54ad:20251014 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP(4.5) 
Delegates (built-in): bzlib cairo djvu fftw fontconfig freetype heic jng jp2 jpeg jxl lcms lqr lzma openexr pangocairo png raqm raw rsvg tiff webp x xml zlib zstd
Compiler: gcc (14.3)
Usage: identify [options ...] file [ [options ...] file ... ]

Image Settings:
  -alpha option        on, activate, off, deactivate, set, opaque, copy
                       transparent, extract, background, or shape
  -antialias           remove pixel-aliasing
  -authenticate password
                       decipher image with this password
  -clip                clip along the first path from the 8BIM profile
  -clip-mask filename  associate a clip mask with the image
  -clip-path id        clip along a named path from the 8BIM profile
  -colorspace type     alternate image colorspace
  -crop geometry       cut out a rectangular region of the image
  -define format:option
                       define one or more image format options
  -density geometry    horizontal and vertical density of the image
  -depth value         image depth
  -endian type         endianness (MSB or LSB) of the image
  -extract geometry    extract area from image
  -features distance   analyze image features (e.g. contrast, correlation)
  -format "string"     output formatted image characteristics
  -fuzz distance       colors within this distance are considered equal
  -gamma value         of gamma correction
  -interlace type      type of image interlacing scheme
  -interpolate method  pixel color interpolation method
  -limit type value    pixel cache resource limit
  -matte               store matte channel if the image has one
  -moments             report image moments
  -monitor             monitor progress
  -ping                efficiently determine image attributes
  -precision value     maximum number of significant digits to print
  -quiet               suppress all warning messages
  -regard-warnings     pay attention to warning messages
  -respect-parentheses settings remain in effect until parenthesis boundary
  -sampling-factor geometry
                       horizontal and vertical sampling factor
  -seed value          seed a new sequence of pseudo-random numbers
  -set attribute value set an image attribute
  -size geometry       width and height of image
  -strip               strip image of all profiles and comments
  -unique              display the number of unique colors in the image
  -units type          the units of image resolution
  -verbose             print detailed information about the image
  -virtual-pixel method
                       virtual pixel access method

Image Operators:
  -auto-orient         automagically orient (rotate) image
  -channel mask        set the image channel mask
  -grayscale method    convert image to grayscale
  -negate              replace every pixel with its complementary color

Miscellaneous Options:
  -debug events        display copious debugging information
  -help                print program options
  -list type           print a list of supported option arguments
  -log format          format of debugging information
  -version             print version information

By default, the image format of 'file' is determined by its magic
number.  To specify a particular image format, precede the filename
with an image format name and a colon (i.e. ps:image) or specify the
image type as the filename suffix (i.e. image.ps).  Specify 'file' as
'-' for standard input or output., Version: ImageMagick 7.1.2-7 Q16-HDRI x86_64 e3e6b54ad:20251014 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP(4.5) 
Delegates (built-in): bzlib cairo djvu fftw fontconfig freetype heic jng jp2 jpeg jxl lcms lqr lzma openexr pangocairo png raqm raw rsvg tiff webp x xml zlib zstd
Compiler: gcc (14.3)
Usage: compare [options ...] image reconstruct difference

Image Settings:
  -adjoin              join images into a single multi-image file
  -alpha option        on, activate, off, deactivate, set, opaque, copy
                       transparent, extract, background, or shape
  -authenticate password
                       decipher image with this password
  -background color    background color
  -colorspace type     alternate image colorspace
  -compose operator    set image composite operator
  -compress type       type of pixel compression when writing the image
  -decipher filename   convert cipher pixels to plain pixels
  -define format:option
                       define one or more image format options
  -density geometry    horizontal and vertical density of the image
  -depth value         image depth
  -dissimilarity-threshold value
                       maximum distortion for (sub)image match
  -encipher filename   convert plain pixels to cipher pixels
  -extract geometry    extract area from image
  -format "string"     output formatted image characteristics
  -fuzz distance       colors within this distance are considered equal
  -gravity type        horizontal and vertical text placement
  -highlight-color color
                       emphasize pixel differences with this color
  -identify            identify the format and characteristics of the image
  -interlace type      type of image interlacing scheme
  -limit type value    pixel cache resource limit
  -lowlight-color color
                       de-emphasize pixel differences with this color
  -metric type         measure differences between images with this metric
  -monitor             monitor progress
  -negate              replace every pixel with its complementary color 
  -passphrase filename get the passphrase from this file
  -precision value     maximum number of significant digits to print
  -profile filename    add, delete, or apply an image profile
  -quality value       JPEG/MIFF/PNG compression level
  -quiet               suppress all warning messages
  -quantize colorspace reduce colors in this colorspace
  -read-mask filename  associate a read mask with the image
  -regard-warnings     pay attention to warning messages
  -respect-parentheses settings remain in effect until parenthesis boundary
  -sampling-factor geometry
                       horizontal and vertical sampling factor
  -seed value          seed a new sequence of pseudo-random numbers
  -set attribute value set an image attribute
  -quality value       JPEG/MIFF/PNG compression level
  -repage geometry     size and location of an image canvas
  -similarity-threshold value
                       minimum distortion for (sub)image match
  -size geometry       width and height of image
  -subimage-search     search for subimage
  -synchronize         synchronize image to storage device
  -taint               declare the image as modified
  -transparent-color color
                       transparent color
  -type type           image type
  -verbose             print detailed information about the image
  -version             print version information
  -virtual-pixel method
                       virtual pixel access method
  -write-mask filename  associate a write mask with the image

Image Operators:
  -auto-orient         automagically orient (rotate) image
  -brightness-contrast geometry
                       improve brightness / contrast of the image
  -distort method args
                       distort images according to given method and args
  -level value         adjust the level of image contrast
  -resize geometry     resize the image
  -rotate degrees      apply Paeth rotation to the image
  -sigmoidal-contrast geometry
                       increase the contrast without saturating highlights or
  -trim                trim image edges
  -write filename      write images to this file

Image Channel Operators:
  -separate            separate an image channel into a grayscale image

Image Sequence Operators:
  -crop geometry       cut out a rectangular region of the image

Image Stack Operators:
  -delete indexes      delete the image from the image sequence

Miscellaneous Options:
  -channel mask        set the image channel mask
  -debug events        display copious debugging information
  -help                print program options
  -list type           print a list of supported option arguments
  -log format          format of debugging information

By default, the image format of 'file' is determined by its magic
number.  To specify a particular image format, precede the filename
with an image format name and a colon (i.e. ps:image) or specify the
image type as the filename suffix (i.e. image.ps).  Specify 'file' as
'-' for standard input or output., Version: ImageMagick 7.1.2-7 Q16-HDRI x86_64 e3e6b54ad:20251014 https://imagemagick.org
Copyright: (C) 1999 ImageMagick Studio LLC
License: https://imagemagick.org/script/license.php
Features: Cipher DPC HDRI OpenMP(4.5) 
Delegates (built-in): bzlib cairo djvu fftw fontconfig freetype heic jng jp2 jpeg jxl lcms lqr lzma openexr pangocairo png raqm raw rsvg tiff webp x xml zlib zstd
Compiler: gcc (14.3)
Usage: composite [options ...] image [options ...] composite
  [ [options ...] mask ] [options ...] composite

Image Settings:
  -affine matrix       affine transform matrix
  -alpha option        on, activate, off, deactivate, set, opaque, copy
                       transparent, extract, background, or shape
  -authenticate password
                       decipher image with this password
  -blue-primary point  chromaticity blue primary point
  -colorspace type     alternate image colorspace
  -comment string      annotate image with comment
  -compose operator    composite operator
  -compress type       type of pixel compression when writing the image
  -define format:option
                       define one or more image format options
  -depth value         image depth
  -density geometry    horizontal and vertical density of the image
  -display server      get image or font from this X server
  -dispose method      layer disposal method
  -dither method       apply error diffusion to image
  -encoding type       text encoding type
  -endian type         endianness (MSB or LSB) of the image
  -filter type         use this filter when resizing an image
  -font name           render text with this font
  -format "string"     output formatted image characteristics
  -gravity type        which direction to gravitate towards
  -green-primary point chromaticity green primary point
  -interlace type      type of image interlacing scheme
  -interpolate method  pixel color interpolation method
  -label string        assign a label to an image
  -limit type value    pixel cache resource limit
  -matte               store matte channel if the image has one
  -monitor             monitor progress
  -page geometry       size and location of an image canvas (setting)
  -pointsize value     font point size
  -quality value       JPEG/MIFF/PNG compression level
  -quiet               suppress all warning messages
  -red-primary point   chromaticity red primary point
  -regard-warnings     pay attention to warning messages
  -respect-parentheses settings remain in effect until parenthesis boundary
  -sampling-factor geometry
                       horizontal and vertical sampling factor
  -scene value         image scene number
  -seed value          seed a new sequence of pseudo-random numbers
  -size geometry       width and height of image
  -support factor      resize support: > 1.0 is blurry, < 1.0 is sharp
  -synchronize         synchronize image to storage device
  -taint               declare the image as modified
  -transparent-color color
                       transparent color
  -treedepth value     color tree depth
  -tile                repeat composite operation across and down image
  -units type          the units of image resolution
  -verbose             print detailed information about the image
  -virtual-pixel method
                       virtual pixel access method
  -white-point point   chromaticity white point

Image Operators:
  -blend geometry      blend images
  -border geometry     surround image with a border of color
  -bordercolor color   border color
  -channel mask        set the image channel mask
  -colors value        preferred number of colors in the image
  -decipher filename    convert cipher pixels to plain pixels
  -displace geometry   shift lookup according to a relative displacement map
  -dissolve value      dissolve the two images a given percent
  -distort geometry    shift lookup according to a absolute distortion map
  -encipher filename   convert plain pixels to cipher pixels
  -extract geometry    extract area from image
  -geometry geometry   location of the composite image
  -identify            identify the format and characteristics of the image
  -monochrome          transform image to black and white
  -negate              replace every pixel with its complementary color 
  -profile filename    add ICM or IPTC information profile to image
  -quantize colorspace reduce colors in this colorspace
  -repage geometry     size and location of an image canvas (operator)
  -rotate degrees      apply Paeth rotation to the image
  -resize geometry     resize the image
  -sharpen geometry    sharpen the image
  -shave geometry      shave pixels from the image edges
  -stegano offset      hide watermark within an image
  -stereo geometry     combine two image to create a stereo anaglyph
  -strip               strip image of all profiles and comments
  -thumbnail geometry  create a thumbnail of the image
  -transform           affine transform image
  -type type           image type
  -unsharp geometry    sharpen the image
  -watermark geometry  percent brightness and saturation of a watermark
  -write filename      write images to this file

Image Stack Operators:
  -swap indexes        swap two images in the image sequence

Miscellaneous Options:
  -debug events        display copious debugging information
  -help                print program options
  -list type           print a list of supported option arguments
  -log format          format of debugging information
  -version             print version information

By default, the image format of 'file' is determined by its magic
number.  To specify a particular image format, precede the filename
with an image format name and a colon (i.e. ps:image) or specify the
image type as the filename suffix (i.e. image.ps).  Specify 'file' as
'-' for standard input or output. active.
- **Semgrep 1.152.0**: SAST security code scanner active.
