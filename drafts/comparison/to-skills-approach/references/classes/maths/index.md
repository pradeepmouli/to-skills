# maths

| Class               | Description                           |
| ------------------- | ------------------------------------- |
| [Matrix](matrix.md) | A fast matrix for 2D transformations. |

Represents a 3x3 transformation matrix:

````js
| a  c  tx |
| b  d  ty |
| 0  0  1  |
``` |
| [ObservablePoint](observablepoint.md) | The ObservablePoint object represents a location in a two-dimensional coordinate system.
Triggers a callback when its position changes.

The x and y properties represent the position on the horizontal and vertical axes, respectively. |
| [Point](point.md) | The Point object represents a location in a two-dimensional coordinate system, where `x` represents
the position on the horizontal axis and `y` represents the position on the vertical axis.

Many Pixi functions accept the `PointData` type as an alternative to `Point`,
which only requires `x` and `y` properties. |
| [Circle](circle.md) | The Circle object represents a circle shape in a two-dimensional coordinate system.
Used for drawing graphics and specifying hit areas for containers. |
| [Ellipse](ellipse.md) | The Ellipse object is used to help draw graphics and can also be used to specify a hit area for containers. |
| [Polygon](polygon.md) | A class to define a shape via user defined coordinates.
Used for creating complex shapes and hit areas with custom points. |
| [Rectangle](rectangle.md) | The `Rectangle` object represents a rectangular area defined by its position and dimensions.
Used for hit testing, bounds calculation, and general geometric operations. |
| [RoundedRectangle](roundedrectangle.md) | The `RoundedRectangle` object represents a rectangle with rounded corners.
Defined by position, dimensions and corner radius. |
| [Triangle](triangle.md) | A class to define a shape of a triangle via user defined coordinates.

Used for creating triangular shapes and hit areas with three points (x,y), (x2,y2), (x3,y3).
Points are stored in counter-clockwise order. |
````
