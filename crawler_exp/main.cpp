#include <cpr/cpr.h>
#include <nlohmann/json.hpp>
#include <vector>
#include <map>
#include <sqlite3.h>
#include <iostream>
#include <fstream>
#include <time.h>
#include <unistd.h>
#include <thread>
#include <exception>
extern "C"
{
#include "oppai.c"
}

using json = nlohmann::json;
std::vector<std::string> modes{"osu"};

// move to header soon
class Beatmap
{
public:
    Beatmap(int id, int set_id, std::string title, std::string artist, std::string mapper, float cs, float ar, float od, int length, float bpm, float diff, std::string version, int mode)
    {
        this->id = id;
        this->set_id = set_id;
        this->title = title;
        this->artist = artist;
        this->mapper = mapper;
        this->cs = cs;
        this->ar = ar;
        this->od = od;
        this->length = length;
        this->bpm = bpm;
        this->diff = diff;
        this->version = version;
        this->mode = mode;
    }
    Beatmap(){};
    // id info
    int id;
    int set_id;
    // beatmap strings
    std::string title;
    std::string artist;
    std::string mapper;
    std::string version;
    // calculated info
    int num_scores;
    int pop_mod;
    float avg_pp;
    float avg_acc;
    float avg_rank;
    float avg_pos;
    float score;
    int calculated = 0;
    // beatmap parameters
    float cs;
    float ar;
    float od;
    int length;
    float bpm;
    float diff;
    int mode;
};

class Score
{
public:
    Score(int uid, int map_id, int rank, float acc, int mods, int pos, int mode, float map_pp, float user_pp)
    {
        this->uid = uid;
        this->map_id = map_id;
        this->rank = rank;
        this->acc = acc;
        this->mods = mods;
        this->pos = pos;
        this->mode = mode;
        this->map_pp = map_pp;
        this->user_pp = user_pp;
    }

    Score(){};

    int uid;
    int map_id;
    int rank;
    float acc;
    int mods;
    int pos;
    int mode;
    float map_pp;
    float user_pp;
};

std::vector<Score> scores;
std::unordered_map<int, Beatmap *> beatmaps;

Beatmap *parseBeatmap(json beatmap)
{
    Beatmap *ret = new Beatmap(beatmap["beatmap"]["id"], beatmap["beatmap"]["beatmapset_id"], beatmap["beatmapset"]["title"],
                               beatmap["beatmapset"]["artist"], beatmap["beatmapset"]["creator"], beatmap["beatmap"]["cs"], beatmap["beatmap"]["ar"],
                               beatmap["beatmap"]["accuracy"], beatmap["beatmap"]["hit_length"], beatmap["beatmap"]["bpm"], beatmap["beatmap"]["difficulty_rating"],
                               beatmap["beatmap"]["version"], beatmap["beatmap"]["mode_int"]);
    return ret;
}

std::string intToMods(int mod_int)
{
    std::string mod_string = "";
    if (mod_int & 1 << 0)
    {
        mod_string += "NF";
    }
    if (mod_int & 1 << 1)
    {
        mod_string += "EZ";
    }
    if (mod_int & 1 << 2)
    {
        mod_string += "TD";
    }
    if (mod_int & 1 << 3)
    {
        mod_string += "HD";
    }
    if (mod_int & 1 << 4)
    {
        mod_string += "HR";
    }
    if (mod_int & 1 << 6 && !(mod_int & 1 << 9))
    {
        mod_string += "DT";
    }
    if (mod_int & 1 << 7)
    {
        mod_string += "RX";
    }
    if (mod_int & 1 << 8)
    {
        mod_string += "HT";
    }
    if (mod_int & 1 << 9)
    {
        mod_string += "NC";
    }
    if (mod_int & 1 << 10)
    {
        mod_string += "FL";
    }
    if (mod_int & 1 << 5)
    {
        mod_string += "SD";
    }
    if (mod_int & 1 << 11)
    {
        mod_string += "AP";
    }
    if (mod_int & 1 << 12)
    {
        mod_string += "SO";
    }
    if (mod_int & 1 << 13)
    {
        mod_string += "RX";
    }
    if (mod_int & 1 << 14)
    {
        mod_string += "PF";
    }
    if (mod_int & 1 << 15)
    {
        mod_string += "4K";
    }
    if (mod_int & 1 << 16)
    {
        mod_string += "5K";
    }
    if (mod_int & 1 << 17)
    {
        mod_string += "6K";
    }
    if (mod_int & 1 << 18)
    {
        mod_string += "7K";
    }
    if (mod_int & 1 << 19)
    {
        mod_string += "8K";
    }
    if (mod_int & 1 << 20)
    {
        mod_string += "FI";
    }
    if (mod_int & 1 << 21)
    {
        mod_string += "RD";
    }
    if (mod_int & 1 << 22)
    {
        mod_string += "CM";
    }
    if (mod_int & 1 << 23)
    {
        mod_string += "TP";
    }
    if (mod_int & 1 << 24)
    {
        mod_string += "9K";
    }
    if (mod_int & 1 << 25)
    {
        mod_string += "CP";
    }
    if (mod_int & 1 << 26)
    {
        mod_string += "1K";
    }
    if (mod_int & 1 << 27)
    {
        mod_string += "3K";
    }
    if (mod_int & 1 << 28)
    {
        mod_string += "2K";
    }
    if (mod_int & 1 << 30)
    {
        mod_string += "MR";
    }
    return mod_string;
}

