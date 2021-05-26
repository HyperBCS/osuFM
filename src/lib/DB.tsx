import { createDbWorker } from "sql.js-httpvfs"

// sadly there's no good way to package workers and wasm directly so you need a way to get these two URLs from your bundler.
// This is the webpack5 way to create a asset bundle of the worker and wasm:

let dbConnection: any = null
let dbSet: boolean = false


export async function getDBConnection() {
  const workerUrl = new URL(
    "sql.js-httpvfs/dist/sqlite.worker.js",
    import.meta.url,
  );
  const wasmUrl = new URL(
    "sql.js-httpvfs/dist/sql-wasm.wasm",
    import.meta.url,
  );
  // the legacy webpack4 way is something like `import wasmUrl from "file-loader!sql.js-httpvfs/dist/sql-wasm.wasm"`.

  const worker = await createDbWorker(
    [{
      from: "inline",
      config: {
        serverMode: "full", // file is just a plain old full sqlite database
        requestChunkSize: 4096, // the page size of the  sqlite database (by default 4096)
        url: '/static/osuDB.db' // url to the database (relative or full)
      }
    }],
    workerUrl.toString(), wasmUrl.toString()
  );
  dbSet = true
  dbConnection = worker
}

export async function getMaps(page: number, rowsPerPage: number, filters: any, defaultQuery: boolean = false, skipCount: boolean = false) {

  if (!dbSet) {
    await getDBConnection()
  }

  if (defaultQuery) {
    let q1 = `SELECT COUNT(*) FROM "main"."beatmaps" WHERE "mode"=0`
    let q2 = `SELECT * FROM "main"."beatmaps" WHERE "mode"=0 ORDER BY "score" DESC LIMIT 10;`
    // worker.db is a now SQL.js instance except that all functions return Promises.
    const count = await dbConnection.db.exec(q1);
    if (count[0].values[0][0] == 0) {
      return { count }
    }
    const result = await dbConnection.db.exec(q2);

    return { result, count }

  }

  let base_query_count: string = `SELECT COUNT(*) from 'main'.'beatmaps' WHERE `
  let base_query: string = `SELECT * from 'main'.'beatmaps' WHERE `
  let mode_str = (filters.mode == 4) ? "" : `"mode"=` + filters.mode + ` AND `

  let query_params: string = ""
  if (!filters.mods_enabled) {
    query_params = mode_str +
      `avg_pp BETWEEN ` + filters.min_pp + ` AND ` + filters.max_pp + ` AND ` +
      `bpm BETWEEN ` + filters.min_bpm + ` AND ` + filters.max_bpm + ` AND ` +
      `diff BETWEEN ` + filters.min_diff + ` AND ` + filters.max_diff + ` AND ` +
      `ar BETWEEN ` + filters.min_ar + ` AND ` + filters.max_ar + ` AND ` +
      `cs BETWEEN ` + filters.min_cs + ` AND ` + filters.max_cs + ` AND ` +
      `date_ranked BETWEEN ` + filters.min_date + ` AND ` + filters.max_date + ` AND ` +
      `length BETWEEN ` + filters.min_len + ` AND ` + filters.max_len + ` `
  } else {
    let req_mods = 0
    let opt_mods = filters.opt_mods
    if (filters.req_mods % 2 != 0) {
      req_mods = filters.req_mods + 1
    } else {
      req_mods = filters.req_mods
    }


    query_params = mode_str +
      `avg_pp BETWEEN ` + filters.min_pp + ` AND ` + filters.max_pp + ` AND ` +
      `bpm BETWEEN ` + filters.min_bpm + ` AND ` + filters.max_bpm + ` AND ` +
      `diff BETWEEN ` + filters.min_diff + ` AND ` + filters.max_diff + ` AND ` +
      `ar BETWEEN ` + filters.min_ar + ` AND ` + filters.max_ar + ` AND ` +
      `cs BETWEEN ` + filters.min_cs + ` AND ` + filters.max_cs + ` AND ` +
      `length BETWEEN ` + filters.min_len + ` AND ` + filters.max_len + ` AND ` +
      `date_ranked BETWEEN ` + filters.min_date + ` AND ` + filters.max_date + ` AND ` +
      `((pop_mod & ` + req_mods + ` == ` + req_mods + ` AND ` + `pop_mod & ` + opt_mods + `) OR (pop_mod == ` + req_mods + `)) `
  }

  if (filters.search.length > 0) {
    query_params += `AND ("name" LIKE "%` + filters.search + `%" OR "artist" LIKE "%` + filters.search + `%" OR "mapper" LIKE "%` + filters.search + `%" OR "version" LIKE "%` + filters.search + `%") `
  }




  let query_params_suffix: string = `ORDER BY "score" DESC LIMIT ` + rowsPerPage + ` OFFSET ` + page * rowsPerPage + `;`
  let exec_query: string = base_query + query_params + query_params_suffix
  let exec_query_count: string = base_query_count + query_params
  console.log(exec_query)
  console.log(exec_query_count)

  // worker.db is a now SQL.js instance except that all functions return Promises.
  if (!skipCount) {
    const count = await dbConnection.db.exec(exec_query_count);
    if (count[0].values[0][0] == 0) {
      return { count }
    }
    const result = await dbConnection.db.exec(exec_query);

    return { result, count }
  } else {
    const result = await dbConnection.db.exec(exec_query);

    return { result }
  }



}