# retinfy.js
A javascript plugin to detect the users screen pixel screen density(for retina devices) and replace the image with a retina friendly equivalent image.
  
  
## Usage 



### Package Managers

```sh
# Bower
bower install --save retinfyjs
```



### Basic Usage
```html
<!-- Include Retinfy Library -->
<script type="text/javascript" src="./retinfy.js"></script>
<!-- Initialize -->
<script type="text/javascript">
    retinfy.init();
</script>


<!-- Set my class for any img element you want retinfyed remember to specify data-x1, data-x2, data-x3 so i know which images to replace with -->
<img class="retinfy" src="Default Image src" data-x1="src image for device pixel ratio up to 1" data-x2="src image for device pixel ratio up to 2" data-x3="src image for device pixel ratio up to 3" />
<!-- I also work with inline styling -->
<div class="retinfy" style="background: url('Default Image src')" data-x1="src image for device pixel ratio up to 1" data-x2="src image for device pixel ratio up to 2" data-x3="src image for device pixel ratio up to 3"> </div>

```

  
### Configuration Options


You can also configure customized classes and callbacks

```javascript
var settings = {
               		'@1': 'data-x1', //attribute for src image for device pixel ratio up to 1
               		'@2': 'data-x2', //attribute for src image for device pixel ratio up to 2
               		'@3': 'data-x3', //attribute for src image for device pixel ratio up to 3
               		activeClass: 'retinfy', // Class to initialize retinfy 
               		initClass: 'retinfy-loaded', // Class retinfy uses to indicate it is loaded 
               		callbackBefore: function () {}, //Callback Before it changes images
               		callbackAfter: function () {} //Callback After it changes images
               	};
retinfy.init(settings); 


```
  

## Contributing

Just Fork and commit changes, then send a pull request.