int modsToInt(json mod_string_arr)
{
    int mods = 0;
    std::string mod_comb_str = "";
    for (json::iterator it = mod_string_arr.begin(); it != mod_string_arr.end(); ++it)
    {
        std::string mod = (*it);
        mod_comb_str += mod;
        if (mod == "NF")
        {
            mods |= 1 << 0;
        }
        else if (mod == "EZ")
        {
            mods |= 1 << 1;
        }
        else if (mod == "HD")
        {
            mods |= 1 << 3;
        }
        else if (mod == "HR")
        {
            mods |= 1 << 4;
        }
        else if (mod == "SD")
        {
            mods |= 1 << 5;
        }
        else if (mod == "DT")
        {
            mods |= 1 << 6;
        }
        else if (mod == "RX")
        {
            mods |= 1 << 7;
        }
        else if (mod == "HT")
        {
            mods |= 1 << 8;
        }
        else if (mod == "NC")
        {
            mods |= 1 << 6;
            mods |= 1 << 9;
        }
        else if (mod == "FL")
        {
            mods |= 1 << 10;
        }
        else if (mod == "TD")
        {
            mods |= 1 << 2;
        }
        else if (mod == "AP")
        {
            mods |= 1 << 11;
        }
        else if (mod == "SO")
        {
            mods |= 1 << 12;
        }
        else if (mod == "RX")
        {
            mods |= 1 << 13;
        }
        else if (mod == "PF")
        {
            mods |= 1 << 14;
        }
        else if (mod == "4K")
        {
            mods |= 1 << 15;
        }
        else if (mod == "5K")
        {
            mods |= 1 << 16;
        }
        else if (mod == "6K")
        {
            mods |= 1 << 17;
        }
        else if (mod == "7K")
        {
            mods |= 1 << 18;
        }
        else if (mod == "8K")
        {
            mods |= 1 << 19;
        }
        else if (mod == "FI")
        {
            mods |= 1 << 20;
        }
        else if (mod == "RD")
        {
            mods |= 1 << 21;
        }
        else if (mod == "CM")
        {
            mods |= 1 << 22;
        }
        else if (mod == "TP")
        {
            mods |= 1 << 23;
        }
        else if (mod == "9K")
        {
            mods |= 1 << 24;
        }
        else if (mod == "CP")
        {
            mods |= 1 << 25;
        }
        else if (mod == "1K")
        {
            mods |= 1 << 26;
        }
        else if (mod == "3K")
        {
            mods |= 1 << 27;
        }
        else if (mod == "2K")
        {
            mods |= 1 << 28;
        }
        else if (mod == "MR")
        {
            mods |= 1 << 30;
        }
    }
    return mods;
}

void parseScore(json score, json user, int pos)
{
    if (beatmaps.count(score["beatmap"]["id"]) == 0 || (beatmaps.count(score["beatmap"]["id"]) == 1 && beatmaps[score["beatmap"]["id"]]->mode != score["mode_int"]))
    {
        Beatmap *b = parseBeatmap(score);
        beatmaps.insert({b->id, b});
    }
    int mods = modsToInt(score["mods"]) & ~(MODS_MAP_PREFERENCE);
    Score ret;
    try
    {
        Score retTry(score["user"]["id"], score["beatmap"]["id"], user["pp_rank"], score["accuracy"], mods, pos, score["beatmap"]["mode_int"],
                     score["pp"], user["pp"]);
        ret = retTry;
    }
    catch (std::exception &e)
    {
        std::cout << "Null values for " << score["user"]["username"] << std::endl;
        return;
    }

    scores.push_back(ret);
}

