import fsPromises from "fs/promises";

async function countFiles(path) {
    let count = 0;
    let files = await fsPromises.readdir(path, { withFileTypes: true });
    for (const file of files) {
        if (file.isFile()) {
            console.log(file.name);
            if (file.name.endsWith(".md")) {
                count++;
            }
        } else {
            count += await countFiles(`${path}/${file.name}`);
        }
    }

    return count;
}

countFiles("./docs").then((count) => {
    // 去掉index.md
    console.log(count - 1);
});
