const { Engine, World, Bodies, Runner, Render } = Matter;

const width = 600;
const height = 600;

const cells = 9;

const unitLength = width / cells;


const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
}); 

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls 
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
]

World.add(world, walls);

//  Maze Generation
const grid = Array(cells).fill(null).map( () => Array(cells).fill(false) );

const verticals = Array(cells).fill(null).map( () => Array(cells-1).fill(false));

const horizentals = Array(cells-1).fill(null).map( () => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const shuffle = (arr) =>  {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp
    }

    return arr;
}

const stepThroughCell = (row, column) => {
    // If I have visited the cell at [row, column] then return
    if(grid[row][column]) {
        return;
    }

    // Mark this cell as being visited
    grid[row][column] = true;

    // Asseemble randomly ordered-list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    // For Each neighbor ...
    for (let neighbor of neighbors) {

        const [nextRow, nextColumn, direction] = neighbor; 

        // See if that neighbor is out of bounds
        if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells ) {
            continue;
        }

        // If I visited that neighbor, continue to the next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        // Remove a wall from either horizentals or verticals
        if (direction === 'left') {
            verticals[row][column - 1] = true;

        } else if (direction === 'right') {
            verticals[row][column] = true;

        } else if (direction === 'up') {
            horizentals[row - 1][column] = true;

        } else if (direction === 'down') {
            horizentals[row][column] = true;
        }

        // Visit that next cell
        stepThroughCell(nextRow, nextColumn);
    }
}

stepThroughCell(startRow, startColumn);

console.log(horizentals)
console.log(verticals)

horizentals.forEach( (row, rowIndex) => {
    row.forEach( (open, columnIndex) => {

        if (open) { return }
        
        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength / 2,
            rowIndex * unitLength + unitLength,
            unitLength,
            5,
            { isStatic: true }
        );

        World.add(world, wall)
    })
})

verticals.forEach( (row, rowIndex) => {
    row.forEach( (open, columnIndex) => {
        if (open) { return }

        const wall = Bodies.rectangle(
            columnIndex * unitLength + unitLength,
            rowIndex * unitLength + unitLength / 2,
            5,
            unitLength,
            { isStatic: true }
        );

        World.add(world, wall);
    })
})

const goal = Bodies.rectangle(
    width - unitLength / 2,
    height - unitLength / 2,
    unitLength * 0.7,
    unitLength * 0.7,
    { render: { fillStyle: 'yellow' }, isStatic: true }  
);

World.add(world, goal);