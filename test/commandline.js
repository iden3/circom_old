const path = require("path");
const fs = require("fs");
const cmd=require("node-cmd");
const util = require("util");
const assert = require("assert");

const claimUtils = require("../src/claimUtils.js");

cmd.get[util.promisify.custom] = (c) => {
    return new Promise((resolve, reject) => {
        cmd.get(c, (err, data, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve([data, stderr]);
            }
        });
    });
};

const getAsync = util.promisify(cmd.get);
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);

describe("command line", () => {

    let tmpPath;
    before(async () => {
        tmpPath = path.join(__dirname, "..", "tmp");
        if (!fs.existsSync(tmpPath)) {
            await mkdir(tmpPath, 0o744);
        }
        process.chdir(tmpPath);
    });

    it("Should create a tree from a claim files", async () => {

        let i;
        let claims = [];
        for (i=0; i<100; i++) {
            const b = Buffer.from([ i / 256, i % 256 ]);
            claims[i] = claimUtils.buildClaim("0x01", "0x02", "0x03", b).toString("hex");
        }

        claims = claims.sort();
        const claimsFile = path.join(tmpPath, "claims100.hex");
        const dbFile = path.join(tmpPath, "claims100.db");
        await writeFile(claimsFile, claims.join("\n"), "utf8");

        await getAsync(`${path.join("..", "cli.js")} -d ${dbFile} add ${claimsFile}  `);

        const data = await getAsync(`${path.join("..", "cli.js")} -d ${dbFile} export`);
        let claims2 = data[0].split("\n");

        claims2 = claims2.filter(function(n){ return n.length>0; });
        claims2 = claims2.sort();

        assert.equal(claims2.join("\n"), claims.join("\n"));

    }).timeout(20000);
});