float ci(float pos, int n)
{
    float z = 1.96;
    float phat = 1.0 * pos / n;
    return (phat + z * z / (2 * n) - z * sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / (1 + z * z / n);
}

std::string getURL(std::string url, std::string auth_string, bool checkJson)
{
    int tries = 100;
    while (tries > 0)
    {
        cpr::Response r = cpr::Get(cpr::Url{url},
                                   cpr::Timeout{1000},
                                   cpr::Header{{"Authorization", auth_string}});

        // check if response 200
        if (r.status_code != 200)
        {
            tries--;
            unsigned int microseconds = rand() % 1000000;
            usleep(microseconds);
            std::cout << "[" << r.status_code << "]"
                      << "[" << (100 - tries) << "]"
                      << "Retry... " << url << std::endl;
            if (tries == 0)
            {
                std::cout << "BAD DATA\n";
                exit(-1);
            }
            continue;
        }
        try
        {
            if (checkJson)
            {
                json j = json::parse(r.text);
            }
            return r.text;
        }
        catch (std::exception &e)
        {
            tries--;
            continue;
        }
    }
    return "";
}

void processMaps(std::vector<Beatmap *> &processed_maps)
{
    float threshold = 0.33;
    // key is map id
    std::unordered_map<int, std::unordered_map<int, std::vector<Score>>> map_map_scores;
    std::unordered_map<int, int> map_score_num;
    for (auto score : scores)
    {
        if (map_map_scores.count(score.map_id) == 0)
        {
            std::unordered_map<int, std::vector<Score>> map_scores;
            map_map_scores[score.map_id] = map_scores;
            map_score_num[score.map_id] = 0;
        }
        else
        {
            map_score_num[score.map_id]++;
        }
        if (map_map_scores[score.map_id].count(score.mods) == 0)
        {
            std::vector<Score> sc_list;
            map_map_scores[score.map_id][score.mods] = sc_list;
            map_map_scores[score.map_id][score.mods].push_back(score);
        }
        else
        {
            map_map_scores[score.map_id][score.mods].push_back(score);
        }
    }

    for (auto map : beatmaps)
    {
        // map of mods to scores

        int bid = map.second->id;
        std::unordered_map<int, std::vector<Score>> map_scores = map_map_scores[bid];
        int num_scores = map_score_num[bid];

        for (auto mod_list : map_scores)
        {

            std::string mod_str = intToMods(mod_list.first);
            float avg_pp = 0;
            float avg_rank = 0;
            float avg_pos = 0;
            float avg_acc = 0;
            float pos_sum = 0;
            int count_mod = mod_list.second.size();
            int real_count = 0;
            float count_pos = 0;
            for (auto score : mod_list.second)
            {
                float pow_val = pow(1-.0529652,score.pos)+.0529652;
                count_pos += pow_val;
                pos_sum += pow_val;
                avg_pp += score.map_pp * pow_val;
                avg_pos += score.pos * pow_val;
                avg_rank += score.rank * pow_val;
                avg_acc += score.acc * pow_val;
            }
            if (count_mod < 50 || (count_pos / count_mod < threshold))
            {
                continue;
            }
            float top_mods = 1.0 * count_pos / count_mod;
            avg_pp /= pos_sum;
            avg_rank /= pos_sum;
            avg_pos /= pos_sum;
            avg_acc /= pos_sum;
            float scaled_pos = num_scores * top_mods;
            float ci_score = ci(scaled_pos, num_scores);
            Beatmap *new_map = new Beatmap;
            *new_map = *map.second;
            bool found = false;
            for (auto m : processed_maps)
            {
                if (m->id == map.second->id && m->mode == map.second->mode && m->pop_mod == mod_list.first)
                {
                    new_map = m;
                    found = true;
                }
            }
            new_map->pop_mod = mod_list.first;
            new_map->num_scores = count_mod;
            new_map->avg_pp = avg_pp;
            new_map->avg_acc = avg_acc;
            new_map->avg_rank = avg_rank;
            new_map->avg_pos = avg_pos;
            new_map->score = ci_score;
            if (!found)
            {
                processed_maps.push_back(new_map);
            }
        }
    }
    std::vector<float>max_score(4,0);
    for (auto m : processed_maps)
    {
        if (m->score > max_score[m->mode])
        {
            max_score[m->mode] = m->score;
        }
    }
    for (auto m : processed_maps){m->score /= max_score[m->mode];}

    std::cout << "Calculating diffs for " << processed_maps.size() << std::endl;
    int count = 0;
    for (auto p_map : processed_maps)
    {
        count++;
        std::cout << "Processing map [" << count << "/" << processed_maps.size() << "]\n";

        if (p_map->calculated || (p_map->mode != 0 && p_map->mode != 1) || !((p_map->pop_mod & ((1 << 1) + (1 << 4) + (1 << 6) + (1 << 8))) > 0))
        {
            p_map->calculated = 1;
            continue;
        }
        p_map->calculated = 1;
        std::string bmap_url = "https://osu.ppy.sh/osu/" + std::to_string(p_map->id);
        std::string map_text = getURL(bmap_url, "", false);
        try
        {
            ezpp_t ez = ezpp_new();
            ezpp_set_mode(ez, p_map->mode);
            ezpp_set_mods(ez, p_map->pop_mod);
            ezpp_data(ez, (char *)map_text.c_str(), map_text.length());
            p_map->diff = ezpp_stars(ez);
            p_map->ar = ezpp_ar(ez);
            p_map->cs = ezpp_cs(ez);
            p_map->od = ezpp_od(ez);
            if (p_map->pop_mod & (1 << 6))
            {
                p_map->length /= 1.5;
                p_map->bpm *= 1.5;
            }
            else if (p_map->pop_mod & (1 << 8))
            {
                p_map->length *= 1.5;
                p_map->bpm /= 1.5;
            }
        }
        catch (std::exception &e)
        {
            std::cout << "Exception caught handling map " << p_map->id << std::endl;
        }
    }

    // for(std::thread & th : thread_list){
    //     th.join();
    // }
}

static int callback(void *NotUsed, int argc, char **argv, char **azColName)
{
    int i;
    for (i = 0; i < argc; i++)
    {
        printf("%s = %s\n", azColName[i], argv[i] ? argv[i] : "NULL");
    }
    printf("\n");
    return 0;
}

void createInsert(Beatmap *map, sqlite3_stmt **stmt, sqlite3 *db, char *title, char *artist, char *mapper, char *version)
{

    char sql[1000];
    bzero(sql, 1000);
    snprintf(sql, 1000, "REPLACE INTO 'main'.'beatmaps'('bid','sid','name','artist','mapper','num_scores','pop_mod','avg_pp','avg_acc','avg_rank','avg_pos','mode','cs','ar','od','length','bpm','diff','version','score','calculated') VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);");
    int rc = sqlite3_prepare_v2(db, sql, -1, stmt, 0);

    sqlite3_bind_int(*stmt, 1, map->id);
    sqlite3_bind_int(*stmt, 2, map->set_id);
    sqlite3_bind_text(*stmt, 3, title, map->title.length(), 0);
    sqlite3_bind_text(*stmt, 4, artist, map->artist.length(), 0);
    sqlite3_bind_text(*stmt, 5, mapper, map->mapper.length(), 0);
    sqlite3_bind_int(*stmt, 6, map->num_scores);
    sqlite3_bind_int(*stmt, 7, map->pop_mod);
    sqlite3_bind_double(*stmt, 8, map->avg_pp);
    sqlite3_bind_double(*stmt, 9, map->avg_acc);
    sqlite3_bind_double(*stmt, 10, map->avg_rank);
    sqlite3_bind_double(*stmt, 11, map->avg_pos);
    sqlite3_bind_int(*stmt, 12, map->mode);
    sqlite3_bind_double(*stmt, 13, map->cs);
    sqlite3_bind_double(*stmt, 14, map->ar);
    sqlite3_bind_double(*stmt, 15, map->od);
    sqlite3_bind_int(*stmt, 16, map->length);
    sqlite3_bind_double(*stmt, 17, map->bpm);
    sqlite3_bind_double(*stmt, 18, map->diff);
    sqlite3_bind_text(*stmt, 19, version, map->version.length(), 0);
    sqlite3_bind_double(*stmt, 20, map->score);
    sqlite3_bind_int(*stmt, 21, 1);
    if (rc)
    {
        fprintf(stderr, "Can't prepare query: %s\n", sqlite3_errmsg(db));
        std::cout << "SQL is " << sqlite3_expanded_sql(*stmt) << std::endl;
    }
    return;
}

void createInsertScore(Score score, sqlite3_stmt **stmt, sqlite3 *db)
{

    char sql[1000];
    bzero(sql, 1000);
    snprintf(sql, 1000, "REPLACE INTO 'main'.'scores'('uid','map_id','rank','acc','mods','pos','mode','map_pp','user_pp') VALUES (?,?,?,?,?,?,?,?,?);");
    int rc = sqlite3_prepare_v2(db, sql, -1, stmt, 0);

    sqlite3_bind_int(*stmt, 1, score.uid);
    sqlite3_bind_int(*stmt, 2, score.map_id);
    sqlite3_bind_int(*stmt, 3, score.rank);
    sqlite3_bind_double(*stmt, 4, score.acc);
    sqlite3_bind_int(*stmt, 5, score.mods);
    sqlite3_bind_int(*stmt, 6, score.pos);
    sqlite3_bind_int(*stmt, 7, score.mode);
    sqlite3_bind_double(*stmt, 8, score.map_pp);
    sqlite3_bind_double(*stmt, 9, score.user_pp);
    if (rc)
    {
        fprintf(stderr, "Can't prepare query: %s\n", sqlite3_errmsg(db));
        std::cout << "SQL is " << sqlite3_expanded_sql(*stmt) << std::endl;
    }
    return;
}

void updateDB(std::vector<Beatmap *> &maps)
{
    sqlite3 *db;
    int rc;

    rc = sqlite3_open("osuFM.db", &db);

    if (rc)
    {
        fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
        return;
    }
    else
    {
        fprintf(stderr, "Opened database successfully\n");
    }
    std::cout << "Starting DB update\n";
    int count = 0;
    for (auto map : maps)
    {
        count++;
        sqlite3_stmt *stmt;
        char *title = new char[map->title.length() + 1];
        std::strcpy(title, map->title.c_str());
        char *artist = new char[map->artist.length() + 1];
        std::strcpy(artist, map->artist.c_str());
        char *mapper = new char[map->mapper.length() + 1];
        std::strcpy(mapper, map->mapper.c_str());
        char *version = new char[map->version.length() + 1];
        std::strcpy(version, map->version.c_str());
        createInsert(map, &stmt, db, title, artist, mapper, version);
        int rc2 = sqlite3_step(stmt);
        if (rc2 != SQLITE_DONE)
        {
            printf("ERROR inserting data: %s\n", sqlite3_errmsg(db));
            std::cout << "SQL is " << sqlite3_expanded_sql(stmt) << std::endl;
            continue;
        }
        else
        {
            sqlite3_finalize(stmt);
        }
        delete title;
        delete artist;
        delete mapper;
        delete version;
        std::cout << "Added map [" << count << "/" << maps.size() << "] to db\n";
    }

    sqlite3_close(db);
}

void updateDBTest()
{
    sqlite3 *db;
    int rc;

    rc = sqlite3_open("data.db", &db);

    if (rc)
    {
        fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
        return;
    }
    else
    {
        fprintf(stderr, "Opened database successfully\n");
    }
    std::cout << "Starting DB update\n";
    int count = 0;
    for (auto map : beatmaps)
    {
        count++;
        sqlite3_stmt *stmt;
        char *title = new char[map.second->title.length() + 1];
        std::strcpy(title, map.second->title.c_str());
        char *artist = new char[map.second->artist.length() + 1];
        std::strcpy(artist, map.second->artist.c_str());
        char *mapper = new char[map.second->mapper.length() + 1];
        std::strcpy(mapper, map.second->mapper.c_str());
        char *version = new char[map.second->version.length() + 1];
        std::strcpy(version, map.second->version.c_str());
        createInsert(map.second, &stmt, db, title, artist, mapper, version);
        int rc2 = sqlite3_step(stmt);
        if (rc2 != SQLITE_DONE)
        {
            printf("ERROR inserting data: %s\n", sqlite3_errmsg(db));
            std::cout << "SQL is " << sqlite3_expanded_sql(stmt) << std::endl;
            continue;
        }
        else
        {
            sqlite3_finalize(stmt);
        }
        delete title;
        delete artist;
        delete mapper;
        delete version;
        std::cout << "Added map [" << count << "/" << beatmaps.size() << "] to db\n";
    }
    count = 0;
    for (auto score : scores)
    {
        count++;
        sqlite3_stmt *stmt;
        createInsertScore(score, &stmt, db);
        int rc2 = sqlite3_step(stmt);
        if (rc2 != SQLITE_DONE)
        {
            printf("ERROR inserting data: %s\n", sqlite3_errmsg(db));
            std::cout << "SQL is " << sqlite3_expanded_sql(stmt) << std::endl;
            continue;
        }
        else
        {
            sqlite3_finalize(stmt);
        }
        std::cout << "Added score [" << count << "/" << scores.size() << "] to db\n";
    }


    sqlite3_close(db);
}

static int callbackPopulate(void *no_maps, int argc, char **argv, char **azColName)
{

    std::vector<Beatmap *> *map_obj = (std::vector<Beatmap *> *)no_maps;
    int i;
    Beatmap *m = new Beatmap;
    for (i = 0; i < argc; i++)
    {
        std::string col(azColName[i]);
        if (col == "bid")
        {
            m->id = std::atoi(argv[i]);
        }
        else if (col == "sid")
        {
            m->set_id = std::atoi(argv[i]);
        }
        else if (col == "name")
        {
            m->title = std::string(argv[i]);
        }
        else if (col == "artist")
        {
            m->artist = std::string(argv[i]);
        }
        else if (col == "mapper")
        {
            m->mapper = std::string(argv[i]);
        }
        else if (col == "num_scores")
        {
            m->num_scores = std::atoi(argv[i]);
        }
        else if (col == "pop_mod")
        {
            m->pop_mod = std::atoi(argv[i]);
        }
        else if (col == "avg_pp")
        {
            m->avg_pp = std::stof(argv[i]);
        }
        else if (col == "avg_acc")
        {
            m->avg_acc = std::stof(argv[i]);
        }
        else if (col == "avg_rank")
        {
            m->avg_rank = std::stof(argv[i]);
        }
        else if (col == "avg_pos")
        {
            m->avg_pos = std::stof(argv[i]);
        }
        else if (col == "mode")
        {
            m->mode = std::atoi(argv[i]);
        }
        else if (col == "cs")
        {
            m->cs = std::stof(argv[i]);
        }
        else if (col == "ar")
        {
            m->ar = std::stof(argv[i]);
        }
        else if (col == "od")
        {
            m->od = std::stof(argv[i]);
        }
        else if (col == "length")
        {
            m->length = std::atoi(argv[i]);
        }
        else if (col == "bpm")
        {
            m->bpm = std::stof(argv[i]);
        }
        else if (col == "diff")
        {
            m->diff = std::stof(argv[i]);
        }
        else if (col == "version")
        {
            m->version = std::string(argv[i]);
        }
        else if (col == "score")
        {
            m->score = std::stof(argv[i]);
        }
        else if (col == "calculated")
        {
            m->calculated = std::atoi(argv[i]);
        }
    }
    map_obj->push_back(m);
    return 0;
}

static int callbackPopulateMaps(void *no_maps, int argc, char **argv, char **azColName)
{
    int i;
    Beatmap *m = new Beatmap;
    for (i = 0; i < argc; i++)
    {
        std::string col(azColName[i]);
        if (col == "bid")
        {
            m->id = std::atoi(argv[i]);
        }
        else if (col == "sid")
        {
            m->set_id = std::atoi(argv[i]);
        }
        else if (col == "name")
        {
            m->title = std::string(argv[i]);
        }
        else if (col == "artist")
        {
            m->artist = std::string(argv[i]);
        }
        else if (col == "mapper")
        {
            m->mapper = std::string(argv[i]);
        }
        else if (col == "mode")
        {
            m->mode = std::atoi(argv[i]);
        }
        else if (col == "cs")
        {
            m->cs = std::stof(argv[i]);
        }
        else if (col == "ar")
        {
            m->ar = std::stof(argv[i]);
        }
        else if (col == "od")
        {
            m->od = std::stof(argv[i]);
        }
        else if (col == "length")
        {
            m->length = std::atoi(argv[i]);
        }
        else if (col == "bpm")
        {
            m->bpm = std::stof(argv[i]);
        }
        else if (col == "diff")
        {
            m->diff = std::stof(argv[i]);
        }
        else if (col == "version")
        {
            m->version = std::string(argv[i]);
        }
    }
    beatmaps.insert({m->id, m});
    return 0;
}

static int callbackPopulateScore(void *no_maps, int argc, char **argv, char **azColName)
{
    int i;
    static int count = 0;
    for (i = 0; i < argc; i++)
    {
        count++;
        Score s;
        switch(i){
            case(1):
                s.uid = std::atoi(argv[i]);
                break;
            case(2):
                s.map_id = std::atoi(argv[i]);
                break;
            case(3):
                s.rank = std::atoi(argv[i]);
                break;
            case(4):
                s.acc = std::stof(argv[i]);
                break;
            case(5):
                s.mods = std::atoi(argv[i]);
                break;
            case(6):
                s.pos = std::atoi(argv[i]);
                break;
            case(7):
                s.mode = std::atoi(argv[i]);
                break;
            case(8):
                s.map_pp = std::stof(argv[i]);
                break;
            case(9):
                s.user_pp = std::stof(argv[i]);
                break;
        }
        scores.push_back(s);
        if(count % 100000 == 0){
            std::cout << "Loaded score " <<  count << "\n";
        }
        
    }
    return 0;
}

void createTables()
{
    sqlite3 *db;
    char *zErrMsg = 0;
    int rc;

    rc = sqlite3_open("data.db", &db);

    if (rc)
    {
        fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
        return;
    }
    else
    {
        fprintf(stderr, "Opened database successfully\n");
    }

    /* Create SQL statement */
    std::string sql1 = "CREATE TABLE IF NOT EXISTS 'beatmaps' ("
                      "'bid'	INTEGER NOT NULL,"
                      "'sid'	INTEGER NOT NULL,"
                      "'name'	TEXT NOT NULL,"
                      "'artist'	TEXT NOT NULL,"
                      "'mapper'	TEXT NOT NULL,"
                      "'num_scores'	INTEGER NOT NULL,"
                      "'pop_mod'	INTEGER NOT NULL,"
                      "'avg_pp'	REAL NOT NULL,"
                      "'avg_acc'	REAL NOT NULL,"
                      "'avg_rank'	INTEGER NOT NULL,"
                      "'avg_pos'	INTEGER NOT NULL,"
                      "'mode'	INTEGER NOT NULL,"
                      "'cs'	REAL NOT NULL,"
                      "'ar'	REAL NOT NULL,"
                      "'od'	REAL NOT NULL,"
                      "'length'	INTEGER NOT NULL,"
                      "'bpm'	REAL NOT NULL,"
                      "'diff'	REAL NOT NULL,"
                      "'version'	TEXT NOT NULL,"
                      "'score'	REAL NOT NULL,"
                      "'calculated'	INTEGER,"
                      "PRIMARY KEY('bid','mode','pop_mod'));";
    std::string sql2 = "CREATE TABLE IF NOT EXISTS 'scores' ("
                      "'id'	INTEGER PRIMARY KEY AUTOINCREMENT,"
                      "'uid'	INTEGER,"
                      "'map_id'	INTEGER,"
                      "'rank'	INTEGER,"
                      "'acc'	REAL,"
                      "'mods'	INTEGER,"
                      "'pos'	INTEGER,"
                      "'mode'	INTEGER,"
                      "'map_pp'	REAL,"
                      "'user_pp'	REAL);";

    rc = sqlite3_exec(db, sql1.c_str(), callback, 0, &zErrMsg);

    if (rc != SQLITE_OK)
    {
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
    }
    else
    {
        fprintf(stdout, "Beatmap table created successfully\n");
    }
    rc = sqlite3_exec(db, sql2.c_str(), callback, 0, &zErrMsg);

    if (rc != SQLITE_OK)
    {
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
    }
    else
    {
        fprintf(stdout, "Score table created successfully\n");
    }
    sqlite3_close(db);
}

void populateFromTestDB()
{
    std::cout << "Loading Data\n";
    sqlite3 *db;
    char *zErrMsg = 0;
    int rc;

    rc = sqlite3_open("data.db", &db);

    std::string sql = "SELECT * from 'main'.'scores';";

    rc = sqlite3_exec(db, sql.c_str(), callbackPopulateScore, 0, &zErrMsg);

    if (rc != SQLITE_OK)
    {
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
    }
    else
    {
        fprintf(stderr, "Loaded Scores Successfully \n");
    }
    /* Create SQL statement */
    std::string sql2 = "SELECT * from 'main'.'beatmaps';";
    int rc2 = sqlite3_exec(db, sql2.c_str(), callbackPopulateMaps, 0, &zErrMsg);
    std::cout << "Loaded " << beatmaps.size() << " from existing DB\n";
    if (rc2 != SQLITE_OK)
    {
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
    }
    else
    {
        fprintf(stdout, "Loaded test Beatmaps Successfully\n");
    }

    sqlite3_close(db);
}



void populateFromDB(std::vector<Beatmap *> &no_maps)
{
    sqlite3 *db;
    char *zErrMsg = 0;
    int rc;

    rc = sqlite3_open("osuFM.db", &db);

    if (rc)
    {
        fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
        return;
    }
    else
    {
        fprintf(stderr, "Opened database successfully\n");
    }

    /* Create SQL statement */
    std::string sql = "CREATE TABLE IF NOT EXISTS 'beatmaps' ("
                      "'bid'	INTEGER NOT NULL,"
                      "'sid'	INTEGER NOT NULL,"
                      "'name'	TEXT NOT NULL,"
                      "'artist'	TEXT NOT NULL,"
                      "'mapper'	TEXT NOT NULL,"
                      "'num_scores'	INTEGER NOT NULL,"
                      "'pop_mod'	INTEGER NOT NULL,"
                      "'avg_pp'	REAL NOT NULL,"
                      "'avg_acc'	REAL NOT NULL,"
                      "'avg_rank'	INTEGER NOT NULL,"
                      "'avg_pos'	INTEGER NOT NULL,"
                      "'mode'	INTEGER NOT NULL,"
                      "'cs'	REAL NOT NULL,"
                      "'ar'	REAL NOT NULL,"
                      "'od'	REAL NOT NULL,"
                      "'length'	INTEGER NOT NULL,"
                      "'bpm'	REAL NOT NULL,"
                      "'diff'	REAL NOT NULL,"
                      "'version'	TEXT NOT NULL,"
                      "'score'	REAL NOT NULL,"
                      "'calculated'	INTEGER,"
                      "PRIMARY KEY('bid','mode','pop_mod'));";
    rc = sqlite3_exec(db, sql.c_str(), callback, 0, &zErrMsg);

    if (rc != SQLITE_OK)
    {
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
    }
    else
    {
        fprintf(stdout, "Table created successfully\n");
    }

    /* Create SQL statement */
    std::string sql2 = "SELECT * from 'main'.'beatmaps';";
    int rc2 = sqlite3_exec(db, sql2.c_str(), callbackPopulate, (void *)&no_maps, &zErrMsg);
    std::cout << "Loaded " << no_maps.size() << " from existing DB\n";
    if (rc2 != SQLITE_OK)
    {
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
    }
    else
    {
        fprintf(stdout, "Operation done successfully\n");
    }

    sqlite3_close(db);
}

void getUserData(json *j, std::string auth_string, int user_id, std::string mode)
{
    std::string best_url = "https://osu.ppy.sh/api/v2/users/" + std::to_string(user_id) + "/scores/best?mode=" + mode + "&limit=100";
    *j = json::parse(getURL(best_url, auth_string, true));
}

void loadData(){
    std::ifstream i("maps.json");
    json j;
    i >> j;
    for(auto beatmap : j){
        Beatmap *ret = new Beatmap(beatmap["id"], beatmap["set_id"], beatmap["title"],
                               beatmap["artist"], beatmap["mapper"], beatmap["cs"], beatmap["ar"],
                               beatmap["od"], beatmap["length"], beatmap["bpm"], beatmap["diff"],
                               beatmap["version"], beatmap["mode"]);
        beatmaps.insert({beatmap["id"], ret});
    }

    std::ifstream k("scores.json");
    json l;
    k >> l;
    for(auto score : l){
        Score ret(score["uid"], score["map_id"], score["rank"], score["acc"], score["mods"], score["pos"], score["mode"],
                score["map_pp"], score["user_pp"]);
        scores.push_back(ret);
    }

}

void saveData(){
    json score_json;
    json map_json;
    for(auto score : scores){
        score_json.push_back({
            {"uid", score.uid},
            {"map_id", score.map_id},
            {"rank", score.rank},
            {"acc", score.acc},
            {"mods", score.mods},
            {"pos", score.pos},
            {"mode", score.mode},
            {"map_pp", score.map_pp},
            {"user_pp", score.user_pp}
        });
    }
    std::ofstream o("scores.json");
    o << score_json << std::endl;

    for(auto map : beatmaps){
        map_json.push_back({
        {"id", map.second->id},
        {"set_id", map.second->set_id},
        {"title", map.second->title},
        {"artist", map.second->artist},
        {"mapper", map.second->mapper},
        {"cs", map.second->cs},
        {"ar", map.second->ar},
        {"od", map.second->od},
        {"length", map.second->length},
        {"bpm", map.second->bpm},
        {"diff", map.second->diff},
        {"version", map.second->version},
        {"mode", map.second->mode}
        });
    }
    std::ofstream o2("maps.json");
    o2 << map_json << std::endl;

}

int main()
{
    srand(time(NULL));
    std::vector<Beatmap *> new_maps;
    createTables();
    populateFromTestDB();
    // populateFromDB(new_maps);
    // read a JSON file
    std::ifstream i("conf.json");
    json j;
    i >> j;

    cpr::Response r = cpr::Post(cpr::Url{"https://osu.ppy.sh/oauth/token"},
                                cpr::Header{{"Content-Type", "application/json"}},
                                cpr::Body{j.dump()}); // JSON text string
    json auth = json::parse(r.text);

    std::string access_token = auth["access_token"];
    std::string auth_string = "Bearer " + access_token;
    std::cout << auth_string << std::endl;
    int max_pages = j["max_pages"];
    for (auto mode : modes)
    {
        // updateDBTest();
        // std::string url = "https://osu.ppy.sh/api/v2/rankings/" + mode + "/country";
        // json countries = json::parse(getURL(url, auth_string, true))["ranking"];
        // for (auto country_obj : countries)
        // {
        //     bool reached100k = false;
        //     std::string country = country_obj["code"];
        //     std::cout << "Starting country [" << country << "]\n";
        //     for (int i = 1; i <= max_pages; i++)
        //     {
        //         if (reached100k)
        //         {
        //             break;
        //         }
        //         std::cout << "[" << mode << "]" <<"[" << country << "]" << "Starting page" <<  "[" << i << "/" << max_pages << "]\n";

        //         std::string url = "https://osu.ppy.sh/api/v2/rankings/" + mode + "/performance?cursor[page]=" + std::to_string(i) + "&country=" + country;
        //         json users = json::parse(getURL(url, auth_string, true))["ranking"];

        //         std::unordered_map<int, json> user_map;
        //         std::unordered_map<int, json *> user_score_map;
        //         std::vector<std::thread> thread_list;
        //         for (json::iterator it = users.begin(); it != users.end(); ++it)
        //         {
        //             json *j = new json;
        //             int user_id = (*it)["user"]["id"];
        //             try
        //             {
        //                 if ((*it)["pp"] < 1000)
        //                 {
        //                     reached100k = true;
        //                     break;
        //                 }
        //             }
        //             catch (std::exception &e)
        //             {
        //                 std::cout << "Null values for " << (*it)["user"]["username"] << std::endl;
        //                 continue;
        //             }
        //             user_score_map[user_id] = j;
        //             user_map[user_id] = (*it);
        //             std::thread cpr_thread(getUserData, j, auth_string, user_id, mode);
        //             thread_list.push_back(std::move(cpr_thread));
        //         }
        //         for (std::thread &th : thread_list)
        //         {
        //             th.join();
        //         }
        //         for (auto it : user_score_map)
        //         {
        //             json score_json = *(it.second);
        //             int pos = 0;
        //             for (json::iterator it2 = score_json.begin(); it2 != score_json.end(); ++it2)
        //             {
        //                 pos++;
        //                 parseScore((*it2), user_map[it.first], pos);
        //             }
        //         }
        //         for (auto map_pt : user_score_map)
        //         {
        //             delete map_pt.second;
        //         }
        //     }
        // }
        // saveData();
        // processMaps(new_maps);
        // std::cout << new_maps.size() << " processed maps" << std::endl;
        // updateDB(new_maps);
        // for (auto map_pt : beatmaps)
        // {
        //     delete map_pt.second;
        // }
        scores.clear();
        beatmaps.clear();
    }
    for (auto map_pt : new_maps)
    {
        delete map_pt;
    }
    return 0;
}